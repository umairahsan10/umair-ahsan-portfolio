import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motionTokens } from '../../lib/motion-tokens';

/*
 * Simulated request trace. The routes mirror what Umair's backends actually
 * expose (claims, eligibility, chat, reports, auth); the latencies are
 * illustrative, and the panel header says so. Do not present them as metrics.
 */
type Entry = { method: 'GET' | 'POST'; path: string; status: number; ms: number; note: string };

const SCRIPT: Entry[] = [
  { method: 'POST', path: '/api/auth/login', status: 200, ms: 41, note: 'jwt issued · role=insurer' },
  { method: 'GET', path: '/api/eligibility', status: 200, ms: 9, note: 'cache HIT · redis' },
  { method: 'POST', path: '/api/claims', status: 201, ms: 38, note: 'rbac ✓ · row inserted' },
  { method: 'GET', path: '/api/reports', status: 200, ms: 94, note: 'cache MISS · postgres' },
  { method: 'POST', path: '/api/chat', status: 200, ms: 612, note: 'llm stream · openai' },
  { method: 'GET', path: '/api/admin/users', status: 403, ms: 6, note: 'rbac ✗ · role=patient' },
  { method: 'GET', path: '/api/dashboard', status: 200, ms: 17, note: 'cache HIT · redis' },
];

const MAX_LINES = 8;
const TICK_MS = 1100;

type Line = Entry & { id: number; time: string };

const makeLine = (n: number, base: number): Line => ({
  ...SCRIPT[n % SCRIPT.length],
  id: n,
  time: new Date(base + n * TICK_MS).toTimeString().slice(0, 8),
});

export const RequestLog: React.FC = () => {
  const reduce = useReducedMotion();
  const base = useRef(Date.now());
  const counter = useRef(MAX_LINES);
  const [lines, setLines] = useState<Line[]>(() =>
    Array.from({ length: MAX_LINES }, (_, i) => makeLine(i, base.current)),
  );

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const n = counter.current++;
      setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), makeLine(n, base.current)]);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

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
      aria-label="Simulated live request trace: authenticated API calls served from Redis cache or PostgreSQL, with role-based access control rejecting an unauthorized request."
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
            trace --follow
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500">simulated</span>
        </div>

        <ul className="px-4 py-4 font-mono text-[11px] sm:text-xs leading-6 overflow-hidden">
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
              <span className="hidden md:inline w-44 text-gray-500 truncate">{l.note}</span>
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-border)] font-mono text-xs text-gray-500">
          <span className="text-[var(--color-accent)]">$</span>
          <span>whoami</span>
          <span className="text-gray-900 dark:text-white">→ umair.ahsan · backend · ai-integration</span>
          {!reduce && <span className="w-1.5 h-3.5 bg-[var(--color-accent)] animate-pulse" />}
        </div>
      </div>
    </motion.div>
  );
};
