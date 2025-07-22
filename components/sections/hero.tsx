import { DownloadIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedSection, AnimatedButton } from '../shared/animated-sections'
import Image from 'next/image'

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute h-2 w-2 rounded-full bg-orange-500/50"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [-20, -40, -60, -80],
      x: [0, 10, -10, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: 'easeInOut',
    }}
  />
)

const Hero = () => {
  return (
    <section
      className="background relative overflow-hidden pt-28 pb-12 md:pt-36"
      id="home"
    >
      {/* Background Animation */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <FloatingParticle delay={i * 0.2} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500/20 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
            rotate: [180, 270, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: 5,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <AnimatedSection delay={0.2}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="text-sm text-white/80">
                Now processing 1M+ data points daily
              </span>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <h1 className="bg-gradient-to-r from-white to-orange-300 bg-clip-text text-4xl leading-tight font-bold text-transparent sm:text-5xl md:text-6xl">
              AI-Powered Content Moderation with Human Precision
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.6}>
            <p className="mt-6 text-lg text-gray-300 md:text-xl">
              Leverage advanced AI to classify content, with expert human
              reviewers ensuring accuracy. Get faster, more reliable content
              moderation for your platform.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.8}>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <AnimatedButton className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/25">
                <DownloadIcon size={20} />
                App Store
              </AnimatedButton>
              <AnimatedButton className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-gray-700">
                <DownloadIcon size={20} />
                Google Play
              </AnimatedButton>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.8}>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://images.pexels.com/photos/7567444/pexels-photo-7567444.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="AI Analysis Interface"
                  width={200}
                  height={200}
                  className="h-60 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-sm text-white">
                    Advanced AI Classification
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Human Review Process"
                  width={200}
                  height={200}
                  className="h-60 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-sm text-white">Expert Human Review</p>
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://images.pexels.com/photos/5473298/pexels-photo-5473298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Real-time Analytics"
                  width={200}
                  height={200}
                  className="h-60 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-sm text-white">Real-time Analytics</p>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={1}>
            <div className="mt-16 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {[
                { value: '99.8%', label: 'Classification Accuracy' },
                { value: '500+', label: 'Content Categories' },
                { value: '30s', label: 'Average Review Time' },
                { value: '24/7', label: 'Support Available' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="transform rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm transition-transform duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                >
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

export default Hero
