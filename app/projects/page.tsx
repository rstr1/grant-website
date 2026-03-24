'use client';

import Link from 'next/link';
import Footer from '../footer';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';
import { useFadeIn } from '@/app/lib/hooks'

const fullConfig = resolveConfig(tailwindConfig);
const dithered_background = fullConfig.theme.colors.dithered_background;
const gradient_background = fullConfig.theme.colors.gradient_background;

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'in-progress' | 'complete' | 'archived' | 'concept';

interface Project {
	slug: string;
	title: string;
	subtitle: string;
	tags: string[];
	status: Status;
	year: string;
}

// ─── Data — add your projects here ───────────────────────────────────────────

const PROJECTS: Project[] = [
  {
	slug: '3d-dungeon-gen', //'3d-hex-dungeon-procedural-generation',
	title: '3D Hex Dungeon Gen',
	subtitle: 'Procedural dungeon generation with hexagonal tiling',
	tags: ['C#', 'Unity', 'Algorithms', 'Procedural Gen', 'Game Development'],
	status: 'in-progress',
	year: '2026',
  },
  {
    slug: 'rpicam-mjpeg',
    title: 'rpicam-mjpeg',
    subtitle: 'Raspberry Pi driver replicating & improving on deprecated features',
    tags: ['C++', 'Drivers', 'Raspberry Pi', 'V4L2'],
    status: 'complete',
	year: '2024',
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_META: Record<Status, { label: string; color: string }> = {
	'in-progress': { label: 'In Progress', color: 'text-cadmium_orange' },
	complete:      { label: 'Complete',    color: 'text-eggshell/70' },
	archived:      { label: 'Archived',    color: 'text-eggshell/40' },
	concept:       { label: 'Concept',     color: 'text-sky_blue/70' },
};

// ─── Project row ─────────────────────────────────────────────────────────────

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const meta = STATUS_META[project.status];

  return (
    <Link href={`/projects/${project.slug}`} className="block group overflow-x-scroll scrollbar-hide max-w-5xl mx-auto">
        <div
            className="look-at-me opacity-0 border-t border-eggshell/10 py-8 px-0 
                    flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6
                    hover:border-cadmium_orange/30 transition-colors duration-300"
            style={{ animationDelay: `${index * 120}ms` }}
        >
            {/* Year */}
            <span
                className="font-jost text-xs tracking-[0.2em] text-eggshell/30 whitespace-nowrap shrink-0 self-start sm:self-auto"
                style={{ minWidth: '3.5rem' }}
            >
                {project.year}
            </span>

            {/* Title + subtitle */}
            <div className="min-w-0 flex-grow">
                <h2
                    className="font-playfair font-bold text-eggshell/80 group-hover:text-eggshell transition-colors duration-300 truncate pb-1"
                    style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
                >
                    {project.title}
                </h2>
                <p className="font-jost text-xs tracking-[0.12em] text-eggshell/40 mt-1 group-hover:text-eggshell/60 transition-colors duration-300">
                    {project.subtitle}
                </p>
            </div>

            {/* Tags */}
            <div className="flex gap-2 max-w-xs sm:max-w-[150px] md:max-w-[200px] lg:max-w-xs overflow-x-scroll shrink-0 scrollbar-hide">
                {project.tags.map((tag) => (
                    <span
                        key={tag}
                        className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-eggshell/30 border border-eggshell/10 px-2 py-0.5 shrink-0 whitespace-nowrap"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Status + arrow */}
            <div className="flex items-center gap-4 shrink-0">
                <span className={`font-jost text-xs tracking-[0.1em] uppercase ${meta.color} w-24 text-right`}>
                    {meta.label}
                </span>
                <span className="font-jost text-eggshell/20 group-hover:text-cadmium_orange group-hover:translate-x-1 transition-all duration-300 text-sm">
                    →
                </span>
            </div>
        </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    useFadeIn();

    return (
        <div id="scroll-container" className="overflow-y-scroll h-screen scrollbar-hide">

            {/* ── Hero / heading ── */}
            <section className="min-h-[40vh] flex flex-col justify-end px-[10%] pb-16 pt-36"
                style={{
                background: `linear-gradient(to top, ${dithered_background}, ${gradient_background})`,
                }}
            >
                <p
                className="look-at-me opacity-0 font-jost text-xs tracking-[0.35em] uppercase text-eggshell/30 mb-2"
                style={{ animationDelay: '0ms' }}
                >
                    Selected Work
                </p>
                <h1
                    className="look-at-me opacity-0 font-playfair font-bold bg-gradient-to-r from-eggshell/90 to-eggshell/60 bg-clip-text text-transparent pb-4"
                    style={{
                        fontSize: 'clamp(6.5rem, 10vw, 10rem)',
                        lineHeight: 1.05,
                        animationDelay: '100ms',
                    }}
                >
                    Projects
                </h1>
            </section>

            {/* ── Project list ── */}
            <section className="px-[10%] pb-10 min-h-0">
                <div className="max-w-5xl">
                    {PROJECTS.map((project, i) => (
                        <ProjectRow key={project.slug} project={project} index={i} />
                    ))}

                    {/* closing border */}
                    <div className="border-t border-eggshell/10" />
                </div>
            </section>

            {/* ── Fade to footer ── */}
            <div
                className="h-[40vh]"
                style={{
                    background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`,
                }}
            />

            <Footer />
        </div>
    );
}
