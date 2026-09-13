'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { IconGitHub, IconLinkedIn, IconMail, IconDisc } from './lib/icons';

const ModelViewer = dynamic(() => import('./lib/model-viewer'), { ssr: false });

const SECTIONS = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'photography', label: 'Photography' },
    { id: 'resume', label: 'Resume' },
];

const PROJECTS = [
    {
        href: '/projects/3d-dungeon-gen',
        year: '2026',
        title: '3D Hexagonal Procedural Generation',
        blurb: 'Procedural dungeon generation sitting on a hexagonal grid. Built to test and explore various dungeon generation algorithms for world-gen in my WIP video game.',
        tags: ['C#', 'Unity', 'Procedural Gen'],
    },
    {
        href: '/projects/rpicam-mjpeg',
        year: '2024',
        title: 'rpicam-mjpeg',
        blurb: 'Raspberry Pi camera driver reviving and extending the previously deprecated features from RaspiMJPEG, written against V4L2 and the libcamera stack.',
        tags: ['C++', 'Linux', 'V4L2', 'libcamera'],
    },
];

const LINKS = [
    { href: 'https://github.com/rstr1', label: 'GitHub', Icon: IconGitHub },
    { href: 'https://linkedin.com/in/grant-dong/', label: 'LinkedIn', Icon: IconLinkedIn },
    { href: 'mailto:grantdong.work@gmail.com', label: 'Email', Icon: IconMail },
    { href: 'https://open.spotify.com/user/grantdingdong?si=374a5a1946a540e9', label: 'Spotify', Icon:IconDisc },
];

function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let rafId: number | null = null;
        let x = 0;
        let y = 0;

        const paint = () => {
            rafId = null;
            const el = ref.current;
            if (!el) return;
            el.style.background = `radial-gradient(500px at ${x}px ${y}px, rgba(109, 196, 100, 0.07), transparent 90%)`;
        };

        const onMove = (e: MouseEvent) => {
            x = e.clientX;
            y = e.clientY;
            if (rafId === null) rafId = requestAnimationFrame(paint);
        };

        window.addEventListener('mousemove', onMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return <div ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10" />;
}

function useActiveSection() {
    const [active, setActive] = useState(SECTIONS[0].id);

    useEffect(() => {
        let rafId: number | null = null;

        const update = () => {
            rafId = null;
            const line = window.innerHeight * 0.4;
            let current = SECTIONS[0].id;

            SECTIONS.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= line) current = id;
            });

            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
            if (atBottom) current = SECTIONS[SECTIONS.length - 1].id;

            setActive(current);
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
    }, []);

    return active;
}

function SideNav({ active }: { active: string }) {
    return (
        <nav
            aria-label="Page sections"
            className="hidden lg:block static h-auto w-auto border-0 shadow-none font-geist mt-10 mb-4"
        >
            <ul>
                {SECTIONS.map(({ id, label }) => {
                    const on = active === id;
                    return (
                        <li key={id}>
                            <a href={`#${id}`} className="group flex items-center py-3">
                                <span
                                    className={`mr-4 h-px transition-all duration-300 ${
                                        on ? 'w-16 bg-bone' : 'w-8 bg-sage/40 group-hover:w-16 group-hover:bg-bone'
                                    }`}
                                />
                                <span
                                    className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                                        on ? 'text-bone' : 'text-sage group-hover:text-bone'
                                    }`}
                                >
                                    {label}
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

function Section({
    id,
    label,
    hideHeading = false,
    children,
}: {
    id: string;
    label: string;
    hideHeading?: boolean;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            aria-label={hideHeading ? label : undefined}
            aria-labelledby={hideHeading ? undefined : `${id}-heading`}
            className="block min-h-0 justify-start text-base scroll-mt-24 mb-24 lg:mb-32"
        >
            {!hideHeading && (
                <h2
                    id={`${id}-heading`}
                    className="mb-6 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em] text-bone"
                >
                    {label}
                    <span className="hidden h-px flex-1 bg-sage/15 lg:block" />
                </h2>
            )}
            {children}
        </section>
    );
}

function Paragraph({ children }: { children: React.ReactNode }) {
    return <p className="mb-4 max-w-[68ch] text-lg leading-relaxed text-sage">{children}</p>;
}

function Em({ children }: { children: React.ReactNode }) {
    return <strong className="font-medium text-bone">{children}</strong>;
}

export default function Page() {
    const active = useActiveSection();

    return (
        <div id="home-root" className="relative min-h-screen bg-forest font-geist text-sage selection:bg-light_green/25">
            <CursorGlow />

            <div className="relative z-20 mx-auto max-w-6xl px-6 md:px-20 xl:max-w-7xl 2xl:max-w-[96rem] 2xl:px-24 lg:flex lg:gap-16 xl:gap-24">
                <header className="pt-28 pb-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[44%] lg:flex-col lg:justify-between lg:py-28">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-semibold tracking-tight text-bone sm:text-7xl">
                            <span className="block overflow-clip pb-[0.12em] -mb-[0.12em]">
                                <span className="block motion-safe:animate-reveal-line">Grant Dong</span>
                            </span>
                        </h1>
                        <p className="mt-3 text-lg font-mono text-bone/80 motion-safe:animate-page-in [animation-delay:200ms]">
                            Software Engineer
                        </p>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-sage motion-safe:animate-page-in [animation-delay:320ms]">
                            Bachelor of Advanced Computing &amp;<br />Bachelor of Commerce
                        </p>

                        <div className="motion-safe:animate-page-in [animation-delay:440ms]">
                            <SideNav active={active} />
                        </div>
                    </div>

                    <div className="relative z-0 hidden lg:block lg:min-h-0 lg:flex-1 lg:-mt-24 lg:mr-0 lg:py-0 lg:pr-12">
                        <div className="relative h-full w-full">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[95%] -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    background:
                                        'radial-gradient(closest-side, rgba(111,196,155,0.18), rgba(111,196,155,0.07) 55%, transparent 100%)',
                                }}
                            />
                            <div className="relative h-full w-full">
                                <ModelViewer />
                            </div>
                        </div>
                    </div>

                    <ul className="mt-12 flex items-center gap-5 lg:mt-2 motion-safe:animate-page-in [animation-delay:560ms]">
                        {LINKS.map(({ href, label, Icon }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    aria-label={label}
                                    target={href.startsWith('http') ? '_blank' : undefined}
                                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="block p-1 text-sage transition-colors duration-300 hover:text-light_green"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            </li>
                        ))}
                    </ul>

                </header>

                <main className="lg:w-[56%] lg:py-28">
                    <Section id="about" label="About" hideHeading>
                        <Paragraph>
                            Hi there! My name is <Em>Grant</Em>. I&apos;m a software engineer — which means I solve problems.
                            Not the big problems like &apos;What makes a life well-lived?&apos; or
                            &apos;How do I stop myself from scrolling reels?&apos; Now those are obviously
                            important issues — they just sit outside of my profession. I solve
                            practical problems, the kind that involve digging through complex systems to find what broke, communicating it clearly to stakeholders, and then building to avoid potential failures cropping up.
                        </Paragraph>
                        <Paragraph>
                            I&apos;ve recently completed a <Em>Bachelor of Advanced Computing</Em> &amp; <Em>Bachelor of Commerce</Em> at <Em>The University of Sydney</Em>. Throughout my studies, unit selection has been guided predominantly by my thirst for new and challenging material.
                            On the comp-sci side, I placed a focus on developing skills surrounding machine learning, cybersecurity and cloud computing. These are supported on the commerce side by corporate finance and investment management knowledge.
                        </Paragraph>
                        <Paragraph>
                            In my free time at home, I typically try to work on side-projects (currently a long-term video game project) and also love actively searching for new music. If given the choice, I&apos;d really rather be outdoors — <Em>fishing</Em>, hiking, practising photography, really anything that gets me away from the internet and grounded in the real world.
                        </Paragraph>
                    </Section>

                    <Section id="projects" label="Projects">
                        <ul className="group/list">
                            {PROJECTS.map(({ href, year, title, blurb, tags }) => (
                                <li
                                    key={href}
                                    className="mb-3 transition-opacity duration-300 lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
                                >
                                    <Link
                                        href={href}
                                        className="group block rounded-lg p-4 pl-10 transition-colors duration-300 hover:bg-sage/5 hover:shadow-lg hover:outline-light_green"
                                    >
                                        <div className="flex items-baseline gap-4">
                                            <span className="font-mono text-xs uppercase tracking-[0.15em] text-sage/60">
                                                {year}
                                            </span>
                                            <h3 className="font-medium text-bone transition-colors duration-300 group-hover:text-light_green">
                                                {title}
                                            </h3>
                                        </div>
                                        <p className="mt-2 text-sm leading-relaxed text-sage">{blurb}</p>
                                        <ul className="mt-3 flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <li
                                                    key={tag}
                                                    className="rounded-full bg-light_green/10 px-3 py-1 font-mono text-xs text-light_green"
                                                >
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/projects"
                            className="mt-4 inline-block text-lg font-mono text-bone transition-colors duration-300 hover:text-light_green"
                        >
                            All projects →
                        </Link>
                    </Section>

                    <Section id="photography" label="Photography">
                        <Paragraph>
                            Photography for me is primarily a hobby through which I can chronicle significant periods of my life — where I&apos;ve been, who I was there with, and what else was around us. Carrying around a camera pushes me to notice the small details of everything happening around me.
                        </Paragraph>
                        <Link
                            href="/photography"
                            className="inline-block text-lg font-mono text-bone transition-colors duration-300 hover:text-light_green"
                        >
                            Check out pics →
                        </Link>
                    </Section>

                    <Section id="resume" label="Resume">
                        <Paragraph>
                            I&apos;m a recent Computer Science and Commerce graduate from The University of Sydney, currently searching for graduate or junior software engineering or finance-adjacent roles where I can kickstart my career whilst learning the ins and outs of the industry.
                        </Paragraph>
                        <div className="flex flex-wrap gap-6">
                            <Link
                                href="/resume"
                                className="text-lg font-mono text-bone transition-colors duration-300 hover:text-light_green"
                            >
                                View resume →
                            </Link>
                            <a
                                href="/files/Grant_2026_Resume.pdf"
                                download
                                className="text-lg font-mono text-bone transition-colors duration-300 hover:text-light_green ml-auto"
                            >
                                Download PDF →
                            </a>
                        </div>
                    </Section>

                    <p className="pb-10 font-mono text-sm text-sage/50">
                        © Grant Dong {new Date().getFullYear()}
                    </p>
                </main>
            </div>
        </div>
    );
}
