'use client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { GridBackground } from '@/components/shared/grid-line'
import Login from './login'
import Signup from './signup'
import FloatingElements from './auth-floating-elements'
import WelcomeHeader from './welcome-header'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const AuthPages = () => {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] bg-[url(/auth-bg.jpg)] bg-cover bg-fixed bg-center text-white lg:overflow-hidden">
      <div className="absolute inset-0 bg-black/85" />
      <FloatingElements />

      <Link
        href="/"
        className="hover:text-primary relative top-4 left-3 z-50 flex items-center gap-x-2 hover:underline"
      >
        <ArrowLeft /> Back
      </Link>

      <section className="relative min-h-screen px-4 pt-5 pb-20 md:pt-8 lg:overflow-y-hidden">
        <GridBackground />
        <WelcomeHeader />
        <div className="container mx-auto -mt-5 md:mt-5">
          <div className="mx-auto max-w-md">
            <Card className="max-h-[80vh] border-white/10 bg-white/15 p-6 backdrop-blur-sm md:max-h-none lg:overflow-y-hidden">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="sticky top-0 z-10 grid w-full grid-cols-2 bg-white/30">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <Login />
                </TabsContent>

                <TabsContent value="signup" className="mt-6">
                  <Signup />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AuthPages
