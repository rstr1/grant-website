'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from './footer';
import { dithered_background, gradient_background } from './lib/constants';

export default function Page() {
    const [scrollTop, setScrollTop] = useState(0);

    useEffect(() => {
        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                setScrollTop(window.scrollY);
                rafId = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Intersection Observer (for any remaining .look-at-me elements; Welcome uses it)
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
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 1000;
    const vh = (n: number) => viewportH * n;

    // ---- Zone definitions (in pixels) ----
    // Welcome:     0     → 1.6vh   (anim 0-1, hold 1-1.5, fade 1.5-1.6)
    // Projects:    1.5vh → 2.7vh   (fade in 1.5-1.6, hold, fade out 2.6-2.7)
    // Photography: 2.6vh → 3.8vh
    // Resume:      3.7vh → 5.0vh
    // After 5vh: natural scroll into gradient + footer.

    const sectionOpacity = (
        fadeInStart: number,
        fullInStart: number,
        fullOutStart: number,
        fadeOutEnd: number
    ) => {
        if (scrollTop < fadeInStart) return 0;
        if (scrollTop < fullInStart) return (scrollTop - fadeInStart) / (fullInStart - fadeInStart);
        if (scrollTop < fullOutStart) return 1;
        if (scrollTop < fadeOutEnd) return 1 - (scrollTop - fullOutStart) / (fadeOutEnd - fullOutStart);
        return 0;
    };

    const welcomeOpacity = scrollTop < vh(1.5) ? 1 : sectionOpacity(vh(1.5), vh(1.5), vh(1.5), vh(1.6));
    const projectsOpacity = sectionOpacity(vh(1.5), vh(1.6), vh(2.6), vh(2.7));
    const photographyOpacity = sectionOpacity(vh(2.6), vh(2.7), vh(3.7), vh(3.8));
    const resumeOpacity = sectionOpacity(vh(3.7), vh(3.8), vh(4.9), vh(5.0));

    // Flower animation progress
    const animProgress = Math.min(Math.max(scrollTop / vh(1), 0), 1);
    const bgBrightness = 1 - animProgress * 0.3;
    const fgScale = 1 + animProgress * 1.0;
    const fgTranslateY = -200 * animProgress;

    const hideIfInvisible = (opacity: number) => ({
        visibility: opacity === 0 ? ('hidden' as const) : ('visible' as const),
    });

    return (
        <>
            {/* ============ WELCOME LAYER (flower animation) ============ */}
            <div
                className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-20"
                style={{
                    opacity: welcomeOpacity,
                    backgroundColor: '#000',
                    ...hideIfInvisible(welcomeOpacity),
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
                    <div
                        className="opacity-0 absolute pt-[5%] pl-[5%] pb-14 look-at-me bg-gradient-to-r from-eggshell/100 to-eggshell/80 bg-clip-text text-transparent"
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
                </div>
            </div>

            {/* ============ PROJECTS LAYER ============ */}
            <div
                className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-20"
                style={{
                    opacity: projectsOpacity,
                    backgroundColor: '#000',
                    ...hideIfInvisible(projectsOpacity),
                }}
            >
                <div className="font-playfair font-bold relative w-full h-full">
                    <Image
                        src="/photography/lobster_flowerish_2_dithered_bordered.png"
                        alt="projects"
                        width={4896}
                        height={3264}
                        className="w-full h-full object-cover object-center"
                        priority
                    />
                    <div
                        className="group absolute p-[2%] pb-20 cursor-pointer pointer-events-auto"
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
            </div>

            {/* ============ PHOTOGRAPHY LAYER ============ */}
            <div
                className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-20"
                style={{
                    opacity: photographyOpacity,
                    backgroundColor: '#000',
                    ...hideIfInvisible(photographyOpacity),
                }}
            >
                <div className="font-playfair font-bold relative w-full h-full">
                    <Image
                        src="/photography/sky_flower_dith_border.png"
                        alt="photography"
                        width={4896}
                        height={3264}
                        className="w-full h-full object-cover object-center"
                        priority
                    />
                    <div
                        className="group absolute p-[2%] pb-20 cursor-pointer pointer-events-auto"
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
            </div>

            {/* ============ RESUME LAYER ============ */}
            <div
                className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none z-20"
                style={{
                    opacity: resumeOpacity,
                    backgroundColor: '#000',
                    ...hideIfInvisible(resumeOpacity),
                }}
            >
                <div className="font-playfair font-bold relative w-full h-full">
                    <Image
                        src="/photography/me_studying.png"
                        alt="resume"
                        width={4896}
                        height={3264}
                        className="w-full h-full object-cover object-center"
                        priority
                    />
                    <div
                        className="group absolute p-[2%] pb-20 cursor-pointer pointer-events-auto"
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
            </div>

            {/* ============ PAGE FLOW CONTENT ============ */}
            {/* No inner scroll container. The page's natural window scroll drives
                everything. The 500vh spacer gives us the full scroll range for
                the four section transitions above. */}
            <div className="relative">
                {/* 500vh spacer — drives all four section transitions. */}
                <div className="h-[500vh]" aria-hidden="true" />

                {/* Gradient into footer. */}
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
