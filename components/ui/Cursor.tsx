import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { springs } from '../../lib/motion-tokens';

const HOVERABLE = 'a, button, [role="button"], input, textarea, select';

const useFinePointer = () => {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return fine;
};

/**
 * Custom cursor: 1:1 dot + fast trailing ring (desktop, fine-pointer only).
 * The dot is bound directly to the pointer motion values (zero lag), the ring
 * follows through a stiff, critically-damped spring for a smooth trail.
 * Native cursor stays visible for accessibility.
 */
export const Cursor: React.FC = () => {
  const finePointer = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const [hovering, setHovering] = useState(false);

  const ringX = useSpring(x, springs.track);
  const ringY = useSpring(y, springs.track);

  useEffect(() => {
    if (!finePointer) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      /* Only dispatch once per visibility change — keeps the hot path allocation-free */
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(!!target?.closest?.(HOVERABLE));
    };
    const leave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);

    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [finePointer, x, y]);

  if (!finePointer) return null;

  return (
    <>
      {/* Dot — exactly on the pointer */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-blue-500 rounded-full pointer-events-none z-[9999]"
        style={{ x, y, opacity: visible ? 1 : 0, willChange: 'transform' }}
        aria-hidden="true"
      />
      {/* Ring — trails with a fast spring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 border border-blue-500/50 rounded-full pointer-events-none z-[9998]"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0, willChange: 'transform' }}
        animate={{ scale: hovering ? 1.6 : 1 }}
        transition={springs.snappy}
        aria-hidden="true"
      />
    </>
  );
};
