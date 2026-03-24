'use client';

import { useEffect } from 'react';

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
