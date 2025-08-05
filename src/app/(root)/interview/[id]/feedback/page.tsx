import dayjs from "dayjs"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../../../../../../lib/actions/auth.action"
import { getFeedbackByInterviewId, getInterviewById } from "../../../../../../lib/actions/general.actions"

const page = async({params}:RouteParams) => {

  const{id}=await params

  const user=await getCurrentUser()

  const interview=await getInterviewById(id)
  if(!interview) redirect('/')

    console.log(interview)

    const feedback= await getFeedbackByInterviewId({
      interviewId:id,
      userId:user?.id!,
    })

    //  console.log(feedback)

      const formattedDate=dayjs(feedback?.createdAt ||Date.now()).format('MMM D , YYYY')
   
  return (
    <div className="space-y-10 text-gray-600 mx-4">
    <h2 className="text-4xl text-center">Feedback on the Interview - {interview?.role} Interview.</h2>
    {/* total score and  date */}
    <div className="flex flex-row justify-between text-xl">
      
      <div className="flex flex-row gap-2 items-center" >
                <Image src="/star.svg" alt="star" width={20} height={20} className="bg-black rounded-[2px]"/>
                <span className="font-medium">Overall Impression: </span>  <p>{feedback?.totalScore || "---"}/100</p>
      </div>
      <div className="flex flex-row gap-2 items-center">
                  <Image src="/calendar.svg" alt="calendar" width={22} height={22} className="bg-black rounded-[2px]"/>

                    <p>{formattedDate}</p>
        </div>
              
              
    </div>

    

    {/* categories */}
    <div className="space-y-5">
      <h3 className="text-2xl font-medium">Breakdown of Evaluation:</h3>
      {feedback?.categoryScores?.map( (category,index)=>(
        <div key={index} className="space-y-2">
          <h4 className="text-lg font-medium">{`${index+1} . ${category.name} (${category.score}/100)`}</h4>
          <p>{category.comment}</p>
        </div>
      ))}
    </div>

    {/* strengths */}
    <ul className="space-y-2">
      <h4 className="text-2xl font-medium">Strengths:</h4>
      {feedback?.strengths?.map( (strength,index)=>(
        <li key={index}>
         {index+1} . {strength}
        </li>
      ))}
    </ul>

    {/* areas fo improvements */}
    <ul className="space-y-2">
      <h4 className="text-2xl font-medium">Areas For Improvements:</h4>
      {feedback?.areasForImprovement?.map( (area,index)=>(
        <li key={index}>
         {index+1} . {area}
        </li>
      ))}
    </ul>

{/* final assesment */}
    <div className="space-y-1.5">
      <h4 className="text-2xl font-medium">Final Assesment:</h4>
      <p>{feedback?.finalAssessment}</p>
    </div>

      {/* buttons */}
      <div className="flex flex-row gap-8 text-center">
         <Link href='/'  className="rounded-3xl bg-blue-200 hover:bg-blue-300 w-6/12 p-1 transition">Go to Home</Link>
          <Link href={`/interview/${id}`} className="rounded-3xl bg-blue-200 hover:bg-blue-300 w-6/12 p-1 transition">Retake Interview</Link>
      </div>
   
    </div>
  )
}

export default page
