import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const Home = () => {
  return (
    <>
    {/* CTA */}
    <section className="bg-indigo-100 px-5 py-10 rounded-3xl flex items-center  ">
      {/* content left section */}
      <div className="space-y-10">
        <h2 className="text-lg">Get Intevriew-Ready with AI-Powered Practcie & Feedback</h2>
        <p className="text-base">Practice real interview questions & get instant feedback</p>
        <Button asChild className="bg-violet-500 text-white   rounded-3xl">
          <Link href='/interview'>
          Start an Intevriew
          </Link>
          
          </Button>
      </div>
      {/* image right section */}
      <div className="hidden md:block">
       <Image src='/robot.png' alt="robot" width={400} height={300}/>
      </div>
    </section>


    <section className="my-14">
    <h2>Your Interviews</h2>
    <div>
      <p>You haven&apos;t taken any intevriews yet.</p>
    </div>
    </section>

    <section>
      <h2>Take an interview</h2>
      <div>
        <p>There are no interviews available.</p>
      </div>
    </section>
    </>
  )
}

export default Home
