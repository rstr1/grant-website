'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from './footer';
import { dithered_background, gradient_background } from './lib/constants';

const SECTION_HEIGHT_VH = 120;
const SECTION_GAP_VH = 20;

const PARALLAX = 0.1;
const OVERHANG_VH = 14;

const FADE_BOTH = 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)';
const FADE_BOTTOM = 'linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%)';

function smoothstep(t: number) {
    return t * t * (3 - 2 * t);
}

function useParallax(ref: RefObject<HTMLElement | null>) {
    const [offset, setOffset] = useState(0);

    const [progress, setProgress] = useState(1);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let rafId: number | null = null;

        const update = () => {
            rafId = null;
            const el = ref.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;

            const distance = (rect.top + rect.height / 2 - vh / 2) / vh;

            const clamped = Math.max(-1.2, Math.min(1.2, distance));
            setOffset(-clamped * PARALLAX * vh);
            setProgress(smoothstep(1 - Math.min(Math.abs(distance), 1)));
        };

        const onScroll = () => {
            if (rafId === null) rafId = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, [ref]);

    return { offset, progress };
}

type BackdropProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    mask: string;
    offset: number;
    priority?: boolean;
    unoptimized?: boolean;
};

function Backdrop({ src, alt, width, height, mask, offset, priority = false, unoptimized = false }: BackdropProps) {
    return (
        <div
            className="absolute inset-0 overflow-hidden"
            style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
            <div
                className="absolute inset-x-0"
                style={{
                    top: `-${OVERHANG_VH}vh`,
                    bottom: `-${OVERHANG_VH}vh`,
                    transform: `translate3d(0, ${offset}px, 0)`,
                    willChange: 'transform',
                }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes="100vw"
                    priority={priority}
                    unoptimized={unoptimized}
                    className="w-full h-full object-cover object-center"
                />
            </div>
        </div>
    );
}

type SectionProps = {
    src: string;
    width: number;
    height: number;
    title: string;
    caption: string;
    href: string;
    align: 'left' | 'right';
};

function Section({ src, width, height, title, caption, href, align }: SectionProps) {
    const ref = useRef<HTMLElement>(null);
    const { offset, progress } = useParallax(ref);

    return (
        <section
            ref={ref}
            className="relative w-full overflow-hidden"
            style={{ height: `${SECTION_HEIGHT_VH}vh` }}
        >
            <Backdrop
                src={src}
                alt={title}
                width={width}
                height={height}
                mask={FADE_BOTH}
                offset={offset}
                unoptimized
            />

            <Link
                href={href}
                className="group absolute font-playfair font-bold leading-none p-[2%] pb-20"
                style={{
                    top: '27%',
                    left: align === 'left' ? '10%' : undefined,
                    right: align === 'right' ? '10%' : undefined,
                    fontSize: 'min(8vw, 10rem)',
                    opacity: Math.min(Math.max((progress - 0.3) / 0.4, 0), 1),
                    textAlign: align,
                }}
            >
                <span className="bg-gradient-to-r from-eggshell to-eggshell/80 bg-clip-text text-transparent opacity-75 transition-opacity duration-300 group-hover:opacity-100">
                    {title}
                </span>

                <span className="block mt-5 font-jost text-[0.7rem] sm:text-xs uppercase tracking-[0.25em] text-eggshell/40 transition-colors duration-300 group-hover:text-eggshell/70">
                    {caption}
                </span>
            </Link>
        </section>
    );
}

function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { offset } = useParallax(ref);

    return (
        <section ref={ref} className="relative h-screen w-full overflow-hidden">
            <Backdrop
                src="/photography/granada_flower_dithered.png"
                alt="Granada Flower"
                width={4896}
                height={3054}
                mask={FADE_BOTTOM}
                offset={offset}
                priority
            />
            <div
                className="opacity-0 animate-appearance-in absolute font-playfair font-bold leading-none p-[2%] bg-gradient-to-r from-eggshell to-eggshell/80 bg-clip-text text-transparent"
                style={{
                    top: '27%',
                    left: '10%',
                    fontSize: 'min(8vw, 10rem)',
                }}
            >
                Welcome
            </div>
        </section>
    );
}

function Gap() {
    return <div style={{ height: `${SECTION_GAP_VH}vh` }} />;
}

export default function Page() {
    return (
        <>
            <Hero />

            <Gap />

            <Section
                src="/photography/lobstah_dith.png"
                width={4000}
                height={2666}
                title="Projects"
                caption="Procedural generation · Drivers · Unity"
                href="/projects"
                align="right"
            />

            <Gap />

            <Section
                src="/photography/sky_flower_dith.png"
                width={4896}
                height={3264}
                title="Photography"
                caption="Granada · Lake Como"
                href="/photography"
                align="left"
            />

            <Gap />

            <Section
                src="/photography/dubrov_rocks_dith.png"
                width={4896}
                height={3264}
                title="Resume"
                caption="Computer Science &amp; Finance @ USYD"
                href="/resume"
                align="right"
            />

            <div className="h-[10vh]" />

            <div
                className="h-[20vh]"
                style={{
                    background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`,
                }}
            />

            <Footer />
        </>
    );
}
