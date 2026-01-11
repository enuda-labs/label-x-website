'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getUserDetails } from '@/services/apis/user'
import { useGlobalStore } from '@/context/store'

function Header() {
  const { user, setUser, isLoggedIn } = useGlobalStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  useEffect(() => {
    if (data?.user) {
      setUser(data.user)
    }
  }, [data, isLoggedIn, setUser])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollToPartner = () => {
    const section = document.getElementById('partnership')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-800/20 shadow-lg backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-xl font-bold text-white">
                Lx
              </div>
              <span className="text-xl font-bold tracking-tight">Labelx</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden space-x-8 md:flex">
            <Link href="/#features" className="nav-link">
              Features
            </Link>
            <Link href="/#pricing" className="nav-link">
              Pricing
            </Link>
            <Link href="/#partnership" className="nav-link">
              Partnership
            </Link>
            <Link href="/#about" className="nav-link">
              About
            </Link>
            <Link href="/subscriptions" className="nav-link">
              Subscriptions
            </Link>
            <Link href="/#contact" className="nav-link">
              Contact
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user?.id ? (
              <Link
                href={
                  user.is_admin
                    ? '/admin'
                    : user.is_reviewer
                      ? '/label/overview'
                      : '/client/overview'
                }
              >
                <span className="block w-full rounded-md px-3 py-3 text-center text-base font-medium text-white hover:text-orange-500">
                  Dashboard
                </span>
              </Link>
            ) : (
              <>
                <Link href={`/auth/role?returnTo=%2Fdashboard`}>
                  <span className="block rounded-md px-3 py-2 text-center text-base font-medium text-white hover:text-orange-500">
                    Get Started
                  </span>
                </Link>
                <Link href="/auth/login">
                  <button className="cursor-pointer rounded-lg bg-orange-500 px-6 py-2 font-medium text-white transition-colors duration-300 hover:bg-orange-600">
                    Login as client
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="rounded-b-lg bg-gray-900 shadow-xl md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              <a
                href="#features"
                className="block rounded-md px-3 py-3 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block rounded-md px-3 py-3 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#partnership"
                className="block rounded-md px-3 py-3 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Partnership
              </a>
              <a
                href="#about"
                className="block rounded-md px-3 py-3 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="block rounded-md px-3 py-3 hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-2">
                {user?.id ? (
                  <Link
                    href={
                      user.is_admin
                        ? '/admin'
                        : user.is_reviewer
                          ? '/label/overview'
                          : '/client/overview'
                    }
                  >
                    <span className="block w-full rounded-md px-3 py-3 text-center text-base font-medium text-white hover:text-orange-500">
                      Go to Dashboard
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link href={`/auth/role?returnTo=%2Fdashboard`}>
                      <span className="block w-full rounded-md px-3 py-3 text-center text-base font-medium text-white hover:text-orange-500">
                        Get Started
                      </span>
                    </Link>
                    <Link href="/auth/login">
                      <button
                        onClick={handleScrollToPartner}
                        className="block w-full rounded-md bg-orange-500 px-3 py-3 text-center text-base font-medium text-white hover:bg-orange-600"
                      >
                        Login as client
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
