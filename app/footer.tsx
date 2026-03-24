interface FooterProps {
    bgColor?: string;
}

export default function Footer({ bgColor = 'rgb(25, 19, 13)' }: FooterProps) {
    return (
        <footer
            className="font-jost text-eggshell/50"
            style={{ backgroundColor: bgColor }}
        >
            {/* Top rule */}
            <div className="mx-[10%] border-t border-eggshell/10" />

            <div className="px-[10%] pt-16 pb-20">

                {/* Main content row */}
                <div className="flex flex-col sm:flex-row justify-between gap-12 mb-16">

                    {/* Left */}
                    <div className="flex flex-col gap-3 sm:pl-20">
                        <span className="font-playfair text-3xl text-eggshell/80 tracking-wide">
                            Grant Dong
                        </span>
                        <span className="text-xs uppercase tracking-[0.2em] text-eggshell/30">
                            Computer Science &amp; Finance Student @ USYD
                        </span>
                    </div>

                    {/* Right */}
                    <div className="flex gap-16 text-sm sm:pr-20 xs:justify-center sm:justify-between">
                        <div className="flex flex-col gap-3">
                            <span className="text-xs uppercase tracking-[0.2em] text-eggshell/25 mb-1">
                                Work
                            </span>
                            <a href="/resume" className="font-mono hover:text-eggshell/80 transition-colors duration-300 text-xs">
                                Resume
                            </a>
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="text-xs uppercase tracking-[0.2em] text-eggshell/25 mb-1">
                                Contact
                            </span>
                            <a href="mailto:grantdong.work@gmail.com" className="font-mono hover:text-eggshell/80 transition-colors duration-300 text-xs">
                                Email
                            </a>
                            <a href="https://linkedin.com/in/grant-dong/" target="_blank" rel="noopener noreferrer" className="font-mono hover:text-eggshell/80 transition-colors duration-300 text-xs">
                                LinkedIn
                            </a>
                            <a href="https://github.com/rstr1" target="_blank" rel="noopener noreferrer" className="font-mono hover:text-eggshell/80 transition-colors duration-300 text-xs">
                                GitHub
                            </a>
                            
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-eggshell/10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-xs text-eggshell/25 tracking-wide">
                        &copy; {new Date().getFullYear()} Grant Dong. All rights reserved.
                    </p>
                    <p className="text-xs text-eggshell/20 tracking-[0.15em] uppercase">
                        Sydney, Australia
                    </p>
                </div>

            </div>
        </footer>
    );
}
