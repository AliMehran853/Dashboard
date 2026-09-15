import { useEffect, useRef, useState } from 'react';

// =========================================================
// useCountUp
//   Animates a numeric value from its previous state to a
//   new target using requestAnimationFrame + easeOutCubic.
//
//   Respects prefers-reduced-motion → jumps instantly.
//   Cancels smoothly on unmount or rapid value change.
// =========================================================

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export function useCountUp(target, options = {}) {
    const {
        duration = 900,
        decimals = 0,
        startFrom = 0,
        enabled = true,
    } = options;

    const safeTarget = Number(target) || 0;

    const [value, setValue] = useState(() =>
        enabled ? startFrom : safeTarget
    );

    const rafRef = useRef(null);
    const fromRef = useRef(enabled ? startFrom : safeTarget);
    const startTimeRef = useRef(0);

    useEffect(() => {
        // If animations are disabled or reduced motion is preferred,
        // jump to the target immediately.
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!enabled || prefersReduced) {
            setValue(safeTarget);
            fromRef.current = safeTarget;
            return undefined;
        }

        // Cancel any previous animation
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        const from = Number.isFinite(value) ? value : startFrom;
        const delta = safeTarget - from;

        // If value already equals target, do nothing
        if (Math.abs(delta) < 1e-9) {
            setValue(safeTarget);
            fromRef.current = safeTarget;
            return undefined;
        }

        fromRef.current = from;
        startTimeRef.current = performance.now();

        const tick = (now) => {
            const elapsed = now - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const next = from + delta * eased;

            setValue(next);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                rafRef.current = null;
                setValue(safeTarget);
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeTarget, duration, enabled]);

    // Round to requested decimals for stable formatting
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

export default useCountUp;