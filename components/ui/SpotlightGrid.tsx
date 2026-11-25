import React, { useEffect, useRef } from 'react';

/*
 * Cursor spotlight grid. A faint grid is revealed only in a soft circle around
 * the cursor, in the page background behind all content.
 *
 * Compositor-only: the masked "window" follows the cursor with translate3d,
 * and the grid inside it is counter-translated so its lines stay fixed to the
 * viewport. Nothing repaints on pointer move. Mouse/trackpad devices only.
 * Sits at z-[-1] inside the app root (which is `isolate`), so it paints above
 * the page background but below every section, card and hero backdrop.
 */
const SIZE = 560;

export const SpotlightGrid: React.FC = () => {
  const winRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const win = winRef.current;
    const grid = gridRef.current;
    if (!win || !grid) return;

    let x = 0;
    let y = 0;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const ox = x - SIZE / 2;
      const oy = y - SIZE / 2;
      win.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
      grid.style.transform = `translate3d(${-ox}px, ${-oy}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      win.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      win.style.opacity = '0';
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        ref={winRef}
        className="absolute left-0 top-0 overflow-hidden opacity-0 transition-opacity duration-500 will-change-transform [mask-image:radial-gradient(circle,black_0%,transparent_70%)]"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Accent glow under the grid */}
        <div className="absolute inset-0 [background:radial-gradient(circle,var(--color-accent-wash),transparent_65%)]" />
        <div
          ref={gridRef}
          className="absolute left-0 top-0 w-screen h-screen will-change-transform opacity-60 dark:opacity-80 [background-image:linear-gradient(var(--color-border-hover)_1px,transparent_1px),linear-gradient(90deg,var(--color-border-hover)_1px,transparent_1px)] [background-size:44px_44px]"
        />
      </div>
    </div>
  );
};
