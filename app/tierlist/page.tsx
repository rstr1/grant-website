"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  albumData,
  type Album,
} from "../data/albums";
import DiveScene from "./dive/dive-scene";

// Total scroll length of the dive, in vh.
const DIVE_VH = 1200;

// Stops THREE.Clock deprecation warning
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.toString().includes('THREE.Clock')) return;
    originalWarn(...args);
  };
}

export default function Tierlist() {
  const [selected, setSelected] = useState<Album | null>(null);
  const diveSectionRef = useRef<HTMLDivElement>(null);

  // Gentle container fade-in on first mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // opacity-0 --> opacity-100.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Close panel on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div id="scroll-container"
      className={`transition-opacity duration-500 ease-out ${mounted ? "opacity-100" : "opacity-0"} overflow-y-scroll h-screen scrollbar-hide`}
    >
      {/* Dive */}
      <section ref={diveSectionRef} className="relative block" style={{ height: `${DIVE_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {mounted && (
            <DiveScene
              albums={albumData}
              sectionRef={diveSectionRef}
            />
          )}
        </div>
      </section>

      {/* Shimmer keyframes for skeleton placeholders */}
      <style jsx global>{`
        @keyframes tierlist-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tierlist-shimmer {
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.06) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: tierlist-shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

    </div>
  );

}
