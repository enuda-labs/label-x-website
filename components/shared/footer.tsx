import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 pt-16 pb-8 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-purple-600"></div>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
                Lx
              </div>
              <span className="text-xl font-bold tracking-tight"> Labelx</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              AI-powered content moderation with human precision. We help platforms keep their content safe and appropriate.
            </p>
            
            <div className="flex gap-4">
              {['twitter', 'facebook', 'linkedin', 'github'].map((social, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Our Team', 'Careers', 'Press', 'News', 'Contact'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors duration-200">
                    <ChevronRight size={14} className="text-orange-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'API Documentation', 'Integrations', 'Case Studies', 'Download App'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors duration-200">
                    <ChevronRight size={14} className="text-orange-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {['Blog', 'Help Center', 'Community', 'Privacy Policy', 'Terms of Service', 'Status'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors duration-200">
                    <ChevronRight size={14} className="text-orange-500" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center md:flex md:justify-between md:items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Labelx. All rights reserved.
          </div>
          
          <div className="flex gap-6 justify-center md:justify-end text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

