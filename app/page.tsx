'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from './footer';
import { dithered_background, gradient_background } from './lib/constants';

// Custom snap configuration
const SNAP_DURATION_MS = 1400;          // How long each snap animation takes
const SCROLL_DELTA_THRESHOLD = 10;      // Minimum wheel delta to trigger a snap

export default function Page() {
    const [scrollTop, setScrollTop] = useState(0);
    const isSnappingRef = useRef(false);
    const lastSnapEndRef = useRef(0);

    // Track window height in state so snap targets recalc on resize.
    const [viewportH, setViewportH] = useState(
        typeof window !== 'undefined' ? window.innerHeight : 1000
    );

    useEffect(() => {
        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                setScrollTop(window.scrollY);
                rafId = null;
            });
        };

        const handleResize = () => setViewportH(window.innerHeight);

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        let observer: IntersectionObserver | null = null;
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-appearance-in');
                            observer?.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.7 }
            );
            const elements = document.querySelectorAll('.look-at-me');
            elements.forEach((el) => observer!.observe(el));
        }

        return () => {
            observer?.disconnect();
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    // ---- Snap Logic ----
    useEffect(() => {
        const getSnapTargets = () => {
            const vh = viewportH;
            return [
                0,            // Top / flower
                2.45 * vh,    // Projects center
                4.85 * vh,    // Photography center
                7.25 * vh,    // Resume center
                Math.max(7.25 * vh + vh, document.documentElement.scrollHeight - vh),
            ];
        };

        // Easing: ease-out cubic — starts fast, slows as it approaches.
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        // Animation
        const animateScrollTo = (targetY: number) => {
            const startY = window.scrollY;
            const distance = targetY - startY;
            if (Math.abs(distance) < 1) return;

            isSnappingRef.current = true;
            const startTime = performance.now();

            const step = (now: number) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / SNAP_DURATION_MS, 1);
                const eased = easeOutCubic(t);
                window.scrollTo(0, startY + distance * eased);
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    isSnappingRef.current = false;
                    lastSnapEndRef.current = performance.now();
                }
            };
            requestAnimationFrame(step);
        };

        const findNextTarget = (currentY: number, direction: 1 | -1) => {
            const targets = getSnapTargets();
            if (direction === 1) {
                return targets.find((t) => t > currentY + 10) ?? targets[targets.length - 1];
            } else {
                const reversed = [...targets].reverse();
                return reversed.find((t) => t < currentY - 10) ?? targets[0];
            }
        };

        const onWheel = (e: WheelEvent) => {
            // Require minimum delta to avoid triggering on tiny scroll adjustments.
            if (Math.abs(e.deltaY) < SCROLL_DELTA_THRESHOLD) return;

            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            const target = findNextTarget(window.scrollY, direction);
            animateScrollTo(target);
        };

        // Touch support: detect swipe direction.
        let touchStartY = 0;
        const onTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
        };
        const onTouchEnd = (e: TouchEvent) => {
            if (isSnappingRef.current) return;

            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            if (Math.abs(deltaY) < 40) return; // Ignore tiny taps

            const direction = deltaY > 0 ? 1 : -1;
            const target = findNextTarget(window.scrollY, direction);
            animateScrollTo(target);
        };

        // Keyboard support: Arrow keys, Page Up/Down, Home/End, Space.
        const onKeyDown = (e: KeyboardEvent) => {
            if (isSnappingRef.current) {
                e.preventDefault();
                return;
            }
            let direction: 1 | -1 | null = null;
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') direction = 1;
            else if (e.key === 'ArrowUp' || e.key === 'PageUp') direction = -1;

            if (direction !== null) {
                e.preventDefault();
                const target = findNextTarget(window.scrollY, direction);
                animateScrollTo(target);
            }
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [viewportH]);

    const vh = (n: number) => viewportH * n;

    // ---- Hero zones ----
    const ANIM_END = vh(1.0);
    const HOLD_END = vh(1.5);
    const FADE_END = vh(1.6);

    const animProgress = Math.min(Math.max(scrollTop / ANIM_END, 0), 1);

    let heroOpacity = 1;
    if (scrollTop > HOLD_END) {
        heroOpacity = Math.max(0, 1 - (scrollTop - HOLD_END) / (FADE_END - HOLD_END));
    }
    const heroVisible = scrollTop < FADE_END;

    const bgBrightness = 1 - animProgress * 0.5;
    const fgScale = 1 + animProgress * 1.0;
    const fgTranslateY = -200 * animProgress;

    return (
        <>
            {/* ============ FLOWER HERO OVERLAY ============ */}
            <div
                className="fixed left-0 w-screen h-[120vh] overflow-hidden pointer-events-none z-20 pt-24"
                style={{
                    top: '-10vh',
                    opacity: heroOpacity,
                    backgroundColor: dithered_background,
                    visibility: heroVisible ? 'visible' : 'hidden',
                }}
            >
                <div className="relative w-full h-full font-playfair font-bold">
                    <Image
                        src="/photography/granada_flower_dithered_bordered.png"
                        alt="Granada Flower"
                        width={4896}
                        height={3054}
                        className="w-full h-full object-cover object-center"
                        style={{
                            filter: `brightness(${bgBrightness})`,
                            transition: 'filter 0.1s linear',
                        }}
                        priority
                    />

                    <div
                        className="opacity-0 absolute pl-[5%] pb-14 look-at-me bg-gradient-to-r from-eggshell/100 to-eggshell/80 bg-clip-text text-transparent"
                        style={{
                            top: '27%',
                            left: '10%',
                            fontSize: 'min(8vw, 10rem)',
                            transform: `translateY(${fgTranslateY}px) scale(${fgScale})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.1s linear',
                            willChange: 'transform',
                        }}
                    >
                        Welcome
                    </div>

                    <Image
                        src="/photography/granada_flower_dithered_bordered_foreground.png"
                        alt=""
                        aria-hidden="true"
                        width={4896}
                        height={3054}
                        className="absolute top-0 left-0 w-full h-full object-cover object-center"
                        style={{
                            transform: `translateY(${fgTranslateY}px) scale(${fgScale})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.1s linear',
                            willChange: 'transform',
                        }}
                        priority
                    />
                </div>
            </div>

            {/* ============ PAGE FLOW CONTENT ============ */}
            <div>
                {/* Hero spacer — 160vh of scroll during which the fixed flower is visible. */}
                <div className="h-[160vh]" aria-hidden="true" />

                {/* 40vh padding between flower fade-out and Projects. */}
                <div className="h-[80vh]" aria-hidden="true" />

                {/* Projects */}
                <section>
                    <div className="font-playfair font-bold relative h-[120vh] w-screen overflow-hidden">
                        <Image
                            src="/photography/lobster_flowerish_2_dithered_bordered.png"
                            alt="projects"
                            width={4896}
                            height={3264}
                            className="w-full h-full object-cover object-center"
                            priority
                        />
                        <div
                            className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                            style={{
                                top: '27%',
                                right: '10%',
                                fontSize: 'min(8vw, 10rem)',
                            }}
                        >
                            <span className="relative bg-gradient-to-r bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80 to-eggshell/60 text-transparent transition-all duration-300">
                                <Link href="/projects">Projects</Link>
                            </span>
                        </div>
                    </div>
                </section>

                <div className="h-[120vh]" />

                {/* Photography */}
                <section>
                    <div className="font-playfair font-bold relative h-[120vh] w-screen overflow-hidden">
                        <Image
                            src="/photography/sky_flower_dith_border.png"
                            alt="photography"
                            width={4896}
                            height={3264}
                            className="w-full h-full object-cover object-center"
                            priority
                        />
                        <div
                            className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                            style={{
                                top: '27%',
                                left: '10%',
                                fontSize: 'min(8vw, 10rem)',
                            }}
                        >
                            <span className="relative bg-gradient-to-l bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80 to-eggshell/60 text-transparent transition-all duration-300">
                                <Link href="/photography">Photography</Link>
                            </span>
                        </div>
                    </div>
                </section>

                <div className="h-[120vh]" />

                {/* Resume */}
                <section>
                    <div className="font-playfair font-bold relative h-[120vh] w-screen overflow-hidden">
                        <Image
                            src="/photography/me_studying.png"
                            alt="resume"
                            width={4896}
                            height={3264}
                            className="w-full h-full object-cover object-center"
                            priority
                        />
                        <div
                            className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                            style={{
                                top: '27%',
                                right: '10%',
                                fontSize: 'min(8vw, 10rem)',
                            }}
                        >
                            <span className="relative bg-gradient-to-r bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80 to-eggshell/60 text-transparent transition-all duration-300">
                                <Link href="/resume">Resume</Link>
                            </span>
                        </div>
                    </div>
                </section>

                <div className="h-[40vh]" />

                <div
                    className="h-[60vh]"
                    style={{
                        background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`,
                    }}
                />

                <Footer />
            </div>
        </>
    );
}
