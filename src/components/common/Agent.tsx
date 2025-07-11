
'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "../../../lib/utils"
import { vapi } from "../../../lib/vapi.sdk"

enum CallStatus {
  INACTIVE="INACTIVE",

  CONNECTING="CONNECTING",

  ACTIVE="ACTIVE",

  FINISHED="FINISHED",


}

interface SavedMessage {
  role:'user' | 'system' | 'assistant',
  content:string,
}


const Agent = ({userName,userId,type}:AgentProps) => {

  // console.log(userName,userId,type)

  const router=useRouter()

  const[isSpeaking,setIsSpeaking]=useState(false)
  const[callStatus,setCallStatus]=useState<CallStatus>(CallStatus.INACTIVE)
  const [messages,setMessages]=useState<SavedMessage[]>([])  


    

    useEffect(()=>{
      const onCallStart=()=> setCallStatus(CallStatus.ACTIVE)
      const onCalEnd=()=> setCallStatus(CallStatus.FINISHED)

      const onMessage=(message:Message)=>{
          if(message.type === "transcript" && message.transcriptType === "final"){
            const newMessage={role:message.role,transcript:message.transcript}

            setMessages((prev) => [...prev , newMessage])
          }
      }

      const onSpeechStart=()=>setIsSpeaking(true)
      const onSpeechEnd=()=>setIsSpeaking(false)

      const onError=(error:Error)=> console.log('Error',error)

      vapi.on('call-start',onCallStart)
      vapi.on('call-end',onCalEnd)
      vapi.on('message',onMessage)
      vapi.on('speech-start',onSpeechStart)
      vapi.on('speech-end',onSpeechEnd)
      vapi.on('error',onError)


        return ()=>{
          vapi.off('call-start',onCallStart)
          vapi.off('call-end',onCalEnd)
          vapi.off('message',onMessage)
          vapi.off('speech-start',onSpeechStart)
          vapi.off('speech-end',onSpeechEnd)
          vapi.off('error',onError)
        }

    },[])


    useEffect(()=>{

      if(callStatus === CallStatus.FINISHED) router.push('/')

    },[messages,callStatus,type,userId])

    const handleCall=async()=>{
      console.log("call is clikced")
      setCallStatus(CallStatus.CONNECTING)

     
      console.log("Sending to Vapi => userId:", userId);

     vapi.start(process.env.NEXT_PUBLIC_ASSISTANT_ID!,  {
  variableValues: {
    username: userName,
  },
  metadata: {
    userid: userId,
  },
})
      

    }


    const handleDisconnect=async()=>{
      setCallStatus(CallStatus.FINISHED)

       vapi.stop()
    }


    const latestMessage=messages[messages.length-1]?.content

    const isCallInactiveOrFinished= callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED
  return (
    <>
     <div className="flex md:flex-row flex-col md:gap-x-6 gap-y-6  text-center my-8 ">
        {/* AI Interview card */}
      <div className="md:w-6/12  bg-indigo-100 p-10 rounded-lg flex flex-col items-center space-y-5 border-2 border-white ">
        <div className="relative  bg-gray-50 rounded-full p-3 w-20 h-20 flex flex-col justify-center items-center">
            <Image src="/ai-avatar.png" alt='ai' width={65} height={54} className="object-cover   "/>
            {isSpeaking && <span className="absolute inline-flex size-16 top-2 left-2 animate-ping rounded-full bg-gray-50 opacity-75"/>}
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
          
           <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0' , 'animate-fadeIn opacity-100')}>{latestMessage}</p>
         
        </div>
      )
    }

    {/* call status */}
    <div className="md:w-80 w-full mx-auto">
      { callStatus !== CallStatus.ACTIVE ? (
        <button className="rounded-full bg-green-600 w-full py-1 text-white" onClick={handleCall}>
           <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
         <span>{ isCallInactiveOrFinished? "Call" : "..."}</span>
        </button>
      ):(
        <button className="rounded-full bg-red-500 w-full py-1 text-white opacity-75" onClick={handleDisconnect}>End</button>
      )}
    </div>
    </>
   
  )
}

export default Agent;
