import Image from "next/image"
import { cn } from "../../../lib/utils"

enum CallStatus {
  INACTIVE="INACTIVE",

  CONNECTING="CONNECTING",

  ACTIVE="ACTIVE",

  FINISHED="FINISHED",

}


const Agent = ({userName}:AgentProps) => {
    const callStatus=CallStatus.ACTIVE
    const isSpeaking=true

    const messages=[
      "What is your name?",
      "My name is Anjali."
    ]

    const lastMessage=messages[messages.length-1]
  return (
    <>
     <div className="flex md:flex-row flex-col md:gap-x-6 gap-y-6  text-center my-8 ">
        {/* AI Interview card */}
      <div className="md:w-6/12  bg-indigo-100 p-10 rounded-lg flex flex-col items-center space-y-5 border-2 border-white ">
        <div className="relative  bg-gray-50 rounded-full p-3 w-20 h-20 flex flex-col justify-center items-center">
            <Image src="/ai-avatar.png" alt='ai' width={65} height={54} className="object-cover   "/>
            {isSpeaking&& <span className="absolute inline-flex size-16 top-2 left-2 animate-ping rounded-full bg-gray-50 opacity-75"/>}
        </div>
        <h3>AI Interviewer</h3>
      </div>

      {/* User Card */}
      <div className="md:w-6/12  bg-indigo-100 p-10 rounded-lg flex flex-col items-center space-y-5">
        <div>
            <Image src="/user-avatar.png" alt='user' width={539} height={539} 
            className="rounded-full object-cover size-20"
            />
        </div>
        <h3>{userName}</h3>
      </div>
    </div>

    {/* messages */}
    {
      messages.length>0 && (
        <div className="my-10 bg-indigo-100 py-2 border-2 border-indigo-200 rounded-md text-center shadow-inner">
          
           <p key={lastMessage} className={cn('transition-opacity duration-500 opacity-0' , 'animate-fadeIn opacity-100')}>{lastMessage}</p>
         
        </div>
      )
    }

    {/* call status */}
    <div className="md:w-80 w-full mx-auto">
      { callStatus !== CallStatus.ACTIVE ? (
        <button className="rounded-full bg-green-600 w-full py-1 text-white">
           <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
         <span>{ callStatus === CallStatus.INACTIVE  ||  callStatus === CallStatus.FINISHED ? "Call" : "..."}</span>
        </button>
      ):(
        <button className="rounded-full bg-red-500 w-full py-1 text-white opacity-75">End</button>
      )}
    </div>
    </>
   
  )
}

export default Agent;
