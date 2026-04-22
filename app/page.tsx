'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from './footer';
import { dithered_background, gradient_background } from './lib/constants';

export default function Page() {

    // Transition In
    useEffect(() => {
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
            };
        }
    }, []);

    return (
        
        // START OF PAGE

        <div id="scroll-container" className="snap-y snap-mandatory overflow-y-scroll h-screen">
            <section className="snap-center">
                <div className="font-playfair font-bold relative h-[100vh] overflow-hidden">
                    <Image 
                    src="/photography/granada_flower_dithered_bordered.png"
                    alt="Granada Flower"
                    width={4896}
                    height={3054}
                    className="w-full h-full object-cover object-center"
                    priority
                    />
                    <div 
                        className="opacity-0 absolute pt-[5%] pl-[5%] pb-14 look-at-me bg-gradient-to-r from-eggshell/100 to-eggshell/80 bg-clip-text text-transparent"
                        style={{
                            top: '27%',
                            left: '10%',
                            fontSize: 'min(8vw, 10rem)',
                        }}
                    >
                        Welcome
                    </div>
                </div>
            </section>
            
            <div className="h-[120vh]" />

            <section className="snap-center">
                <div className="font-playfair font-bold relative h-[100vh] overflow-hidden">
                    <Image 
                    src="/photography/lobster_flowerish_2_dithered_bordered.png"
                    alt="projects"
                    width={4896}
                    height={3264}
                    className="w-full h-full object-cover object-center"
                    priority
                    />
                    <div 
                        className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                        style={{
                            top: '27%',
                            right: '10%',
                            fontSize: 'min(8vw, 10rem)',
                        }}
                    >
                        <span className="relative bg-gradient-to-r bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80  to-eggshell/60 text-transparent transition-all duration-300">
                            <Link href="/projects">Projects</Link>
                        </span>
                    </div>
                    
                </div>
            </section>

            <div className="h-[120vh]" />
 
            <section className="snap-center">
                <div className="font-playfair font-bold relative h-[100vh] overflow-hidden">
                    <Image 
                    src="/photography/sky_flower_dith_border.png"
                    alt="photography"
                    width={4896}
                    height={3264}
                    className="w-full h-full object-cover object-center"
                    priority
                    />
                    <div 
                        className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                        style={{
                            top: '27%',
                            left: '10%',
                            fontSize: 'min(8vw, 10rem)',
                        }}
                    >
                        <span className="relative bg-gradient-to-l bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80 to-eggshell/60 text-transparent transition-all duration-300">
                            <Link href="/photography">Photography</Link>
                        </span>
                    </div>
                    
                </div>
            </section>

            <div className="h-[120vh]" />

            <section className="snap-center">
                <div className="font-playfair font-bold relative h-[100vh] overflow-hidden">
                    <Image 
                    src="/photography/me_studying.png"
                    alt="resume"
                    width={4896}
                    height={3264}
                    className="w-full h-full object-cover object-center"
                    priority
                    />
                    <div 
                        className="group opacity-0 absolute p-[2%] pb-20 look-at-me cursor-pointer"
                        style={{
                            top: '27%',
                            right: '10%',
                            fontSize: 'min(8vw, 10rem)',
                        }}
                    >
                        <span className="relative bg-gradient-to-r bg-clip-text group-hover:font-extrabold group-hover:from-eggshell/100 group-hover:to-eggshell/80 from-eggshell/80  to-eggshell/60 text-transparent transition-all duration-300">
                            <Link href="/resume">Resume</Link>
                        </span>
                    </div>
                    
                </div>
            </section>

            <div className="h-[40vh]"/>

            <div
                className="h-[60vh]"
                style={{
                        background: `linear-gradient(to bottom, ${dithered_background}, ${gradient_background})`, 
                }}
            />
            
            <div className="snap-center">
                <Footer/>
            </div>
        </div>
        
    );
}
