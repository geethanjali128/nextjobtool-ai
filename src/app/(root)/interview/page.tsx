import Agent from "@/components/common/Agent"

const page = () => {
  return (
    <>
      <h2 className="text-lg font-medium text-gray-700">Interview Generation</h2>

      <Agent userName="you" userId="user1" type="generate"/>
    </>
  )
}

export default page
