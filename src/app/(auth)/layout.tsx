import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { isAuthenticated } from '../../../lib/actions/auth.action'

const AuthLayout = async ({children}:{children:ReactNode}) => {

  const isUserAuthenticated= await isAuthenticated()
    
    if(isUserAuthenticated) redirect("/")

  // console.log("layout re-render")
  return (
    <div className='flex justify-center items-center h-screen '>
      <div className=' w-[300px] md:w-[400px] bg-indigo-50 p-8 rounded-2xl shadow-2xl text-zinc-600'>
      {children}
      </div>
      
    </div>
  )
}

export default AuthLayout
