'use client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { GridBackground } from '@/components/shared/grid-line'
import Login from './login'
import Signup from './signup'
import Link from 'next/link'

const AuthPages = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#0A0A0A] bg-cover bg-[url(https://images.unsplash.com/photo-1677442135136-760c813028c0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fGFpfGVufDB8fDB8fHww)] h-screen bg-center text-white">
<div className='absolute inset-0 bg-black/85' />
<Link href="/" className="relative z-50 ml-5 mt-5 flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-xl font-bold text-white">
                Lx
              </div>
              <span className="text-xl font-bold tracking-tight">Labelx</span>
            </Link>
      <section className="relative overflow-hidden px-4 pt-32 pb-20">
        <GridBackground />
        <div className="container mx-auto">
          <div className="mx-auto max-w-md">
            <Card className="border-white/10 bg-white/20 p-6 backdrop-blur-sm">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5">
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
