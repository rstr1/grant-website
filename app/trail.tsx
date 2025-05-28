'use client';

import { useEffect, useRef } from 'react';


export default function Trail() {

    // Initialise coordinates for the circles
    const coords = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });

    const cursorSizePx = 8;
    // const cursorArguments = "h-" + cursorSizePx/2 + " w-" + cursorSizePx/2;

    // Create a ref to store the circle elements
    const circlesRef = useRef<HTMLElement[]>([]);

    // Create a ref to store the positions of the circles
    const positions = useRef(Array.from({ length: 20 }, () => ({ x: 0, y: 0 })));

    const colours = [
        "#ffb56b",  "#fdaf69",  "#f89d63",  "#f59761",  "#ef865e",
        "#ec805d",  "#e36e5c",  "#df685c",  "#d5585c",  "#d1525c",
        "#c5415d",  "#c03b5d",  "#b22c5e",  "#ac265e",  "#9c155f",
        "#950f5f",  "#830060",  "#7c0060",  "#680060",  "#60005f",
        "#48005f", "#3d005e"
    ]
    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            coords.current.x = e.clientX;
            coords.current.y = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            let { x, y } = coords.current;

            positions.current.forEach((pos, i) => {
                // interpolate position: value determines how spread out the trail is
                pos.x += (x - pos.x) * 0.5;
                pos.y += (y - pos.y) * 0.5;

                // Update attributes of each circle
                const element = circlesRef.current[i];
                if (element) {
                    // Set the position of the circle
                    element.style.left = pos.x - cursorSizePx + "px";
                    element.style.top = pos.y - cursorSizePx + "px";
                    
                    element.style.scale = (positions.current.length - i) / positions.current.length + "";
                    element.style.backgroundColor = colours[i % colours.length];
                    element.style.color = colours[i % colours.length];
                }
                
                // Updates x and y coords for next iteration
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
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        if (el) circlesRef.current[i] = el;
                    }}
                    className="circle fixed w-4 h-4 z-[9999999] rounded-full bg-white pointer-events-none"
                    style={{ left: 0, top: 0 }}
                />
            ))}
        </>
    );
}