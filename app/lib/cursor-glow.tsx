'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let rafId: number | null = null;
        let x = 0;
        let y = 0;

        const paint = () => {
            rafId = null;
            const el = ref.current;
            if (!el) return;
            el.style.background = `radial-gradient(500px at ${x}px ${y}px, rgba(109, 196, 100, 0.07), transparent 90%)`;
        };

        const onMove = (e: MouseEvent) => {
            x = e.clientX;
            y = e.clientY;
            if (rafId === null) rafId = requestAnimationFrame(paint);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40" />;
}
