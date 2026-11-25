import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTokens } from '../../lib/motion-tokens';

/*
 * Live system map. A canvas architecture diagram where every simulated request
 * travels as a packet: client → gateway → auth → api → cache / database / LLM,
 * then the response flows back. Each request lands in the log underneath only
 * when its response reaches the client, so the map and the log stay in sync.
 * Traffic and latencies are illustrative; the header says "simulated".
 */

type NodeId = 'client' | 'gateway' | 'auth' | 'api' | 'redis' | 'postgres' | 'llm';

const NODES: Record<NodeId, { x: number; y: number; label: string; info: string }> = {
  client: { x: 0.0, y: 0.5, label: 'client', info: 'Web app built with React / Next.js' },
  gateway: { x: 0.22, y: 0.5, label: 'gateway', info: 'nginx: validates and rate-limits requests' },
  auth: { x: 0.44, y: 0.14, label: 'auth', info: 'JWT login + role-based permissions' },
  api: { x: 0.62, y: 0.5, label: 'api', info: 'Typed services in Nest.js / Spring Boot' },
  redis: { x: 1.0, y: 0.08, label: 'redis', info: 'Redis cache for frequently read data' },
  postgres: { x: 1.0, y: 0.5, label: 'postgres', info: 'PostgreSQL main database, via Prisma' },
  llm: { x: 1.0, y: 0.92, label: 'llm', info: 'OpenAI integration, streamed replies' },
};

const TOUR: NodeId[] = ['client', 'gateway', 'auth', 'api', 'redis', 'postgres', 'llm'];
const TOUR_MS = 2600;
const TOUR_RESUME_MS = 4000;

const EDGES: [NodeId, NodeId][] = [
  ['client', 'gateway'],
  ['gateway', 'auth'],
  ['auth', 'api'],
  ['api', 'redis'],
  ['api', 'postgres'],
  ['api', 'llm'],
];

type Entry = {
  method: 'GET' | 'POST';
  path: string;
  status: number;
  ms: number;
  note: string;
  route: NodeId[];
  stream?: boolean;
};

const EDGE_PATH: NodeId[] = ['client', 'gateway', 'auth', 'api'];

const SCRIPT: Entry[] = [
  { method: 'POST', path: '/api/auth/login', status: 200, ms: 41, note: 'jwt issued · role=insurer', route: [...EDGE_PATH, 'postgres'] },
  { method: 'GET', path: '/api/eligibility', status: 200, ms: 9, note: 'cache HIT · redis', route: [...EDGE_PATH, 'redis'] },
  { method: 'POST', path: '/api/claims', status: 201, ms: 38, note: 'rbac ✓ · row inserted', route: [...EDGE_PATH, 'postgres'] },
  { method: 'GET', path: '/api/reports', status: 200, ms: 94, note: 'cache MISS · postgres', route: [...EDGE_PATH, 'redis', 'api', 'postgres'] },
  { method: 'POST', path: '/api/chat', status: 200, ms: 612, note: 'llm stream', route: [...EDGE_PATH, 'llm'], stream: true },
  { method: 'GET', path: '/api/admin/users', status: 403, ms: 6, note: 'rbac ✗ · role=patient', route: ['client', 'gateway', 'auth'] },
  { method: 'GET', path: '/api/dashboard', status: 200, ms: 17, note: 'cache HIT · redis', route: [...EDGE_PATH, 'redis'] },
];

const MAX_LINES = 5;
const SPAWN_MS = 1500;
const HOP_MS = 230;
const LLM_HOP_MS = 650;

type Line = Omit<Entry, 'route' | 'stream'> & { id: number; time: string };

type Packet = {
  path: NodeId[];
  start: number;
  kind: 'req' | 'res' | 'err';
  size: number;
  entry: Entry;
  id: number;
  done?: boolean;
  final: boolean; // fires the log line when it reaches the end
  trail: { x: number; y: number }[];
};

const hopDuration = (a: NodeId, b: NodeId) => (a === 'llm' || b === 'llm' ? LLM_HOP_MS : HOP_MS);

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const toLine = (e: Entry, id: number): Line => ({
  method: e.method,
  path: e.path,
  status: e.status,
  ms: e.ms,
  note: e.note,
  id,
  time: new Date().toTimeString().slice(0, 8),
});

type Palette = { accent: string; warn: string; border: string; card: string; muted: string; text: string };

const readPalette = (): Palette => {
  const s = getComputedStyle(document.documentElement);
  const dark = document.documentElement.classList.contains('dark');
  return {
    accent: s.getPropertyValue('--color-accent').trim() || '#3ee08f',
    warn: s.getPropertyValue('--color-warn').trim() || '#fbbf24',
    border: s.getPropertyValue('--color-border').trim() || 'rgba(255,255,255,0.1)',
    card: s.getPropertyValue('--color-card').trim() || '#0e1113',
    muted: '#6b7280',
    text: dark ? '#e5e7eb' : '#111827',
  };
};

export const SystemMap: React.FC = () => {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<NodeId | null>(null);
  const lineId = useRef(MAX_LINES);
  const [hover, setHover] = useState<{ id: NodeId; x: number; y: number } | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [lines, setLines] = useState<Line[]>(() =>
    SCRIPT.slice(0, MAX_LINES).map((e, i) => toLine(e, i)),
  );

  const pushLine = useCallback((e: Entry) => {
    const id = lineId.current++;
    setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), toLine(e, id)]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let palette = readPalette();
    const themeObs = new MutationObserver(() => {
      palette = readPalette();
      if (reduce) draw(performance.now());
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) draw(performance.now());
    };

    const pos = (id: NodeId) => {
      const n = NODES[id];
      const padX = 30;
      const padTop = 22;
      const padBottom = 30;
      return { x: padX + n.x * (w - padX * 2), y: padTop + n.y * (h - padTop - padBottom) };
    };

    const packets: Packet[] = [];
    const pulse: Partial<Record<NodeId, { t: number; err: boolean }>> = {};
    let packetId = 0;
    let scriptIdx = MAX_LINES;
    let lastSpawn = -Infinity;
    let raf = 0;
    let running = false;

    const spawn = (now: number) => {
      const entry = SCRIPT[scriptIdx++ % SCRIPT.length];
      packets.push({ path: entry.route, start: now, kind: 'req', size: 3.2, entry, id: packetId++, final: false, trail: [] });
    };

    const packetPos = (p: Packet, now: number) => {
      let elapsed = now - p.start;
      for (let i = 0; i < p.path.length - 1; i++) {
        const d = hopDuration(p.path[i], p.path[i + 1]);
        if (elapsed <= d) {
          const a = pos(p.path[i]);
          const b = pos(p.path[i + 1]);
          const t = ease(elapsed / d);
          return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, hop: i, arrived: false };
        }
        elapsed -= d;
        // passed a node: pulse it once
      }
      const end = pos(p.path[p.path.length - 1]);
      return { x: end.x, y: end.y, hop: p.path.length - 1, arrived: true };
    };

    const onArrive = (p: Packet, now: number) => {
      const last = p.path[p.path.length - 1];
      if (p.kind === 'req') {
        const failed = p.entry.status >= 400;
        pulse[last] = { t: now, err: failed };
        const back = [...p.path].reverse();
        if (p.entry.stream) {
          // Streamed LLM response: several small chunks instead of one packet
          for (let k = 0; k < 4; k++) {
            packets.push({ path: back, start: now + k * 110, kind: 'res', size: 2, entry: p.entry, id: packetId++, final: k === 3, trail: [] });
          }
        } else {
          packets.push({ path: back, start: now + 60, kind: failed ? 'err' : 'res', size: 2.6, entry: p.entry, id: packetId++, final: true, trail: [] });
        }
      } else {
        pulse.client = { t: now, err: p.kind === 'err' };
        if (p.final) pushLine(p.entry);
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const hovered = hoverRef.current;

      // Edges: base line + slow ambient dash flow
      for (const [a, b] of EDGES) {
        const pa = pos(a);
        const pb = pos(b);
        const lit = hovered && (hovered === a || hovered === b);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = lit ? 0.75 : 0.22;
        ctx.strokeStyle = palette.accent;
        ctx.setLineDash([2, 7]);
        ctx.lineDashOffset = reduce ? 0 : -now / 60;
        ctx.stroke();
        ctx.restore();
      }

      // Packets
      for (const p of packets) {
        if (now < p.start) continue;
        const pp = packetPos(p, now);
        const color = p.kind === 'err' ? palette.warn : p.kind === 'res' ? palette.text : palette.accent;
        p.trail.push({ x: pp.x, y: pp.y });
        if (p.trail.length > 10) p.trail.shift();

        ctx.save();
        for (let i = 0; i < p.trail.length - 1; i++) {
          ctx.globalAlpha = (i / p.trail.length) * (p.kind === 'res' ? 0.35 : 0.5);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.trail[i].x, p.trail[i].y, p.size * (0.4 + (i / p.trail.length) * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 14;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (pp.arrived && !p.done) {
          p.done = true;
          onArrive(p, now);
        }
      }
      for (let i = packets.length - 1; i >= 0; i--) if (packets[i].done) packets.splice(i, 1);

      // Nodes
      ctx.font = '500 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      (Object.keys(NODES) as NodeId[]).forEach((id) => {
        const p = pos(id);
        const pl = pulse[id];
        const age = pl ? (now - pl.t) / 700 : 1;
        const active = age < 1;
        const tint = pl?.err ? palette.warn : palette.accent;
        const isHover = hovered === id;
        const r = 9;

        if (active) {
          ctx.save();
          ctx.globalAlpha = (1 - age) * 0.6;
          ctx.strokeStyle = tint;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + age * 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        if (active || isHover) {
          ctx.shadowColor = tint;
          ctx.shadowBlur = isHover ? 18 : 12 * (1 - age);
        }
        ctx.fillStyle = palette.card;
        ctx.strokeStyle = active || isHover ? tint : palette.border;
        ctx.lineWidth = active || isHover ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = active || isHover ? tint : palette.muted;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHover ? palette.text : palette.muted;
        const half = ctx.measureText(NODES[id].label).width / 2 + 4;
        const lx = Math.min(Math.max(p.x, half), w - half);
        ctx.fillText(NODES[id].label, lx, p.y + r + 5);
      });
    };

    const showNode = (id: NodeId | null) => {
      hoverRef.current = id;
      if (id) {
        const p = pos(id);
        setHover({ id, x: p.x, y: p.y });
      } else setHover(null);
    };

    /* Auto-tour: while nobody is pointing at the map, step the tooltip through
       the nodes so visitors discover there is something to inspect. */
    let userActive = false;
    let lastUserAt = -Infinity;
    let tourIdx = 0;
    let lastTour = performance.now() - TOUR_MS + 1800;

    const loop = (now: number) => {
      if (now - lastSpawn > SPAWN_MS) {
        lastSpawn = now;
        spawn(now);
      }
      if (!userActive && now - lastUserAt > TOUR_RESUME_MS && now - lastTour > TOUR_MS) {
        lastTour = now;
        showNode(TOUR[tourIdx++ % TOUR.length]);
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduce) return;
      running = true;
      // Drop in-flight packets from before a pause so they don't teleport
      packets.length = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden || !visible ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    // Hover / tap: find the nearest node within reach
    const pick = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      let best: NodeId | null = null;
      let bestD = 26;
      (Object.keys(NODES) as NodeId[]).forEach((id) => {
        const p = pos(id);
        const d = Math.hypot(p.x - mx, p.y - my);
        if (d < bestD) {
          bestD = d;
          best = id;
        }
      });
      if (best) {
        if (!userActive) setInteracted(true);
        userActive = true;
        if (best !== hoverRef.current) showNode(best);
      } else if (userActive) {
        userActive = false;
        lastUserAt = performance.now();
        showNode(null);
      }
      if (reduce) draw(performance.now());
      canvas.style.cursor = best ? 'pointer' : 'default';
    };
    const leave = () => {
      if (!userActive) return;
      userActive = false;
      lastUserAt = performance.now();
      showNode(null);
      if (reduce) draw(performance.now());
    };
    canvas.addEventListener('pointermove', pick);
    canvas.addEventListener('pointerdown', pick);
    canvas.addEventListener('pointerleave', leave);

    if (reduce) draw(performance.now());

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', pick);
      canvas.removeEventListener('pointerdown', pick);
      canvas.removeEventListener('pointerleave', leave);
    };
  }, [reduce, pushLine]);

  const tipNode = hover ? NODES[hover.id] : null;
  /* Anchor the tooltip so it always grows into the map, never past its edge:
     right-column nodes open leftwards, the client node opens rightwards. */
  const tipStyle = (): React.CSSProperties => {
    if (!hover || !tipNode) return {};
    const below = hover.y < 110;
    const top = below ? hover.y + 30 : hover.y - 16;
    const ty = below ? '0' : '-100%';
    if (tipNode.x >= 0.9) return { right: 14, top, transform: `translateY(${ty})` };
    if (tipNode.x <= 0.3) return { left: 14, top, transform: `translateY(${ty})` };
    return { left: hover.x, top, transform: `translate(-50%, ${ty})` };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.lg }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.easing.smooth,
        delay: motionTokens.duration.normal,
      }}
      className="relative w-full max-w-xl mx-auto"
      role="img"
      aria-label="Simulated live system map: requests flow from the client through a gateway and role-based auth to the API, which reads from a Redis cache, PostgreSQL, or an LLM, and responses flow back. An unauthorized request is rejected at auth."
    >
      <div
        className="absolute -inset-6 rounded-[2rem] bg-[var(--color-accent)] opacity-[0.05] dark:opacity-[0.08] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="surface relative overflow-hidden shadow-2xl" aria-hidden="true">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-elevated)]">
          <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
            <span className="relative flex h-2 w-2">
              {!reduce && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-60" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]" />
            </span>
            system --live
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">simulated</span>
        </div>

        {/* Map */}
        <div
          ref={wrapRef}
          className="relative h-[200px] sm:h-[240px] border-b border-[var(--color-border)] [background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]"
        >
          <canvas ref={canvasRef} className="absolute inset-0 touch-pan-y" />
          <span
            className={`pointer-events-none absolute left-3 top-2.5 font-mono text-[10px] text-gray-500 transition-opacity duration-500 ${interacted ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="text-[var(--color-accent)]">↳ </span>
            <span className="hidden [@media(hover:hover)]:inline">hover</span>
            <span className="[@media(hover:hover)]:hidden">tap</span> a node to inspect
          </span>
          {tipNode && hover && (
            <div
              key={hover.id}
              className="pointer-events-none absolute z-10 max-w-[calc(100%-28px)] rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] px-2.5 py-1.5 font-mono text-[10px] leading-4 shadow-xl animate-[tipIn_180ms_ease-out]"
              style={tipStyle()}
            >
              <span className="text-[var(--color-accent)]">{tipNode.label}</span>
              <span className="text-gray-500"> · </span>
              <span className="text-gray-900 dark:text-gray-100">{tipNode.info}</span>
            </div>
          )}
        </div>

        {/* Log, fed by responses arriving at the client */}
        <ul className="px-4 py-3 font-mono text-[11px] sm:text-xs leading-6 overflow-hidden">
          {lines.map((l) => (
            <motion.li
              key={l.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
              className="flex gap-3 whitespace-nowrap"
            >
              <span className="text-gray-500 hidden sm:inline">{l.time}</span>
              <span className="w-9 text-gray-500">{l.method}</span>
              <span className="text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">{l.path}</span>
              <span className={l.status >= 400 ? 'text-[var(--color-warn)]' : 'text-[var(--color-accent)]'}>
                {l.status}
              </span>
              <span className="w-14 text-right text-gray-500">{l.ms}ms</span>
              <span className="hidden md:inline w-40 text-gray-500 truncate">{l.note}</span>
            </motion.li>
          ))}
        </ul>

        {/* On phones the output drops to its own line, like a real terminal,
            instead of being truncated; from `sm` up it fits on one line. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3 border-t border-[var(--color-border)] font-mono text-xs text-gray-500">
          <span className="text-[var(--color-accent)]">$</span>
          <span>whoami</span>
          <span className="basis-full sm:basis-auto flex items-center gap-2 text-gray-900 dark:text-white">
            <span className="hidden sm:inline">→</span>
            umair.ahsan · backend · ai-integration
            {!reduce && <span className="w-1.5 h-3.5 shrink-0 bg-[var(--color-accent)] animate-pulse" />}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
