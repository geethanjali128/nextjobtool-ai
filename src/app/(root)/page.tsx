import InterviewCard from "@/components/common/InterviewCard"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { getCurrentUser, } from "../../../lib/actions/auth.action"
import { getInterviewsByUserId, getLatestInterviews } from "../../../lib/actions/general.actions"

const Home = async () => {

  const user=await getCurrentUser()

  const[userInterviews,latestInterviews]= await Promise.all([
      getInterviewsByUserId(user?.id),
      getLatestInterviews({ userId : user?.id})
  ])


  const hasPastInterviews= userInterviews?.length > 0
  const hasUpcomingInterviews=latestInterviews?.length>0
  return (
    <>
    {/* CTA */}
    <section className="bg-indigo-100 px-5 py-10 rounded-3xl flex items-center  ">
      {/* content left section */}
      <div className="space-y-16">
        <h2 className="text-lg">Get Intevriew-Ready with AI-Powered Practcie & Feedback</h2>
        <p className="text-base">Practice real interview questions & get instant feedback</p>
        <Button asChild className="bg-violet-500 text-white rounded-3xl 
              transition-all duration-500 ease-in-out
             hover:bg-gray-700  hover:text-gray-200">
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


    {/* Interview Cards */}
    
    <section className="my-14">
    <h2>Your Interviews</h2>
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-5 my-5 lg:justify-items-start justify-items-center" >
      {hasPastInterviews ?(
        userInterviews?.map( interview=> <InterviewCard key={interview.id} {...interview}/>)
      ):(
         <p>You haven&apos;t taken any interviews yet.</p>
      )}

     
    </div>
    </section>

    <section>
      <h2>Take an interview</h2>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-y-5  my-5 lg:justify-items-start justify-items-center">
     {hasUpcomingInterviews ?(
        latestInterviews?.map( interview=> <InterviewCard key={interview.id} {...interview}/>)
      ):(
         <p>There are no new interviews available.</p>
      )}
      </div>
    </section>
    </>
  )
}

export default Home
