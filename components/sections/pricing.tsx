import React from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <section className="py-16 relative" id="pricing">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-gray-300 text-lg">
            Get started for free. Upgrade as your needs grow.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {/* Free Plan */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden w-full max-w-md mx-auto">
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-2">Free Trial</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-6">
                Perfect for testing and evaluating our platform.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 1,000 content items per month',
                  'Basic AI classification',
                  'Limited human review requests',
                  'Email support',
                  '1 team member'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300">
                Start Free Trial
              </button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-sm rounded-2xl border border-orange-500/30 overflow-hidden w-full max-w-md mx-auto relative">
            <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-sm font-semibold">
              POPULAR
            </div>
            
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">Coming Soon</span>
              </div>
              <p className="text-gray-300 mb-6">
                For businesses requiring reliable content moderation.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 10,000 content items per month',
                  'Advanced AI classification',
                  'Priority human review',
                  '24/7 priority support',
                  'Up to 5 team members',
                  'Custom categories',
                  'API access'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-300 shadow-lg shadow-orange-500/20">
                Contact Sales
              </button>
            </div>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden w-full max-w-md mx-auto">
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="text-gray-400 mb-6">
                Tailored solutions for large organizations.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited content processing',
                  'Custom AI model training',
                  'Dedicated human review team',
                  'Dedicated account manager',
                  'Unlimited team members',
                  'SLA guarantees',
                  'Custom integration support',
                  'On-premise deployment options'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

