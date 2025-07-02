import Image from "next/image";

export default function Photography() {
    return (
        <div className="min-h-screen p-20 bg-background font-jost">
            <h1 className="text-4xl font-bold mb-12 text-center">Photography</h1>

            <div className="grid gap-6">

                <Image
                    src="/photography/DSCF1616.png"
                    alt="Lake Como Waterfront"
                    width="4896"
                    height="3264"
                    className="rounded-lg shadow-lg"
                />

                <Image
                    src="/photography/DSCF1745.png"
                    alt="Bellagio Alley"
                    width="4528"
                    height="2547"
                    className="rounded-lg shadow-lg"
                />

            </div>

        </div>
    );
}