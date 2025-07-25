import Image from "next/image";

export default function Resume() {
    return (
        <div className="flex justify-center items-center min-h-screen p-24 bg-background font-jost text-black">

            
            <a href="/files/Grant_2025_Resume.pdf" download>
                <Image
                    src="/images/Grant_2025_Resume.png"
                    alt="Download"
                    width="850"
                    height="1100"
                    className="rounded-lg opacity-90 hover:opacity-70 body-center"
                />
            </a>

        </div>

    );
}