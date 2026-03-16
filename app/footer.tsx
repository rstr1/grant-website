interface FooterProps {
    bgColor?: string;
}

export default function Footer({ bgColor = 'rgb(10, 10, 10)' }: FooterProps) {
    return (
        <footer
            className="py-20 px-[10%] font-jost text-eggshell/60"
            style={{ backgroundColor: bgColor }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6 h-[20vh]">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Grant Dong. All rights reserved.
                </p>
                <div className="flex gap-12 text-sm">
                    <a href="mailto:grantdong.work@gmail.com" className="hover:text-eggshell/90 transition-colors duration-300">
                        grantdong.work@gmail.com
                    </a>
                    <a href="https://linkedin.com/in/grant-dong/" target="_blank" rel="noopener noreferrer" className="hover:text-eggshell/90 transition-colors duration-300">
                        LinkedIn
                    </a>
                    <a href="https://github.com/rstr1" target="_blank" rel="noopener noreferrer" className="hover:text-eggshell/90 transition-colors duration-300">
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
}
