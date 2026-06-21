'use client';

import { useEffect, useState } from 'react';

export function useFadeIn() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-appearance-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.look-at-me').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

/**
 * Measures the rendered width of each string in `texts`, using the given font
 * className, normalized per-unit-of-font-size ("em width"). Measuring at a fixed
 * reference size and dividing it back out means the result holds true at any
 * font-size — multiply it by a real font-size later to get the actual pixel width.
 */
export function useTextEmWidths(texts: string[], fontClassName: string, referenceSize = 200) {
    const [widths, setWidths] = useState<Record<string, number>>({});

    useEffect(() => {
        const measure = () => {
            const span = document.createElement('span');
            span.className = fontClassName;
            span.style.position = 'absolute';
            span.style.visibility = 'hidden';
            span.style.whiteSpace = 'nowrap';
            span.style.left = '-9999px';
            span.style.top = '-9999px';
            span.style.fontSize = `${referenceSize}px`;
            document.body.appendChild(span);

            const result: Record<string, number> = {};
            texts.forEach((text) => {
                span.textContent = text;
                result[text] = span.offsetWidth / referenceSize;
            });

            document.body.removeChild(span);
            setWidths(result);
        };

        // wait for the actual webfont to be loaded, not the fallback font,
        // or the measurement will be wrong
        document.fonts.ready.then(measure);
    }, [texts.join('|'), fontClassName, referenceSize]);

    return widths;
}
