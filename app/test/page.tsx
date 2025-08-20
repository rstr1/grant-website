'use client';

import { useEffect } from 'react';
import Image from 'next/image';


export default function Test() {
    useEffect(() => {
        if (typeof window !== 'undefined' && "IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-appearance-in');
                            console.log('Element is intersecting, adding animation');
                        } else {
                            entry.target.classList.remove('animate-appearance-in');
                            console.log('Element is not intersecting, removing animation');
                        }
                    });
                }, 
                {
                threshold: 0.5,
                }
            );
            const elements = document.querySelectorAll('.look-at-me');
            elements.forEach((el) => observer.observe(el));

            return () => observer.disconnect();
        }
    }, []);
    return (
        <div className="pl-10 pr-10">
            <section className="">
                <div className="
                text-7xl 
                sm:text-9xl 
                font-playfair
                pb-40
                ">
                    <div className="pt-12 pb-8 look-at-me opacity-0">Welcome</div>
                    <Image 
                    src="/photography/flower.png"
                    alt="Granada Flower"
                    width = "4896"
                    height = "3264"
                    className="rounded-lg shadow-lg mb-12 border-8"
                    />
                    
                </div>
            </section>
            
            <section className="look-at-me opacity-0">
                <p className="font-playfair">Test content</p>
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