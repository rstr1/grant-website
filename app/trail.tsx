'use client';

import { useEffect, useRef } from 'react';


export default function Trail() {

    // Initialise coordinates for the circles
    const coords = useRef({
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    });

    const cursorSizePx = 10;

    // Create a ref to store the circle elements
    const circlesRef = useRef<HTMLElement[]>([]);

    // Create a ref to store the positions of the circles
    const positions = useRef(Array.from({ length: 22 }, () => ({ x: 0, y: 0 })));

    // const colours = [
    //     "#ffb56b",  "#fdaf69",  "#f89d63",  "#f59761",  "#ef865e",
    //     "#ec805d",  "#e36e5c",  "#df685c",  "#d5585c",  "#d1525c",
    //     "#c5415d",  "#c03b5d",  "#b22c5e",  "#ac265e",  "#9c155f",
    //     "#950f5f",  "#830060",  "#7c0060",  "#680060",  "#60005f",
    //     "#48005f", "#3d005e"
    // ]
    // const colours = [
    //     "#000000","#0B0B0B","#161616","#202020","#2B2B2B","#363636","#404040","#4B4B4B","#565656","#606060","#6B6B6B","#767676","#808080","#8B8B8B","#969696","#A0A0A0","#ABABAB","#B6B6B6","#C0C0C0","#CBCBCB","#D6D6D6","#FFFFFF"
    // ] // Black and White

    // const colours = [
    //     "#FFBC59","#FBBE61","#F6C169","#F2C371","#EDC679","#E9C981","#E4CB89","#E0CE91","#DAD199","#D5D3A1","#D1D6A9","#CCD9B1","#C8DBB9","#C3DEC1","#BFE1C9","#BAE3D1","#B6E6D9","#B1E9E1","#ADEBE9","#A8EEF1","#A4F1F9","#69C3FF"
    // ]

    const colours = [
        "#F28C28","#ED9633","#E8A03F","#E3AB4A","#DEB555","#D9BF61","#D4C96C","#CFC378","#CABE83","#C5B88E","#C0B29A","#BBACA5","#B6A6B1","#B1A0BC","#AC9AC8","#A794D3","#A28EDE","#9D88EA","#9892F5","#939DFF","#8EA7FF","#69C3FF"
    ].reverse()


    
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            coords.current.x = e.clientX;
            coords.current.y = e.clientY;
        };

        window.addEventListener("mousemove", handleMouseMove);

        let lastTime = 0;
        const frameDelay = 10; // target 20 FPS (adjust as needed)

        const animate = (time: number) => {
        if (time - lastTime < frameDelay) {
            requestAnimationFrame(animate);
            return;
        }
        lastTime = time;

        let { x, y } = coords.current;

        positions.current.forEach((pos, i) => {
            pos.x += (x - pos.x + (Math.random() - 0.5) * 10) * 0.7;
            pos.y += (y - pos.y + (Math.random() - 0.6) * 10) * 0.7;

            const element = circlesRef.current[i];
            if (element) {
                element.style.left = pos.x - cursorSizePx / 2 + "px";
                element.style.top = pos.y - cursorSizePx / 2 + "px";
                element.style.scale = (positions.current.length - i) / positions.current.length + "";
                element.style.backgroundColor = colours[i % colours.length];
                element.style.color = colours[i % colours.length];
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
    });

    return (
        <>
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        if (el) circlesRef.current[i] = el;
                    }}
                    className="circle fixed z-[9999999] rounded-full mixed-blend-mode pointer-events-none display-block border-radius-0 position-fixed"
                    style={{
                    left: 0,
                    top: 0,
                    width: `${cursorSizePx}px`,
                    height: `${cursorSizePx}px`,
                    backgroundColor: colours[i % colours.length],
                    }}
                />
            ))}
        </>
    );
}