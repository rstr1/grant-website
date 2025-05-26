'use client';

import { useEffect, useRef } from 'react';

export default function Trail() {
    const coords = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });
    const circlesRef = useRef<HTMLElement[]>([]);
    const positions = useRef(Array.from({ length: 20 }, () => ({ x: 0, y: 0 })));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            coords.current.x = e.clientX;
            coords.current.y = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            let { x, y } = coords.current;

            positions.current.forEach((pos, i) => {
                // interpolate position
                pos.x += (x - pos.x) * 0.3;
                pos.y += (y - pos.y) * 0.3;

                const el = circlesRef.current[i];
                if (el) {
                    el.style.left = `${pos.x - 12}px`;
                    el.style.top = `${pos.y - 12}px`;
                    el.style.scale = `${(positions.current.length - i) / positions.current.length}`;
                }

                x = pos.x;
                y = pos.y;
            });

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <>
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        if (el) circlesRef.current[i] = el;
                    }}
                    className="circle fixed w-6 z-[9999999] h-6 rounded-full bg-white mix-blend-difference pointer-events-none"
                    style={{ left: 0, top: 0 }}
                />
            ))}
        </>
    );
}