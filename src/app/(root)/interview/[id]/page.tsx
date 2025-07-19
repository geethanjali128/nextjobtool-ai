import Agent from "@/components/common/Agent"
import DisplayTechIcons from "@/components/common/DisplayTechIcons"
import Image from "next/image"
import { redirect } from "next/navigation"
import { getCurrentUser } from "../../../../../lib/actions/auth.action"
import { getInterviewById } from "../../../../../lib/actions/general.actions"
import { getRandomInterviewCover } from "../../../../../lib/utils"

const page = async({params}:RouteParams) => {

    const{id}=await params
    const interview= await getInterviewById(id)
    const user=await getCurrentUser()

    if(!interview)  redirect('/')
  return (
        <>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
             <div className="flex flex-row gap-4 items-center">
          <Image src={getRandomInterviewCover()} alt="cover-image" width={40} height={40} className="rounded-full object-cover size-[40px]"/>

                          <h3>{interview?.role}</h3>
       </div>
          <DisplayTechIcons techStack={interview?.techstack}/>
          </div>
           
        <p className="bg-gray-600 text-white w-fit py-1 px-2 text-sm rounded-tr-lg rounded-bl-lg ">{interview?.type}</p>
        </div>
     <Agent 
      userName={user?.name|| ""}
      userId={user?.id}
      interviewId={id}
      type='interview'
      questions={interview?.questions}
     />
        </>
  )
}

export default page
