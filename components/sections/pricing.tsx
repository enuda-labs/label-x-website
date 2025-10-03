import React from 'react'
import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <section className="relative py-16" id="pricing">
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-300">
            Get started for free. Upgrade as your needs grow.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-8 lg:flex-row">
          {/* Free Plan */}
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/20 backdrop-blur-sm">
            <div className="p-8">
              <h3 className="mb-2 text-xl font-semibold">Free Trial</h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="mb-6 text-gray-400">
                Perfect for testing and evaluating our platform.
              </p>

              <ul className="mb-8 space-y-3">
                {[
                  'Up to 1,000 content items per month',
                  'Basic AI classification',
                  'Limited human review requests',
                  'Email support',
                  '1 team member',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 flex-shrink-0 text-orange-500"
                    />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="flex w-full items-center justify-center rounded-lg bg-gray-700 py-3 font-medium text-white transition-colors duration-300 hover:bg-gray-600"
              >
                Start Free Trial
              </a>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-sm">
            <div className="absolute top-0 right-0 bg-orange-500 px-4 py-1 text-sm font-semibold text-white">
              POPULAR
            </div>

            <div className="p-8">
              <h3 className="mb-2 text-xl font-semibold">Pro</h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold">Coming Soon</span>
              </div>
              <p className="mb-6 text-gray-300">
                For businesses requiring reliable content moderation.
              </p>

              <ul className="mb-8 space-y-3">
                {[
                  'Up to 10,000 content items per month',
                  'Advanced AI classification',
                  'Priority human review',
                  '24/7 priority support',
                  'Up to 5 team members',
                  'Custom categories',
                  'API access',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 flex-shrink-0 text-orange-500"
                    />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="flex w-full items-center justify-center rounded-lg bg-orange-500 py-3 font-medium text-white shadow-lg shadow-orange-500/20 transition-colors duration-300 hover:bg-orange-600"
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/20 backdrop-blur-sm">
            <div className="p-8">
              <h3 className="mb-2 text-xl font-semibold">Enterprise</h3>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <p className="mb-6 text-gray-400">
                Tailored solutions for large organizations.
              </p>

              <ul className="mb-8 space-y-3">
                {[
                  'Unlimited content processing',
                  'Custom AI model training',
                  'Dedicated human review team',
                  'Dedicated account manager',
                  'Unlimited team members',
                  'SLA guarantees',
                  'Custom integration support',
                  'On-premise deployment options',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 flex-shrink-0 text-orange-500"
                    />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="flex w-full items-center justify-center rounded-lg bg-gray-700 py-3 font-medium text-white transition-colors duration-300 hover:bg-gray-600"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
