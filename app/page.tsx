import Image from "next/image"

export default function Home() {
  return (
    <div className="grid grid-rows-[0px_1fr_20px] justify-items-center min-h-screen p-20 gap-2 bg-background font-jost">
      

      {/* Main Content */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-nav_text">
      
      {/* Testing */}

      {/* <Image
        priority={true}
        src="/photography/DSCF1616.png"
        alt="test"
        width="4896"
        height="3264"
        className="rounded-lg shadow-lg"
      /> */}

      <p className="text-2xl font-jost text-left">
        About Me:

        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

      </p>

      </main>
     
    </div>
  );
}
