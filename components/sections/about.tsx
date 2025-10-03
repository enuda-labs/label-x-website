import React from 'react'
import { CheckCircle, Shield, Target } from 'lucide-react'
import Image from 'next/image'

export default function About() {
  return (
    <section className="background relative py-16" id="about">
      <div className="absolute top-1/3 left-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">About Labelx</h2>
          <p className="text-lg text-gray-300">
            We&apos;re on a mission to create safer digital spaces through
            intelligent content moderation.
          </p>
        </div>

        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="order-2 flex-1 lg:order-1">
            <h3 className="mb-6 text-2xl font-semibold">Our Story</h3>
            <p className="mb-6 text-gray-300">
              Labelx was founded in 2023 by a team of AI researchers and content
              moderation experts. We recognized that while AI has made
              tremendous progress in content classification, it still struggles
              with nuance, context, and edge cases that human reviewers excel
              at.
            </p>
            <p className="mb-6 text-gray-300">
              Our platform combines the best of both worlds: lightning-fast AI
              classification with human verification to ensure accuracy. By
              bridging this gap, we provide the most reliable content moderation
              solution available today.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-medium">Our Mission</h4>
                  <p className="text-gray-400">
                    To create safer digital spaces by providing accurate,
                    efficient, and scalable content moderation solutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Target size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-medium">Our Vision</h4>
                  <p className="text-gray-400">
                    A digital world where platforms can thrive with healthy,
                    positive user interactions, free from harmful content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Shield size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-medium">Our Values</h4>
                  <p className="text-gray-400">
                    Accuracy, transparency, privacy, and human-centered AI
                    development guide everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 flex-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Team working"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="AI development"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Data processing"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/3182744/pexels-photo-3182744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Team collaboration"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 rounded-2xl border border-gray-700 bg-gray-900/70 p-8 shadow-xl md:p-12">
          <div className="mb-10 text-center">
            <h3 className="mb-4 text-2xl font-semibold md:text-3xl">
              Meet Our Leadership
            </h3>
            <p className="mx-auto max-w-2xl text-gray-300">
              Our team brings together expertise in AI, content moderation, and
              platform security to deliver the best solution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              'CEO & Founder',
              'CTO',
              'Head of AI Research',
              'Head of Operations',
            ].map((role, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-800/20 backdrop-blur-sm">
                  <Image
                    src={`https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`}
                    alt={`Team member ${index + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold">
                  Team Member {index + 1}
                </h4>
                <p className="text-orange-500">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
