import { gradient_background } from './lib/constants';

interface FooterProps {
    bgColor?: string;
}

export default function Footer({ bgColor = gradient_background }: FooterProps) {
    return (
        <footer
            className="font-geist text-sage"
            style={{ backgroundColor: bgColor }}
        >
            {/* Top rule */}
            <div className="mx-[10%] border-t border-bone/10" />

            <div className="px-[10%] pt-16 pb-20">

                {/* Main content row */}
                <div className="flex flex-col sm:flex-row justify-between gap-12 mb-16">

                    {/* Left */}
                    <div className="flex flex-col gap-3 sm:pl-20">
                        <span className="font-geist text-3xl font-semibold text-bone tracking-tight">
                            Grant Dong
                        </span>
                        <span className="text-xs uppercase tracking-[0.2em] text-sage/60">
                            Computer Science &amp; Finance Student @ USYD
                        </span>
                    </div>

                    {/* Right */}
                    <div className="flex gap-16 text-sm sm:pr-20 xs:justify-center sm:justify-between">
                        <div className="flex flex-col gap-3">
                            <span className="text-xs uppercase tracking-[0.2em] text-sage/50 mb-1">
                                Work
                            </span>
                            <a href="/resume" className="font-mono hover:text-light_green transition-colors duration-300 text-xs">
                                Resume
                            </a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-xs uppercase tracking-[0.2em] text-sage/50 mb-1">
                                Contact
                            </span>
                            <a href="mailto:grantdong.work@gmail.com" className="font-mono hover:text-light_green transition-colors duration-300 text-xs">
                                Email
                            </a>
                            <a href="https://linkedin.com/in/grant-dong/" target="_blank" rel="noopener noreferrer" className="font-mono hover:text-light_green transition-colors duration-300 text-xs">
                                LinkedIn
                            </a>
                            <a href="https://github.com/rstr1" target="_blank" rel="noopener noreferrer" className="font-mono hover:text-light_green transition-colors duration-300 text-xs">
                                GitHub
                            </a>
                            
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-bone/10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-xs text-sage/50 tracking-wide">
                        &copy; {new Date().getFullYear()} Grant Dong. All rights reserved.
                    </p>
                    <p className="text-xs text-sage/40 tracking-[0.15em] uppercase">
                        Sydney, Australia
                    </p>
                </div>

            </div>
        </footer>
    );
}
