import Image from "next/image";

export default function Photography() {
    return (
        <div className="min-h-screen p-8 sm:p-20 bg-background font-jost">
            <h1 className="text-4xl font-bold mb-12 text-center">Photography Highlights</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                <Image
                    src="/photos/DSCF1616.jpeg"
                    alt="test"
                    width="4896"
                    height="3264"
                    className="rounded-lg shadow-lg"
                />

            </div>



        </div>



    );
}