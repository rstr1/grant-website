'use client';

import Link from 'next/link';
import Footer from '../../footer';
import { useFadeIn } from '@/app/lib/hooks';
import { Block } from '@/app/lib/components';
import { dithered_background, gradient_background, project_hero_classname, project_breadcrumb_classname, body_text_classname } from '@/app/lib/constants';


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RpicamMjpegPage() {
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
                        className={`${project_breadcrumb_classname}`}
                    >
                        ← Projects
                    </Link>
                </Block>

                {/* Title */}
                <Block delay={100}>
                <h1
                    className="look-at-me opacity-0 font-playfair font-bold bg-gradient-to-r from-eggshell/90 to-eggshell/60 bg-clip-text text-transparent pb-4"
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 7rem)',
                        lineHeight: 1.1
                    }}
                >
                    <Link href="https://github.com/goombado/rpicam-mjpeg" target="_blank" rel="noopener noreferrer">
                    rpicam-mjpeg
                    </Link>
                </h1>
                </Block>

                {/* Tags */}
                <Block delay={200}>
                <div
                    className="look-at-me opacity-0 flex flex-wrap justify-center gap-2 mt-4"
                >
                    {['C++', 'Drivers', 'Raspberry Pi', 'V4L2'].map((tag) => (
                        <span
                            key={tag}
                            className="font-jost text-[0.6rem] tracking-[0.15em] uppercase text-eggshell/30 border border-eggshell/10 px-2 py-0.5"
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
            <section className="px-[10%] pb-40 mx-auto grid md:grid-cols-2 gap-12 items-start">

                {/* Overview */}
                <div
                    className="look-at-me opacity-0 mt-16 md:col-span-1 mx-10"
                    style={{ animationDelay: '300ms' }}
                >
                    <h2 className="font-jost text-sm tracking-[0.35em] uppercase text-eggshell/30 mb-6">
                        Overview
                    </h2>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        <span className="text-eggshell/70">rpicam-mjpeg is a C++ camera driver for the Raspberry Pi, written as an extension
                        of the rpicam-apps suite.</span> It replicates and improves on the functionality of
                        RaspiMJPEG — the legacy MMAL-based driver that became unsupported from the
                        Raspberry Pi 4 onwards, when MMAL was replaced by the V4L2 camera API and libcamera.
                    </p>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        The driver supports simultaneous multi-stream capture — a preview MJPEG stream,
                        a high-resolution image stream, and a RAW Bayer stream — controlled via a named
                        FIFO pipe, making it a drop-in backend for the RPi Cam Web Interface. It also
                        implements motion detection through a custom post-processing stage, matching the
                        behaviour users relied on in the old MMAL pipeline.
                    </p>

                    {/* GitHub link */}
                    <div className="look-at-me opacity-0 mt-20 w-full flex justify-center" style={{ animationDelay: '300ms' }}>
                        <Link
                            href="https://github.com/goombado/rpicam-mjpeg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 border border-eggshell/10 px-6 py-4 hover:border-cadmium_orange/40 transition-colors duration-300"
                        >
                            <span className="font-jost text-xs tracking-[0.2em] uppercase text-eggshell/50 group-hover:text-eggshell/80 transition-colors duration-300">
                                View on GitHub
                            </span>
                            <span className="text-eggshell/50 group-hover:text-cadmium_orange group-hover:translate-x-1 transition-all duration-300 text-sm">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Background */}
                <div
                    className="look-at-me opacity-0 mt-16 md:col-span-1 mx-6"
                    style={{ animationDelay: '300ms' }}
                >
                    <p className="font-jost text-sm tracking-[0.35em] uppercase text-eggshell/30 mb-6">
                        Background
                    </p>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        In 2013, Robert Tidey developed RaspiMjpeg, a software package capable of outputting 
                        multiple simultaneous data streams from the camera. It supported four core functionalities: 
                        full-resolution video recording; a resized preview stream; single image capture; and motion 
                        vector generation for motion detection.
                    </p>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        Over time however, RaspiMjpeg became incompatible with newer Raspberry Pi models, and as a result, 
                        I, along with 5 other teammates undertook the task of learning about RaspiMjpeg and restoring its
                        capabilities by creating rpicam-mjeg, an extension of the rpicam-apps suite.
                    </p>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        We were also asked to address a known pain point among Raspberry Pi users — the slow capture time 
                        for still images — by improving the overall speed of the camera software. Compatibility with the 
                        Raspberry Pi web interface was an additional requirement. 
                    </p>
                    <p
                        className={`${body_text_classname}`}
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                    >
                        rpicam-mjpeg works best when in combination with silvanmelchior&apos;s 
                        <Link href="https://github.com/consiliumsolutions/RPi_Cam_Web_Interface/tree/p05c/install-changes" className="text-eggshell/80"> RPi_Cam_Web_Interface</Link>
                        , but can also work as a standalone app.
                    </p>
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
