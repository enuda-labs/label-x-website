'use client'

import { Button } from '@/components/ui/button'
import Navbar from '@/components/shared/navbar'
import { GridBackground } from '@/components/shared/grid-line'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionPlans } from '@/services/apis/subscription'
import { getUserDetails } from '@/services/apis/user'
import { planFeats } from '@/utils'

const Subscriptions = () => {
  const router = useRouter()
  const { data } = useQuery({
    queryKey: ['plan'],
    queryFn: getSubscriptionPlans,
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 pt-32 pb-20">
        <GridBackground />
        <motion.div
          className="bg-background absolute bottom-0 left-0 h-80 w-80 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <div className="container mx-auto">
          <div className="mx-auto mb-20 max-w-4xl text-center">
            <h1 className="font-heading mb-8 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">
              Get started with AI data processing and human intelligence review
              services
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {data?.detail &&
                data.detail.map((plan) => (
                  <div
                    className={`border bg-white/5 backdrop-blur-sm ${
                      plan.name === 'pro'
                        ? 'border-primary/30'
                        : 'border-white/10'
                    } relative rounded-xl p-8 transition-colors hover:bg-white/10`}
                    key={plan.id}
                  >
                    {plan.name === 'pro' && (
                      <div className="bg-primary absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-xs font-medium">
                        POPULAR
                      </div>
                    )}
                    <h3 className="font-heading mb-4 text-xl font-semibold capitalize">
                      {plan.name}
                    </h3>
                    <div className="mb-4 text-4xl font-bold">
                      ${plan.monthly_fee}
                      <span className="text-lg text-white/60">/mo</span>
                    </div>
                    <ul className="mb-8 space-y-3 text-left text-white/70">
                      {planFeats(plan.name).map((feat) => (
                        <li key={feat}>• {feat}</li>
                      ))}
                    </ul>
                    <Button
                      className="bg-primary hover:bg-primary/90 w-full cursor-pointer"
                      onClick={() =>
                        user
                          ? router.push('dashboard')
                          : router.push(
                              `/auth/login?plan=${plan.name}&returnTo=%2Fdashboard`
                            )
                      }
                    >
                      Get Started
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Subscriptions
