import Image from "next/image"
import { getTechLogos } from "../../../lib/utils"

const DisplayTechIcons = async ({techStack}: TechIconProps) => {

    const techIcons=await getTechLogos(techStack)
  return (
    <div className="flex flex-row items-center">
      {techIcons.slice(0,3).map(({tech,url},index)=>
        <div  key={index}  className={` bg-gray-600 rounded-full p-2 ${index>=1&& "-ml-2"}`}>
           < Image 
  
  src={url}
   alt={tech}
    width={100} 
    height={100}
    className="size-5"
    />
    
            </div>
      
          )}
    </div>
  )
}

export default DisplayTechIcons
