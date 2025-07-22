'use client'
import About from '@/components/sections/about'
import Contact from '@/components/sections/contact'
import Features from '@/components/sections/features'
import Hero from '@/components/sections/hero'
import Partnership from '@/components/sections/partnership'
import Pricing from '@/components/sections/pricing'
import Header from '@/components/shared/navbar'
import Footer from '@/components/shared/footer'

export default function Home() {
  return (
    <>
      <Header />

      <div className="flex flex-col overflow-x-hidden">
        <Hero />
        <Features />
        <Pricing />
        <Partnership />
        <About />
        <Contact />
      </div>
      <Footer />
    </>
  )
}
