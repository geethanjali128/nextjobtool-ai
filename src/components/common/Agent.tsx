
'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { interviewer } from "../../../constants"
import { createFeedback } from "../../../lib/actions/general.actions"
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


const Agent = ({userName,userId,type,interviewId,questions}:AgentProps) => {

  // console.log(userName,userId,type)

  const router=useRouter()

  const[isSpeaking,setIsSpeaking]=useState(false)
  const[callStatus,setCallStatus]=useState<CallStatus>(CallStatus.INACTIVE)
  const [messages,setMessages]=useState<SavedMessage[]>([])  


    

    useEffect(()=>{
      const onCallStart=()=> setCallStatus(CallStatus.ACTIVE)
      const onCalEnd=()=> setCallStatus(CallStatus.FINISHED)

      const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
    const newMessage: SavedMessage = {
      role: message.role,
      content: message.transcript,
    };

    setMessages((prev) => [...prev, newMessage]);
  }
};


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


    const handleGenerateFeedback=async(message:SavedMessage[])=>{
        console.log("Generate feedback here",message)

        // pending -create a server action that generates feedback
        const{success,feedbackId:id}= await createFeedback({
          interviewId:interviewId!,
          userId:userId!,
          transcript:messages

        })

        if(success && id){
          router.push(`/interview/${interviewId}/feedback`)
        }else{
          console.log("Error saving feedback")
          router.push('/')
        }
    }

    useEffect(()=>{

     if(callStatus === CallStatus.FINISHED){
      if(type === 'generate'){
        router.push('/')
      }else{
        handleGenerateFeedback(messages)
      }
     }

    },[messages,callStatus,type,userId])

    const handleCall=async()=>{
      console.log("call is clikced")
      setCallStatus(CallStatus.CONNECTING)

      if(type === 'generate'){
          await   vapi.start(process.env.NEXT_PUBLIC_ASSISTANT_ID!, {
        variableValues: {
         username: userName,
        userid: userId, // ✅ send this here instead of metadata
        }
      })
      }else{
        let formattedQuestions=""
        if(questions){
          formattedQuestions=questions.map(question => `-${question}`).join('\n')
        }

        await vapi.start(interviewer,{
          variableValues:{
            question:formattedQuestions
          }
        })
      }
 
      

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
      messages.length > 0 && (
        <div className="my-10 bg-indigo-100 py-2 border-2 border-indigo-200 rounded-md text-center shadow-inner">
          
           <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0' , 'animate-fadeIn opacity-100')}>{latestMessage}</p>
         
        </div>
      )
    }

    {/* call status */}
    <div className="md:w-80 w-full mx-auto">
      { callStatus !== CallStatus.ACTIVE ? (
        <button className="rounded-full bg-green-600 w-full py-1 text-white  transition-all duration-500 ease-in-out
             hover:bg-green-700 hover:text-gray-100 cursor-pointer" onClick={handleCall}>
           <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
         <span>{ isCallInactiveOrFinished? "Call" : "..."}</span>
        </button>
      ):(
        <button className="rounded-full bg-red-500 w-full py-1 text-white opacity-75
             hover:opacity-100 hover:bg-red-600 hover:text-gray-100
             transition-all duration-300 ease-in-out cursor-pointer"  onClick={handleDisconnect}>End</button>
      )}
    </div>
    </>
   
  )
}

export default Agent;
