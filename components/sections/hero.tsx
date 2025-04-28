
import { DownloadIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedSection, AnimatedButton } from '../shared/animated-sections';
import Image from 'next/image';

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-orange-500/50 rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      y: [-20, -40, -60, -80],
      x: [0, 10, -10, 0]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
  />
);

const Hero = () => {
  return (
    <section className="pt-28 background md:pt-36 pb-12 relative overflow-hidden" id="home">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
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
                top: `${Math.random() * 100}%`
              }}
            >
              <FloatingParticle delay={i * 0.2} />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, 90, 180]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
            rotate: [180, 270, 360]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
        <AnimatedSection delay={0.2}>
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1 mb-6">
              <span className="bg-orange-500 h-2 w-2 rounded-full animate-pulse" />
              <span className="text-sm text-white/80">Now processing 1M+ data points daily</span>
            </div>
            </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-300">
              AI-Powered Content Moderation with Human Precision
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={0.6}>
            <p className="mt-6 text-lg md:text-xl text-gray-300">
              Leverage advanced AI to classify content, with expert human reviewers ensuring accuracy. Get faster, more reliable content moderation for your platform.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.8}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedButton
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
              >
                <DownloadIcon size={20} />
                App Store
              </AnimatedButton>
              <AnimatedButton
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg"
              >
                <DownloadIcon size={20} />
                Google Play
              </AnimatedButton>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={0.8}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src="https://images.pexels.com/photos/7567444/pexels-photo-7567444.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="AI Analysis Interface"
                  width={200}
                  height={200} 
                  className="w-full h-60 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Advanced AI Classification</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Human Review Process" 
                  width={200}
                  height={200} 
                  className="w-full h-60 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Expert Human Review</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Image 
                  src="https://images.pexels.com/photos/5473298/pexels-photo-5473298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Real-time Analytics" 
                  width={200}
                  height={200} 
                  className="w-full h-60 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Real-time Analytics</p>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={1}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "99.8%", label: "Classification Accuracy" },
                { value: "500+", label: "Content Categories" },
                { value: "30s", label: "Average Review Time" },
                { value: "24/7", label: "Support Available" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="p-4 rounded-lg bg-gray-800/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 * index }}
                >
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;