import { ReactNode } from 'react'

const AuthLayout = ({children}:{children:ReactNode}) => {
  return (
    <div className='flex justify-center items-center h-screen '>
      <div className=' w-[300px] md:w-[400px] bg-indigo-50 p-8 rounded-2xl shadow-2xl text-zinc-600'>
      {children}
      </div>
      
    </div>
  )
}

export default AuthLayout
