import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

const RootLayout = ({children}:{children:ReactNode}) => {
  return (
    <div className='bg-gray-100 h-full'>
      <div className='mx-5 lg:mx-56 py-10'>
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
