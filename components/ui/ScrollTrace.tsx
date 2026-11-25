import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';

/*
 * Scroll-driven request trace (desktop only, `lg`+).
 *
 * One request snakes down the page as the visitor scrolls. At every section
 * boundary the trace sweeps across the full width through the empty gap
 * between sections, then runs down the opposite margin. Each crossing carries
 * a span pill; the packet passes through it and lights it. A corner inspector
 * shows the live span and, on hover, the full waterfall. The footer closes
 * the trace with 200 OK. Latencies are illustrative, like the hero map.
 *
 * Performance rules (this runs on every scroll frame, alongside Lenis):
 *  - No layout reads while scrolling. Geometry is measured on resize only,
 *    and the packet position is computed analytically, not with
 *    getPointAtLength.
 *  - No SVG filters and no infinite SVG animations: both force repaints of a
 *    page-tall layer.
 *  - The trace is split into one path per straight run / corner, and only the
 *    segments whose state changed are touched, so each frame repaints a few
 *    small rects instead of the whole line.
 *  - The packet is an HTML element moved with translate3d (compositor only).
 *  - React state changes only when a hop is crossed, never per frame.
 */

type Hop = { id: string; service: string; op: string; ms: number };

const HOPS: Hop[] = [
  { id: 'about', service: 'gateway', op: 'GET /umair', ms: 2 },
  { id: 'skills', service: 'service', op: 'resolve stack', ms: 6 },
  { id: 'experience', service: 'postgres', op: 'SELECT experience', ms: 14 },
  { id: 'projects', service: 'redis', op: 'projects · cache HIT', ms: 3 },
  { id: 'achievements', service: 'service', op: 'load achievements', ms: 5 },
];
const TOTAL_MS = HOPS.reduce((t, h) => t + h.ms, 0);

const RADIUS = 28;
const BAND = 120; // scroll px over which each horizontal sweep plays
const MIDLINE = 0.55; // packet rides at 55% of the viewport height
const TAIL = 120;

type Pt = { x: number; y: number };
type Seg = { d: string; start: number; len: number; at: (l: number) => Pt };
type Geo = {
  w: number;
  h: number;
  base: number;
  vh: number;
  d: string;
  segs: Seg[];
  total: number;
  keys: [number, number][];
  pills: (Pt & { len: number })[];
  end: Pt;
};

const goTo = (id: string) => {
  const a = document.createElement('a');
  a.href = `#${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/* Rounded orthogonal polyline → segments (lines + quarter arcs) */
const buildSegs = (pts: Pt[]) => {
  const segs: Seg[] = [];
  const corners: { start: number; end: number }[] = [];
  let len = 0;
  let cur = pts[0];

  const line = (a: Pt, b: Pt) => {
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (l < 0.5) return;
    segs.push({
      d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
      start: len,
      len: l,
      at: (t) => ({ x: a.x + ((b.x - a.x) * t) / l, y: a.y + ((b.y - a.y) * t) / l }),
    });
    len += l;
  };

  for (let i = 1; i < pts.length - 1; i++) {
    const [p, c, n] = [pts[i - 1], pts[i], pts[i + 1]];
    const din = { x: Math.sign(c.x - p.x), y: Math.sign(c.y - p.y) };
    const dout = { x: Math.sign(n.x - c.x), y: Math.sign(n.y - c.y) };
    const a = { x: c.x - din.x * RADIUS, y: c.y - din.y * RADIUS };
    const b = { x: c.x + dout.x * RADIUS, y: c.y + dout.y * RADIUS };
    line(cur, a);
    const center = { x: a.x + dout.x * RADIUS, y: a.y + dout.y * RADIUS };
    const t0 = Math.atan2(a.y - center.y, a.x - center.x);
    let dt = Math.atan2(b.y - center.y, b.x - center.x) - t0;
    if (dt > Math.PI) dt -= 2 * Math.PI;
    if (dt < -Math.PI) dt += 2 * Math.PI;
    const sweep = din.x * dout.y - din.y * dout.x > 0 ? 1 : 0;
    const arcLen = (Math.PI * RADIUS) / 2;
    const start = len;
    segs.push({
      d: `M ${a.x} ${a.y} A ${RADIUS} ${RADIUS} 0 0 ${sweep} ${b.x} ${b.y}`,
      start,
      len: arcLen,
      at: (t) => {
        const th = t0 + (dt * t) / arcLen;
        return { x: center.x + RADIUS * Math.cos(th), y: center.y + RADIUS * Math.sin(th) };
      },
    });
    len += arcLen;
    corners.push({ start, end: len });
    cur = b;
  }
  line(cur, pts[pts.length - 1]);
  return { segs, corners, total: len, d: segs.map((s) => s.d).join(' ') };
};

export const ScrollTrace: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const litRefs = useRef<(SVGPathElement | null)[]>([]);
  const tailRefs = useRef<(SVGPathElement | null)[]>([]);
  const haloRefs = useRef<(SVGPathElement | null)[]>([]);
  const litCache = useRef<number[]>([]);
  const tailCache = useRef<string[]>([]);
  const geoRef = useRef<Geo | null>(null);
  const flags = useRef({ reached: -2, started: false, done: false });
  const [geo, setGeo] = useState<Geo | null>(null);
  const [reached, setReached] = useState(-1);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root || root.offsetParent === null) return; // hidden below lg
    const base = root.getBoundingClientRect().top + window.scrollY;
    const top = (el: Element | null) => (el ? el.getBoundingClientRect().top + window.scrollY - base : NaN);
    const bounds = [...HOPS.map((h) => top(document.getElementById(h.id))), top(document.querySelector('footer'))];
    const about = document.getElementById('about');
    if (!about || bounds.some(Number.isNaN)) return;

    const w = root.clientWidth;
    const h = root.scrollHeight;
    const vh = window.innerHeight;
    const contentLeft = about.getBoundingClientRect().left + 48;
    const xL = Math.max(18, contentLeft / 2);
    const xR = w - xL;
    const cx = w / 2;

    const pts: Pt[] = [{ x: cx, y: bounds[0] - 60 }];
    let prevX = cx;
    bounds.forEach((b, i) => {
      const side = i === bounds.length - 1 ? cx : i % 2 === 0 ? xL : xR;
      pts.push({ x: prevX, y: b }, { x: side, y: b });
      prevX = side;
    });
    const endPt = { x: cx, y: bounds[bounds.length - 1] + 48 };
    pts.push(endPt);
    const { segs, corners, total, d } = buildSegs(pts);

    const pills = HOPS.map((_, i) => ({
      x: (pts[2 * i + 1].x + pts[2 * i + 2].x) / 2,
      y: bounds[i],
      len: (corners[2 * i].end + corners[2 * i + 1].start) / 2,
    }));

    // Scroll keys: midline doc-y → path length
    const keys: [number, number][] = [[bounds[0] - 60 - BAND, 0]];
    bounds.forEach((b, i) => {
      keys.push([b - BAND, corners[2 * i].start], [b + BAND, corners[2 * i + 1].end]);
    });
    keys.push([bounds[bounds.length - 1] + BAND + 48, total]);
    // The midline can't reach the footer's keys at max scroll, so compress
    // the tail of the mapping to finish exactly there.
    const maxMid = document.documentElement.scrollHeight - base - vh * (1 - MIDLINE) - 4;
    for (let k = keys.length - 1; k >= 1; k--) {
      const cap = k === keys.length - 1 ? maxMid : keys[k + 1][0] - 30;
      keys[k][0] = Math.min(keys[k][0], cap);
    }

    const prev = geoRef.current;
    if (prev && prev.d === d && prev.h === h && prev.vh === vh) return; // nothing moved
    litCache.current = [];
    tailCache.current = [];
    const g = { w, h, base, vh, d, segs, total, keys, pills, end: endPt };
    geoRef.current = g;
    setGeo(g);
  }, []);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [measure]);

  const update = useCallback((sy: number) => {
    const g = geoRef.current;
    if (!g) return;
    const mid = sy + g.vh * MIDLINE - g.base;

    let len = 0;
    const k = g.keys;
    if (mid >= k[k.length - 1][0]) len = g.total;
    else if (mid > k[0][0]) {
      for (let i = 1; i < k.length; i++) {
        if (mid <= k[i][0]) {
          const t = (mid - k[i - 1][0]) / Math.max(k[i][0] - k[i - 1][0], 1);
          len = k[i - 1][1] + t * (k[i][1] - k[i - 1][1]);
          break;
        }
      }
    }

    // Lit state + comet tail, touching only segments that changed
    let p: Pt = g.segs[0]?.at(0) ?? { x: 0, y: 0 };
    g.segs.forEach((s, i) => {
      const local = len - s.start;
      const off = local >= s.len ? 0 : local <= 0 ? s.len : s.len - local;
      if (litCache.current[i] !== off) {
        litCache.current[i] = off;
        const el = litRefs.current[i];
        if (el) el.style.strokeDashoffset = String(off);
      }
      if (local >= 0 && local <= s.len) p = s.at(local);

      const inTail = local > 0 && local - TAIL < s.len;
      const tail = inTail ? String(-(local - TAIL)) : 'hide';
      if (tailCache.current[i] !== tail) {
        tailCache.current[i] = tail;
        [tailRefs.current[i], haloRefs.current[i]].forEach((el) => {
          if (!el) return;
          el.style.visibility = inTail ? 'visible' : 'hidden';
          if (inTail) el.style.strokeDashoffset = tail;
        });
      }
    });
    if (len >= g.total && g.segs.length) {
      const last = g.segs[g.segs.length - 1];
      p = last.at(last.len);
    }

    const pk = packetRef.current;
    if (pk) {
      pk.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      pk.style.opacity = len > 1 ? '1' : '0';
    }

    let idx = -1;
    g.pills.forEach((pl, i) => {
      if (len >= pl.len - 1) idx = i;
    });
    const f = flags.current;
    if (f.reached !== idx) {
      f.reached = idx;
      setReached(idx);
    }
    const s = len > 1;
    if (f.started !== s) {
      f.started = s;
      setStarted(s);
    }
    const dn = len >= g.total - 1;
    if (f.done !== dn) {
      f.done = dn;
      setDone(dn);
    }
  }, []);

  useMotionValueEvent(scrollY, 'change', update);
  useEffect(() => {
    update(window.scrollY);
  }, [geo, update]);

  const elapsed = HOPS.slice(0, reached + 1).reduce((t, h) => t + h.ms, 0);
  const current = reached >= 0 ? HOPS[reached] : null;

  return (
    <>
      <div ref={rootRef} className="hidden lg:block absolute inset-0 pointer-events-none z-20" aria-hidden="true">
        {geo && (
          <>
            <svg width={geo.w} height={geo.h} className="absolute left-0 top-0 overflow-visible">
              {/* Unlit trace (static) */}
              <path d={geo.d} fill="none" stroke="var(--color-border-hover)" strokeWidth="1.5" strokeDasharray="3 9" />
              {geo.segs.map((s, i) => (
                <g key={i}>
                  <path
                    ref={(el) => {
                      litRefs.current[i] = el;
                    }}
                    d={s.d}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeOpacity="0.55"
                    strokeWidth="2"
                    strokeDasharray={`${s.len} ${s.len}`}
                    strokeDashoffset={s.len}
                  />
                  {/* Comet tail: soft halo + bright core, no filters */}
                  <path
                    ref={(el) => {
                      haloRefs.current[i] = el;
                    }}
                    d={s.d}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeOpacity="0.18"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${TAIL} ${s.len + TAIL}`}
                    visibility="hidden"
                  />
                  <path
                    ref={(el) => {
                      tailRefs.current[i] = el;
                    }}
                    d={s.d}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${TAIL} ${s.len + TAIL}`}
                    visibility="hidden"
                  />
                </g>
              ))}
              {/* End node */}
              <g transform={`translate(${geo.end.x} ${geo.end.y})`}>
                <circle r={done ? 9 : 6} fill="var(--color-bg)" stroke={done ? 'var(--color-success)' : 'var(--color-border-hover)'} strokeWidth="2" />
                {done && <circle r="3.5" fill="var(--color-success)" />}
              </g>
            </svg>

            {/* Packet: composited HTML layer */}
            <div ref={packetRef} className="absolute left-0 top-0 will-change-transform" style={{ opacity: 0 }}>
              <span className="absolute -left-[14px] -top-[14px] w-7 h-7 rounded-full bg-[var(--color-accent)] opacity-20" />
              <span
                className={`absolute -left-[7px] -top-[7px] w-3.5 h-3.5 rounded-full shadow-[0_0_18px_4px_var(--color-accent-glow)] ${
                  done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)]'
                }`}
              />
              <span className="absolute -left-[2.5px] -top-[2.5px] w-[5px] h-[5px] rounded-full bg-white" />
            </div>

            {/* Span pills on each crossing */}
            {geo.pills.map((pl, i) => {
              const hop = HOPS[i];
              const lit = i <= reached;
              const active = i === reached && !done;
              return (
                <div key={hop.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pl.x, top: pl.y }}>
                  {lit && <span key={`ring-${i}`} className="absolute left-1/2 top-1/2 w-full h-full rounded-full border border-[var(--color-accent)] animate-[hop-ring_900ms_ease-out_forwards]" />}
                  <div
                    key={lit ? 'lit' : 'dim'}
                    data-hop={i}
                    className={`relative flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[11px] bg-[var(--color-card)] transition-[border-color,box-shadow,color,opacity] duration-300 ${
                      lit
                        ? `border-[var(--color-accent)] text-gray-900 dark:text-white animate-[hop-pop_420ms_cubic-bezier(.2,1.4,.4,1)] ${active ? 'shadow-[0_0_28px_-4px_var(--color-accent-glow)]' : 'shadow-[0_0_14px_-8px_var(--color-accent-glow)]'}`
                        : 'border-[var(--color-border)] text-gray-500 opacity-75'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${lit ? 'bg-[var(--color-accent)]' : 'bg-gray-500/50'}`} />
                    <span className="text-gray-500">{String(i + 1).padStart(2, '0')}</span>
                    <span className={lit ? 'text-[var(--color-accent)]' : ''}>{hop.service}</span>
                    <span className="text-gray-500">·</span>
                    <span>{hop.op}</span>
                    <span className={`tabular-nums ${lit ? 'text-[var(--color-accent)]' : ''}`}>{hop.ms}ms</span>
                    {lit && <span className="text-[var(--color-success)]">✓</span>}
                  </div>
                </div>
              );
            })}

            {/* End label */}
            <div
              className={`absolute font-mono text-xs whitespace-nowrap -translate-y-1/2 transition-[opacity,transform] duration-500 ${done ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
              style={{ left: geo.end.x + 20, top: geo.end.y }}
            >
              <span className="text-[var(--color-success)] font-semibold">✓ 200 OK</span>
              <span className="text-gray-500"> · {TOTAL_MS}ms · response delivered</span>
            </div>
          </>
        )}
      </div>

      {/* Trace inspector: live span, expands into a waterfall. Solid
          background on purpose: a backdrop blur on a fixed element is
          re-rendered on every scroll frame. */}
      <div
        className={`hidden lg:block fixed bottom-6 right-6 z-40 transition-[opacity,transform] duration-300 ${started ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
        }}
      >
        <div className="w-[300px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl font-mono text-[11px]">
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-[var(--color-border)]">
                <div className="flex justify-between text-gray-500">
                  <span>trace 7f3a·c21e</span>
                  <span>{TOTAL_MS}ms</span>
                </div>
                <div className="mt-2 space-y-1">
                  {HOPS.map((hop, i) => {
                    const offset = HOPS.slice(0, i).reduce((t, x) => t + x.ms, 0);
                    const lit = i <= reached;
                    return (
                      <button
                        key={hop.id}
                        onClick={() => goTo(hop.id)}
                        className={`w-full grid grid-cols-[88px_1fr] items-center gap-2 rounded-md px-1.5 py-1 text-left cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${i === reached ? 'bg-[var(--color-accent-wash)]' : ''}`}
                      >
                        <span className={`truncate ${lit ? 'text-[var(--color-accent)]' : 'text-gray-500'}`}>{hop.service}</span>
                        <span className="relative h-2 rounded-full bg-black/5 dark:bg-white/5">
                          <span
                            className={`absolute inset-y-0 rounded-full transition-[background-color,opacity] duration-300 ${lit ? 'bg-[var(--color-accent)]' : 'bg-gray-500/30'}`}
                            style={{ left: `${(offset / TOTAL_MS) * 100}%`, width: `${Math.max((hop.ms / TOTAL_MS) * 100, 4)}%` }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1.5 text-[10px] text-gray-500">click a span to jump to it</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left cursor-pointer"
            aria-expanded={open}
            aria-label="Request trace inspector"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {!done && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-60" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${done ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)]'}`} />
            </span>
            <span className="flex-1 truncate text-gray-900 dark:text-white">
              {done ? (
                <span className="text-[var(--color-success)]">200 OK · response delivered</span>
              ) : current ? (
                <>
                  <span className="text-[var(--color-accent)]">{current.service}</span>
                  <span className="text-gray-500"> · {current.op}</span>
                </>
              ) : (
                <span className="text-gray-500">request in flight…</span>
              )}
            </span>
            <span className="tabular-nums text-[var(--color-accent)]">{done ? TOTAL_MS : elapsed}ms</span>
          </button>
        </div>
      </div>
    </>
  );
};
