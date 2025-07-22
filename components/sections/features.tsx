import React from 'react'
import { Shield, Cpu, Users, Eye, BarChart, Clock } from 'lucide-react'
import {
  AnimatedCard,
  AnimatedSection,
  AnimatedText,
} from '../shared/animated-sections'
import { motion } from 'framer-motion'

const featureItems = [
  {
    icon: <Cpu size={24} className="text-orange-500" />,
    title: 'Advanced AI Classification',
    description:
      'Our AI model accurately classifies content across multiple categories with high confidence scores.',
  },
  {
    icon: <Users size={24} className="text-orange-500" />,
    title: 'Human Review System',
    description:
      'Expert human reviewers validate AI classifications, ensuring accuracy in borderline cases.',
  },
  {
    icon: <Shield size={24} className="text-orange-500" />,
    title: 'Content Moderation',
    description:
      'Protect your platform from harmful, offensive, or inappropriate content with robust filtering.',
  },
  {
    icon: <Clock size={24} className="text-orange-500" />,
    title: 'Real-time Processing',
    description:
      'Process and classify content in real-time with minimal latency for seamless user experience.',
  },
  {
    icon: <BarChart size={24} className="text-orange-500" />,
    title: 'Detailed Analytics',
    description:
      'Gain insights into content trends, classification accuracy, and reviewer performance.',
  },
  {
    icon: <Eye size={24} className="text-orange-500" />,
    title: 'Content Oversight',
    description:
      'Monitor content classification across your platform with comprehensive dashboards.',
  },
]

export default function Features() {
  return (
    <section className="relative py-16" id="features">
      <motion.div
        className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
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

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Powerful Features for Content Classification
          </h2>
          <p className="text-lg text-gray-300">
            Our platform combines cutting-edge AI with human expertise to
            deliver the most accurate and reliable content moderation system
            available.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureItems.map((feature, index) => (
            <AnimatedCard
              key={index}
              delay={0.1 * index}
              className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50"
            >
              <motion.div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-20 md:mt-32">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            <AnimatedSection delay={0.2} className="order-2 flex-1 lg:order-1">
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                Review Content on Mobile & Web
              </h2>
              <p className="mb-6 text-lg text-gray-300">
                Our cross-platform solution allows your team to review content
                from anywhere, anytime. The intuitive interface makes it easy to
                manage content classification efficiently.
              </p>

              <ul className="space-y-4">
                {[
                  'Assign content for review with a single tap',
                  'View confidence scores and AI classifications',
                  'Override or confirm AI decisions quickly',
                  'Track review history and performance metrics',
                ].map((item, index) => (
                  <AnimatedText key={index} delay={0.3 + index * 0.1}>
                    <li className="flex items-start gap-3">
                      <motion.div
                        className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-500"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      >
                        ✓
                      </motion.div>
                      <span>{item}</span>
                    </li>
                  </AnimatedText>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.4} className="order-1 flex-1 lg:order-2">
              <motion.div
                className="relative mx-auto w-full max-w-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-orange-500 to-purple-600 opacity-75 blur"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900">
                  <motion.img
                    src="/phone.png"
                    alt="Labelx Content Review Interface"
                    className="w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
