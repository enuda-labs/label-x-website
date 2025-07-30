'use client'
import { Card } from '@/components/ui/card'
import { GridBackground } from '@/components/shared/grid-line'
import FloatingElements from './auth-floating-elements'
import WelcomeHeader from './welcome-header'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const AuthPages = ({children}:{children: ReactNode}) => {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] bg-[url(/auth-bg.jpg)] bg-cover bg-fixed bg-center text-white lg:overflow-hidden">
      <div className="absolute inset-0 bg-black/85" />
      <FloatingElements />

      <button
        onClick={handleGoBack}
        className="hover:text-primary relative top-4 left-3 z-50 flex items-center gap-x-2 hover:underline cursor-pointer"
      >
        <ArrowLeft /> Back
      </button>

      <section className="relative px-4 pt-5 pb-20 md:pt-16 lg:overflow-y-hidden">
        <GridBackground />
        <WelcomeHeader />
        <div className="container mx-auto -mt-5 md:mt-5">
          <div className="mx-auto max-w-[550px]">
            <Card className="max-h-[80vh]  border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
              {children}
            </Card> 
          </div>
        </div>
      </section>
    </div>
  )
}

export default AuthPages
