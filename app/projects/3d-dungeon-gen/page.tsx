'use client';

import Link from 'next/link';
import Footer from '../../footer';
import { useFadeIn } from '@/app/lib/hooks';
import { Block, Divider } from '@/app/lib/components';
import { dithered_background, gradient_background, project_hero_classname, body_text_classname } from '@/app/lib/constants';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  { label: '[1]  Organic Quality',       desc: 'Physical structure should feel naturally formed — no right angles, more branching possibilities.' },
  { label: '[2]  Verticality',           desc: 'Intra-level movement should emphasise verticality. Rooms should have slightly different floor heights.' },
  { label: '[3]  Natural Lighting',      desc: 'Crystals, lava, and bioluminescence; no artificial light sources. Should be lore accurate.' },
  { label: '[4]  Scale Contrasting',     desc: 'Claustrophobic corridors give way to grandiose, unsettling rooms. Players should feel trapped/exposed.' },
  { label: '[5]  Modular Hookpoints',    desc: 'Generation places gambling dens, exits, spawn points, and staircases explicitly. Some are multicellular.' },
  { label: '[6]  Maze-like',             desc: 'Players must struggle to navigate before finding the next safe-haven. Levels should be complex.' },
  { label: '[7]  Difficulty Ramping',    desc: 'Deeper levels generate larger, more hostile, more complex maps. In-built difficulty variable.' },
  { label: '[8]  Multiplayer Sightlines',desc: 'Players should be split up; pillars and geometry break long sightlines.' },
  { label: '[9]  Seed Determinism',      desc: 'Host-provided seeds reproduce exact layouts — supports save files and reduces reliance on host.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HexDungeonPage() {
    useFadeIn();

    return (
        <div id="scroll-container" className="overflow-y-scroll h-screen">

            {/* ── Hero ── */}
            <section 
                className={`${project_hero_classname}`}
                style={{
                    background: `linear-gradient(to top, ${dithered_background}, ${gradient_background})`,
                }}    
            >
                {/* Breadcrumb */}
                <Block delay={0}>
                    <Link
                        href="/projects"
                        className="font-jost text-xs tracking-[0.3em] uppercase text-eggshell/30 hover:text-cadmium_orange transition-colors duration-300 mb-8 inline-block"
                    >
                        ← Projects
                    </Link>
                </Block>

                {/* Title */}
                <Block delay={100}>
                <h1
                    className="font-playfair font-bold bg-gradient-to-r from-eggshell/90 to-eggshell/60 bg-clip-text text-transparent"
                    style={{ 
                        fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', 
                        lineHeight: 1.1 
                    }}
                >
                    3D Hexagonal<br />Procedural Generation
                </h1>
                </Block>

                {/* Tags */}
                <Block delay={200}>
                <div 
                    className="look-at-me opacity-0 flex flex-wrap justify-center gap-2 mt-4"
                >
                    {['C#', 'Unity', 'Algorithms', 'Procedural Gen', 'Game Development'].map((tag) => (
                    <span
                        key={tag}
                        className="font-jost text-[0.6rem] tracking-[0.18em] uppercase text-eggshell/30 border border-eggshell/10 px-3 py-1"
                    >
                        {tag}
                    </span>
                    ))}
                </div>
                </Block>
            </section>

            {/* Full-width divider */}
            <div
                className="look-at-me opacity-0 border-t border-eggshell/10 mx-[10%]"
                style={{ animationDelay: '250ms' }}
            />

            {/* ───────────────────── Body ────────────────────── */}
            <div className="px-[10%]">
                <div className="max-w-full mt-16 mx-20">

                {/* Overview */}
                <Block delay={350}>
                    <div className="grid md:grid-cols-3 gap-12 items-start">
                        <div className="md:col-span-1">
                            <h2 className="font-playfair text-eggshell/80 text-2xl mb-6">
                                Overview
                            </h2>
                            <p className={`${body_text_classname}`} style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            I'm currently in the process of designing and implementing the procedural generation process for
                            an <span className="text-eggshell/70">underground, cavernous environment.</span>
                            </p>
                            <p className={`${body_text_classname}`} style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            Existing games that inspired my design direction typically use a square grid when dealing with 
                            level generation. However, given that the game is set underground, I wanted to give it a more 
                            organic, cavernous feel by avoiding the use of right-angles in the map.
                            </p>
                            <p className={`${body_text_classname}`} style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            Instead, this project will be using a <span className="text-eggshell/70">hexagonal coordinate 
                            system</span>. The grid will be a tesselation of regular hexagons with 120° interior angles.
                            This allows for more variety in hallway/corridor directions, giving the level a less uniform feel.
                            </p>
                            <p className={`${body_text_classname}`} style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                            At the same time, this design choice will increase the complexity of any algorithms required for
                            map generation as the number of neighbours for each cell is now 6 instead of the standard 4.
                            </p>
                        </div>

                        <div className="md:col-span-2 ml-10">
                            <div className="[direction:rtl] mr-10">
                                <h2 className="font-playfair text-eggshell/80 text-2xl mb-2">Design Principles</h2>
                                <p className="font-jost text-xs tracking-[0.12em] text-eggshell/30 uppercase mb-10">Constraints</p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                                {PRINCIPLES.map(({ label, desc }, i) => (
                                    <div
                                        key={label}
                                        className="look-at-me opacity-0 border-t-2 border-eggshell/10 pt-5"
                                        style={{ animationDelay: `${i * 60}ms` }}
                                    >
                                    <div className="font-jost text-xs tracking-[0.15em] uppercase text-eggshell/70 mb-2">{label}</div>
                                    <div className="font-jost text-sm text-eggshell/35 leading-relaxed">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </Block>
                </div>
                <Divider/>

                <div className={`${body_text_classname} justify-center flex `}>tbc!</div>

                </div>


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
