import Agent from "@/components/common/Agent"
import { getCurrentUser } from "../../../../lib/actions/auth.action"

const page = async() => {

  const user= await getCurrentUser()
  return (
    <>
      <h2 className="text-lg font-medium text-gray-700">Interview Generation</h2>

      <Agent userName={user?.name} userId={user?.id} type="generate"/>
    </>
  )
}

export default page
