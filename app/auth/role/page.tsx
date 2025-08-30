'use client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import WelcomeHeader from '@/components/auth/welcome-header'

import { Users, Tags } from 'lucide-react'
import FloatingElements from '@/components/auth/auth-floating-elements'

const RoleSelection = () => {
  const router = useRouter()

  const handleRoleSelect = (
    role: 'individual' | 'organization' | 'labeler'
  ) => {
    router.push(`/auth/signup?role=${role}`)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <div className="absolute inset-0 bg-[url(/auth-bg.jpg)] bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-black/85" />

      <FloatingElements />

      <div
        className="relative z-50 mt-5 ml-5 flex items-center space-x-2"
        onClick={() => router.push('/')}
      >
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold text-white shadow-lg">
          Lx
        </div>
        <span className="text-xl font-bold tracking-tight">Labelx</span>
      </div>

      <section className="relative overflow-hidden px-4 pt-16 pb-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-5xl">
            <WelcomeHeader />

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Individual Card */}
              {/* <Card
                className="group cursor-pointer border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-lg transition-all duration-300 hover:bg-white/15"
                onClick={() => handleRoleSelect('individual')}
              >
                <div className="space-y-4 text-center">
                  <div className="from-primary to-primary-glow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r transition-transform duration-300 group-hover:scale-110">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Individual</h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Perfect for freelancers, researchers, and individual data
                    scientists looking to annotate datasets for personal or
                    small-scale projects.
                  </p>
                  <Button
                    className="mt-6 h-11 w-full transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelect('individual')
                    }}
                  >
                    Continue as Individual
                  </Button>
                </div>
              </Card> */}

              {/* Company Card */}
              <Card
                className="group cursor-pointer border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-lg transition-all duration-300 hover:bg-white/15"
                onClick={() => handleRoleSelect('organization')}
              >
                <div className="space-y-4 text-center">
                  <div className="from-primary to-primary-glow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r transition-transform duration-300 group-hover:scale-110">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Client</h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Perfect for freelancers, researchers, individual data
                    scientists, organizations, teams, and enterprises. Whether
                    you&lsquo;re annotating datasets for personal projects or
                    managing large-scale collaborative annotation workflows with
                    advanced project management features.
                  </p>
                  <Button
                    className="mt-6 h-11 w-full transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRoleSelect('individual')
                    }}
                  >
                    Continue as a Client
                  </Button>
                </div>
              </Card>

              <Card
                className="group cursor-pointer border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-lg transition-all duration-300 hover:bg-white/15"
                onClick={() => router.push('/auth/login-only')}
              >
                <div className="space-y-4 text-center">
                  <div className="from-primary to-primary-glow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r transition-transform duration-300 group-hover:scale-110">
                    <Tags className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Labelers</h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Perfect for professional annotators, data labelers, and
                    specialists who provide high-quality annotation services to
                    clients across various industries and project scales.
                  </p>
                  <Button className="mt-6 h-11 w-full transition-all duration-300">
                    Continue as a Labeler
                  </Button>
                </div>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/60">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-primary hover:text-primary-glow underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RoleSelection
