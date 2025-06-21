import Image from "next/image"

export default function Home() {
  return (
    <div className="grid grid-rows-[0px_1fr_20px] justify-items-center min-h-screen p-20 gap-2 bg-background font-jost">
      

      {/* Main Content */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-black">
      
      {/* Testing */}

      <p className="test-white">
        Herro Miche
      </p>

      <Image
        priority={true}
        src="/photography/DSCF1616.png"
        alt="test"
        width="4896"
        height="3264"
        className="rounded-lg shadow-lg"
      />

      <p>

      </p>

      </main>
     
    </div>
  );
}
