// import Image from "next/image"

//bg-gradient-to-b from-background2 to-background1

export default function Home() {
  return (
    <div className="
    grid 
    grid-rows-[0px_1fr_20px] 
    justify-items-center 
    gap-2
    "> 
      
      <main className="
      flex 
      flex-col 
      pt-20 
      gap-12 
      row-start-2 
      items-center 
      sm:items-start
      max-w-7xl
      ">

      <h1 className="text-6xl mx-auto font-bold row-start-3 text-shadow-md">
        Welcome
      </h1>

      <hr className="w-full border-text dark:border-dark_text"></hr>

      <p 
      className="text-lg text-center w-11/12 pl-20 pr-20 text-shadow-2xs"
      // style={{ letterSpacing: '0.08em' }}
      >
        <br/>
        Hi! I&apos;m <b>Grant</b>, a fifth year student at the University of Sydney. 
        <br/>

        <span className="text-xs">Bachelor of Advanced Computing [<b>Computer Science</b>] & Bachelor of Commerce [<b>Finance</b>]</span>
        <br/><br/><br/>
        
        Over the past few years, I&apos;ve developed a strong affinity for my studies in both computer science and finance.
        <br/>

        <span className="text-xs">Interests include: Algorithms, Cybersecurity, Machine Learning, Risk Mitigation and Portfolio Management</span>
        <br/><br/><br/>

        In my spare time I enjoy being outdoors either <b>fishing</b> or going on walks. Aside from that, I also enjoy discovering new music, photography, weightlifting, creative projects and taking up new skills.
        <br/><br/><br/>

        This website is more of a personal project than anything else. I started work on it while on exchange in Edinburgh (early 2025). <b>Have a look around if you like!</b>
        <br/><br/>
      </p>

      <hr className="w-full border-text dark:border-dark_text"></hr>

      </main>
     
    </div>
  );
}