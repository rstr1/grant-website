'use client';

// import { ReactNode } from 'react';
import {Card, CardBody} from '@heroui/react';
import Image from 'next/image';
import React from 'react';
import Trail from "../trail";
import { albumData } from '../data/albums';

const cardStyle = 'max-w-[900px] mx-auto shadow-lg';

// var color = 0x320ae3;
// var complement = 0xffffff ^ color;

export default function Tierlist() {
    return (
        
        <div className="min-h-screen p-20 bg-dark_background font-jost text-black overflow-hidden">

            <Trail></Trail>
            <div className="gap-6 grid grid-cols- sm:grid-cols-2 justify-items-center">

                {albumData.map(({ key, title, filename, background }) => (

                    <Card key={key} className={`${cardStyle} bg-#${background}`}>
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
                        </CardBody>
                    </Card>
                ))}
     
            </div>
        </div>
    );
}