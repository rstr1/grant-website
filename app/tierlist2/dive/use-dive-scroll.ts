"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Tracks how far the user has scrolled through `sectionRef` relative to the
 * page's custom #scroll-container (the tierlist page scrolls an inner div,
 * not the window). Returns a ref holding progress in [0, 1] rather than
 * state, so reading it inside a useFrame loop doesn't trigger re-renders.
 */
export function useDiveScroll(sectionRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);

  useEffect(() => {
    const scrollEl = document.getElementById("scroll-container");
    const section = sectionRef.current;
    if (!scrollEl || !section) return;

    const update = () => {
      const scrollRect = scrollEl.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = sectionRect.top - scrollRect.top + scrollEl.scrollTop;
      const sectionHeight = section.offsetHeight;
      const viewport = scrollEl.clientHeight;
      const scrollable = Math.max(sectionHeight - viewport, 1);
      const raw = (scrollEl.scrollTop - sectionTop) / scrollable;
      progressRef.current = Math.min(1, Math.max(0, raw));
    };

    update();
    scrollEl.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionRef]);

  return progressRef;
}
