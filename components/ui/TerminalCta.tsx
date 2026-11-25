import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { SquareTerminal } from 'lucide-react';
import { openTerminal } from './Terminal';

/*
 * Hero call-to-action for the terminal. A prompt pill with a slowly rotating
 * accent border that types real commands on a loop; clicking it opens the
 * terminal and runs whichever command is showing, so the first click pays off.
 * Commands here must be side-effect free (no `open`, no `sudo hire`).
 */
const DEMO = ['whoami', 'ls projects', 'stack', 'contact'];
const TYPE_MS = 85;
const HOLD_MS = 1800;
const ERASE_MS = 40;

export const TerminalCta: React.FC = () => {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(reduce ? DEMO[0] : '');
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const word = DEMO[idx];
    let t: number;
    if (!erasing && text.length < word.length) {
      t = window.setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_MS);
    } else if (!erasing) {
      t = window.setTimeout(() => setErasing(true), HOLD_MS);
    } else if (text.length > 0) {
      t = window.setTimeout(() => setText(text.slice(0, -1)), ERASE_MS);
    } else {
      setErasing(false);
      setIdx((i) => (i + 1) % DEMO.length);
      return;
    }
    return () => window.clearTimeout(t);
  }, [text, erasing, idx, reduce]);

  /* Run the full command even if the click lands mid-typing */
  const cmd = DEMO[idx];

  return (
    <button
      onClick={() => openTerminal(cmd)}
      className="group relative inline-flex rounded-full p-px overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-150 ease-out shadow-[0_0_24px_-6px_var(--color-accent-glow)] hover:shadow-[0_0_32px_-4px_var(--color-accent-glow)]"
      aria-label={`Open the interactive terminal and run ${cmd}`}
    >
      {/* Rotating border light */}
      <span
        className="absolute inset-[-100%] cta-spin [background:conic-gradient(from_0deg,transparent_0%,transparent_65%,var(--color-accent)_85%,transparent_100%)]"
        aria-hidden="true"
      />
      <span className="absolute inset-0 rounded-full border border-[var(--color-border)]" aria-hidden="true" />

      <span className="relative flex items-center gap-2.5 rounded-full bg-[var(--color-card)] pl-3 pr-2 py-1.5 font-mono text-xs">
        <SquareTerminal className="w-4 h-4 text-[var(--color-accent)]" aria-hidden="true" />
        <span className="text-gray-500" aria-hidden="true">
          try
        </span>
        <span className="text-[var(--color-accent)]" aria-hidden="true">
          $
        </span>
        <span className="min-w-[11ch] text-left text-gray-900 dark:text-white" aria-hidden="true">
          {text}
          <span className="inline-block w-[7px] h-3.5 -mb-0.5 ml-px bg-[var(--color-accent)] animate-pulse" />
        </span>
        <kbd
          className="hidden [@media(hover:hover)]:inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-chip)] px-2 py-0.5 text-[10px] text-gray-500 group-hover:text-[var(--color-accent)] group-hover:border-[var(--color-accent)] transition-colors"
          aria-hidden="true"
        >
          ⌘K
        </kbd>
        <span
          className="[@media(hover:hover)]:hidden rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-bg)]"
          aria-hidden="true"
        >
          tap
        </span>
      </span>
    </button>
  );
};
