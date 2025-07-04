import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { getRandomInterviewCover } from "../../../lib/utils";
import { Button } from "../ui/button";
import DisplayTechIcons from "./DisplayTechIcons";


const InterviewCard = ({intevriewId,userId,role,type,techstack,createdAt}:InterviewCardProps) => {

  // for type saftey intializing it with null , later on it changes to Feedback object or null
  // because later on it doean't take the values other than null if we intialzed with it
  const feedback=null as Feedback|null;

  // checking that the intevriew type is included with words like mix with case insensitive then make it mixed otherwise type as it is
  const normalizedType=/mix/gi.test(type)?"mixed":type;

    //  Get the interview date to display:
    // 1. Use feedback.createdAt if feedback exists,
    // 2. Else use interview's createdAt from props,
    // 3. Else use the current date (Date.now()).
    // Then format the final date as "Month Day, Year" (e.g., "Jun 24, 2025")
  const formattedDate=dayjs(feedback?.createdAt || createdAt ||Date.now()).format('MMM D , YYYY')
  return (
    <div className="w-[300px] bg-indigo-100 p-5 rounded-lg shadow-2xs relative">
      <div className="space-y-8">
        {/* badge */}
        <div className="absolute top-0 right-0">
          <p className="bg-gray-600 text-white w-fit py-1 px-2 text-sm rounded-tr-lg rounded-bl-lg ">{normalizedType}</p>
        </div>
        {/* copamny image */}
        <Image src={getRandomInterviewCover()} alt="cover" width={40} height={40} className="rounded-full object-fit size-[40px]" />

        {/* role of intevriew */}
        <h3>{role} Interview</h3>

       
        <div className="flex justify-between">
           {/* Date */}
        <div className="flex gap-2 items-center">
          <div>
            <Image src="/calendar.svg" alt="calendar" width={22} height={22} className="bg-black rounded-[2px]"/>
          </div>
          <p className="text-xs font-medium">{formattedDate}</p>
        </div>
      {/* rating and score */}
        <div className="flex gap-2 items-center">
          <div>
            <Image src="/star.svg" alt="star" width={20} height={20} className="bg-black rounded-[2px]"/>
          </div>
          <p className="text-xs font-medium">{feedback?.totalScore || "---"}/100</p>
        </div>
        </div>

        <div className="text-sm">
          <p>{feedback?.finalAssessment || "You haven't take the interview yet. Take it now to improve skills."}</p>
        </div>
       
        {/* tech icons and button */}
        <div className="flex justify-between items-center ">
          {/* tech icons */}
         <DisplayTechIcons techStack={techstack}/>

          <Button asChild className="bg-violet-500 text-white   rounded-3xl">
            <Link href={feedback?`/interview/${intevriewId}/feedback`:`interview/${intevriewId}`}>
            {feedback?"Check Feedback":"View Interview"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InterviewCard
