'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';


export default function Test() {
    const imgRef = useRef<HTMLImageElement>(null);
    const [imgHeight, setImgHeight] = useState(0);

    useEffect(() => {
        function updateHeight() {
            if (imgRef.current) {
                setImgHeight(imgRef.current.clientHeight);
            }
        }
        updateHeight();
        window.addEventListener('resize', updateHeight);

        // Intersection Observer
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-appearance-in');
                            console.log('Element is intersecting, adding animation');
                            observer.unobserve(entry.target); // Stop observing after animation
                        } 
                        // else {
                        //     entry.target.classList.remove('animate-appearance-in');
                        //     console.log('Element is not intersecting, removing animation');
                        // }
                    });
                },
                {
                threshold: 0.7,
                }
            );

            const elements = document.querySelectorAll('.look-at-me');
            elements.forEach((el) => observer.observe(el));

            return () => {
                observer.disconnect();
                window.removeEventListener('resize', updateHeight);
            };
        }
    }, []);
    return (
        <div className="">
            <section className="">
                <div className="
                font-playfair
                font-bold
                text-eggshell
                dark:text-dark_nav_text
                relative
                h-[100vh] 
                ">
                {/* pt-[48px] */}
                    <Image 
                    ref={imgRef}
                    src="/photography/faded_flower.png"
                    alt="Granada Flower"
                    width = "4896"
                    height = "3264"
                    className="opacity-80 mask-y-to-90%"
                    priority={true}
                    />
                    <div 
                        className="absolute pt-[5%] pl-[5%] pb-8 look-at-me opacity-0 mix-blend-hard-light dark:mix-blend-normal"
                        style={{
                            top: `${imgHeight * 0.27}px`,
                            left: '10%',
                            fontSize: 'min(8vw, 10rem)',
                        }}
                    >
                        Welcome
                    </div>
                    
                </div>
            </section>
            
            <section className="">
                <p className="font-playfair look-at-me opacity-0">Test content</p>
            </section>
            <section className="look-at-me opacity-0">
                <p className="font-jost">This is a test</p>
            </section>
            <section className="look-at-me opacity-0">
                <p className="font-playfair">This is another test</p>
            </section>
        </div>
        
    );
}