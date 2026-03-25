import Image from "next/image";
import Footer from '../footer';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
const dithered_background = fullConfig.theme.colors.dithered_background;
const gradient_background = fullConfig.theme.colors.gradient_background;

export default function Resume() {

    return (
        <div id="scroll-container" className="overflow-y-scroll h-screen">
            <div 
            className="h-[20vh]"
            style={{
                background: `linear-gradient(to top, ${dithered_background}, ${gradient_background})`,
            }}
            />
            
            <div className="flex justify-center items-center px-10 pb-10 ">
                <a href="/files/Grant_2026_Resume.pdf" download>
                    <Image
                        src="/images/Grant_2026_Resume.png"
                        alt="Download"
                        width="850"
                        height="1100"
                        className="rounded-lg opacity-0 animate-appearance-in x body-center transition-all duration-200 look-at-me"
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