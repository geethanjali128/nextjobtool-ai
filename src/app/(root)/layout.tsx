import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { isAuthenticated } from '../../../lib/actions/auth.action'

const RootLayout = async({children}:{children:ReactNode}) => {

  const isUserAuthenticated= await isAuthenticated()
  
  if(!isUserAuthenticated) redirect("/sign-in")
  return (
    <div className='bg-gray-100 h-screen'>
      <div className='mx-5 lg:mx-36 py-10'>
      <nav className='mb-10'>
        <Link href="/" className='flex items-center gap-2'>
        <Image src="/logo.svg" alt='logo' width={38} height={32}/>
        <h2 className='text-2xl '>nextjobtool-ai</h2>
        </Link>
      </nav>
      {children}
      </div>
      
    </div>
  )
}

export default RootLayout
