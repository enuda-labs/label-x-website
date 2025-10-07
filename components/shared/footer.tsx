import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 pt-16 pb-8">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600"></div>
      <div className="pointer-events-none absolute top-0 left-0 h-64 w-full bg-gradient-to-b from-black/20 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div>
            <div className="mb-6 flex items-center space-x-2">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-xl font-bold text-white">
                Lx
              </div>
              <span className="text-xl font-bold tracking-tight"> Labelx</span>
            </div>

            <p className="mb-6 text-gray-400">
              AI-powered content moderation with human precision. We help
              platforms keep their content safe and appropriate.
            </p>

            <div className="flex gap-4">
              {['twitter', 'facebook', 'linkedin', 'github'].map(
                (social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 transition-colors duration-300 hover:bg-orange-500"
                  >
                    <span className="sr-only">{social}</span>
                    <svg
                      className="h-4 w-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                    </svg>
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Our Team', 'Careers', 'Contact'].map(
                (item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
                    >
                      <ChevronRight size={14} className="text-orange-500" />
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Product</h3>
            <ul className="space-y-3">
              {[
                'Features',
                'Pricing',
                // 'API Documentation',
                // 'Integrations',
                // 'Case Studies',
                'Download App',
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <ChevronRight size={14} className="text-orange-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <h3 className="mb-4 text-lg font-semibold">Resources</h3>
            <ul className="space-y-3">
              {[
                'Blog',
                'Help Center',
                'Community',
                'Privacy Policy',
                'Terms of Service',
                'Status',
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <ChevronRight size={14} className="text-orange-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        <div className="border-t border-gray-800 pt-8 text-center md:flex md:items-center md:justify-between">
          <div className="mb-4 text-gray-400 md:mb-0">
            &copy; {new Date().getFullYear()} Labelx. All rights reserved.
          </div>

          <div className="flex justify-center gap-6 text-sm text-gray-500 md:justify-end">
            <a
              href="#"
              className="transition-colors duration-200 hover:text-gray-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors duration-200 hover:text-gray-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="transition-colors duration-200 hover:text-gray-300"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
