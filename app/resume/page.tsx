import Image from "next/image";
import Footer from '../footer';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
const dithered_background = fullConfig.theme.colors.forest;
const gradient_background = fullConfig.theme.colors.forest_deep;

export default function Resume() {

    return (
        <div id="deep-root">
            <div
            className="h-[20vh]"
            style={{
                background: `linear-gradient(to top, ${dithered_background}, ${gradient_background})`,
            }}
            />

            <div className="px-[10%] pb-4 text-center">
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-sage/60">Resume</p>
                <p className="mx-auto mt-4 max-w-[52ch] font-geist text-lg leading-relaxed text-sage">
                    Click to Download!
                </p>
            </div>

            <div className="flex justify-center items-center px-10 pb-10 opacity-80">
                <a href="/files/Grant_2026_Resume.pdf" download>
                    <Image
                        src="/images/Grant_2026_Resume.png"
                        alt="Download"
                        width="850"
                        height="1100"
                        className="rounded-lg border border-bone/10 opacity-0 animate-appearance-in transition-all duration-300 hover:border-light_green/40 look-at-me"
                    />
                </a>
            </div>

            {/* ── Fade to footer ── */}
            <div
                className="h-[20vh]"
                style={{
                background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`,
                }}
            />
            <Footer/>
        </div>
    );
}