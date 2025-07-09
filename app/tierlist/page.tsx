'use client';

// import { ReactNode } from 'react';
import {Card, CardBody} from '@heroui/react';
import Image from 'next/image';
import React from 'react';
// import Trail from "../trail";
import { albumData } from '../data/albums';

const cardStyle = 'max-w-[900px] mx-auto shadow-lg';

// converts 0xffffff to "#ffffff"
function hexNumberToString(hexNumber: number) {
    return `#${hexNumber.toString(16).padStart(6, '0')}`
}

function hexNumberComplement(hexNumber: number) {
    return hexNumber ^ 0xffffff;
}

// var color = 0x320ae3;
// var complement = 0xffffff ^ color;

// I WANT TO CALCULATE THE COMPLEMENTARY COLOUR AND THEN EITHER
// MAKE IT LIGHTER/DARKER TO MAKE IT MORE READABLE

export default function Tierlist() {
    return (
        <div className="min-h-screen p-20 bg-dark_background font-jost text-black overflow-hidden">

            {/* <Trail></Trail> */}
            <div className="gap-6 grid grid-cols- sm:grid-cols-2 justify-items-center">

                {albumData.map(({ key, title, filename, background }) => {
                    const backgroundColour = typeof background === 'number' 
                        ? hexNumberToString(background) 
                        : background;
                    const complementColour = typeof background === 'number'
                        ? hexNumberToString(hexNumberComplement(background)) 
                        : background;

                    return (
                        <Card 
                            key={key} 
                            className={`${cardStyle} }`} 
                            style={{ background: backgroundColour, color: complementColour}}
                        >
                            <CardBody className="grid grid-cols-2 text-center">
                                <div className="p-2">
                                    <Image
                                    src={`/album covers/${filename}`}
                                    alt={`${title} Album Cover`}
                                    className="w-full h-auto object-cover rounded-lg shadow-lg"
                                    height={200}
                                    width={200}
                                    >
                                    </Image>
                                </div>
                                <div className="pt-2 items-center justify-center text-xl font-bold p-2 font-jost">
                                    <div style={{ letterSpacing: '0.2em' }} className='whitespace-nowrap'>
                                        {title}
                                    </div>
                                    <div className="text-md font-normal pt-2">
                                        need description here
                                    </div>
                                    
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}

            </div>
        </div> 
    );
}