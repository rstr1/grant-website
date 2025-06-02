import { ReactNode } from 'react';

type CardProps = {
    children: ReactNode;
};

const Card = ({ children }: CardProps) => {
    return (
        <div className="text-white hide-cursor cursor-none bg-dark_background rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {children}
        </div>
    );
};

export default function Tierlist() {
    return (
        
        <div className="cursor-none min-h-screen p-8 sm:p-20 bg-dark_background font-jost text-black">
            <div>
                <Card>Hello</Card>
            </div>
        </div>
    );
}