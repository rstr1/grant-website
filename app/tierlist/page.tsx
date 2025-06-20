'use client';

// import { ReactNode } from 'react';
import {Card, CardBody} from '@heroui/react';
import Image from 'next/image';
import React from 'react';

const cardStyle = 'max-w-[900px] mx-auto shadow-lg';

const cards = [
    <Card key="KID_A" className={`${cardStyle} bg-kid_a`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Kid A.png"
                    alt="Kid A Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="ABSOLUTELY" className={`${cardStyle} bg-absolutely`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Absolutely.png"
                    alt="Absolutely Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="DAWN" className={`${cardStyle} bg-dawn`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Dawn.png"
                    alt="Dawn Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="EUSEXUA" className={`${cardStyle} bg-eusexua`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/EUSEXUA.png"
                    alt="EUSEXUA Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="FOREVER HOWLONG" className={`${cardStyle} bg-forever_howlong`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Forever Howlong.png"
                    alt="Forever Howlong Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,

    <Card key="HEAVEN OR LAS VEGAS" className={`${cardStyle} bg-heaven_or_las_vegas`}>
        <CardBody className="grid grid-cols-2 text-center">
            <div className="p-2">
                <Image
                    src="/album covers/Heaven or Las Vegas.png"
                    alt="Heaven or Las Vegas Album Cover"
                    className="w-full h-auto object-cover rounded-2xl shadow-lg"
                    height={200}
                    width={200}
                ></Image>
            </div>
        </CardBody>
    </Card>,
]

export default function Tierlist() {
    return (
        
        <div className="min-h-screen p-20 bg-dark_background font-jost text-black overflow-hidden">
            <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 justify-items-center">
                
                {cards.find((card) => card.key == "KID_A")}
                {cards.find((card) => card.key == "ABSOLUTELY")}
                {cards.find((card) => card.key == "DAWN")}
                {cards.find((card) => card.key == "EUSEXUA")}
                {cards.find((card) => card.key == "FOREVER HOWLONG")}
                {cards.find((card) => card.key == "HEAVEN OR LAS VEGAS")}
                
            </div>
        </div>
    );
}