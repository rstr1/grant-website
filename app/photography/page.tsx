import Image from "next/image";

export default function Photography() {
    return (
        <div className="p-10 pt-24">
            <h1 className="text-4xl font-bold mb-12 font-playfair">Photography</h1>

            <div className="grid gap-12">

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