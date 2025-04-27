import React from 'react';
import { CheckCircle, Shield, Target } from 'lucide-react';
import Image from 'next/image';

export default function About(){
  return (
    <section className="pb-16 relative" id="about">
      <div className="absolute top-1/3 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Labelx</h2>
          <p className="text-gray-300 text-lg">
            We&apos;re on a mission to create safer digital spaces through intelligent content moderation.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 order-2 lg:order-1">
            <h3 className="text-2xl font-semibold mb-6">Our Story</h3>
            <p className="text-gray-300 mb-6">
              Labelx was founded in 2023 by a team of AI researchers and content moderation experts. We recognized that while AI has made tremendous progress in content classification, it still struggles with nuance, context, and edge cases that human reviewers excel at.
            </p>
            <p className="text-gray-300 mb-6">
              Our platform combines the best of both worlds: lightning-fast AI classification with human verification to ensure accuracy. By bridging this gap, we provide the most reliable content moderation solution available today.
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <CheckCircle size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-2">Our Mission</h4>
                  <p className="text-gray-400">
                    To create safer digital spaces by providing accurate, efficient, and scalable content moderation solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Target size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-2">Our Vision</h4>
                  <p className="text-gray-400">
                    A digital world where platforms can thrive with healthy, positive user interactions, free from harmful content.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Shield size={24} className="text-orange-500" />
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-2">Our Values</h4>
                  <p className="text-gray-400">
                    Accuracy, transparency, privacy, and human-centered AI development guide everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image 
                  src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Team working"
                  width={400}
                    height={400} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image 
                  src="https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="AI development"
                  width={400}
                    height={400} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image 
                  src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Data processing"
                  width={400}
                    height={400} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <Image
                  src="https://images.pexels.com/photos/3182744/pexels-photo-3182744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Team collaboration" 
                  width={400}
                  height={400}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 shadow-xl border border-gray-700">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Meet Our Leadership</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our team brings together expertise in AI, content moderation, and platform security to deliver the best solution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['CEO & Founder', 'CTO', 'Head of AI Research', 'Head of Operations'].map((role, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
                  <Image 
                    src={`https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`} 
                    alt={`Team member ${index + 1}`} 
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold">Team Member {index + 1}</h4>
                <p className="text-orange-500">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

