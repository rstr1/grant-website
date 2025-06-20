'use client';

// import { ReactNode } from 'react';
import {Card, CardBody,} from '@heroui/react';
import {Image} from '@heroui/react';
import React from 'react';

const cards = [
    <Card key="KID_A" className="max-w-[900px] mx-auto shadow-lg bg-white">
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Kid A.png"
                    alt="Kid A Album Cover"
                    className="object-cover"
                    shadow="lg"
                    height={200}
                >
                </Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="">
        <CardBody>
            <div>
                <Image>

                </Image>
            </div>
        </CardBody>
    </Card>
]

export default function Tierlist() {
    return (
        
        <div className="min-h-screen p-20 bg-dark_background font-jost text-black overflow-hidden">
            <div>
                
                {cards.find((card) => card.key == "KID_A")}

                
            </div>
        </div>
    );
}