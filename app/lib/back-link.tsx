'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconArrowLeft } from './icons';

export default function BackLink() {
    const pathname = usePathname();
    const router = useRouter();
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        setCanGoBack(window.history.length > 1);
    }, [pathname]);

    if (pathname !== '/tierlist') return null;

    const goBack = () => {
        if (canGoBack) router.back();
        else router.push('/');
    };

    return (
        <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="group fixed left-6 top-6 z-50 flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-sage backdrop-blur-sm transition-colors duration-300 hover:text-white md:left-10 md:top-8"
        >
            <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
        </button>
    );
}
