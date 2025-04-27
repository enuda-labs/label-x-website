import React, { useState } from 'react';
import { Handshake, ArrowRight } from 'lucide-react';

export default function Partnership() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    type: 'integration'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic would go here
    alert('Partnership request submitted!');
    setFormData({
      name: '',
      email: '',
      company: '',
      message: '',
      type: 'integration'
    });
  };

  return (
    <section className="py-16 relative" id="partnership">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Partner With Us</h2>
          <p className="text-gray-300 text-lg">
            Join our ecosystem of partners and collaborate on the future of content moderation.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6">Partnership Opportunities</h3>
              
              <div className="space-y-6 py-4 ">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Integration Partners</h4>
                    <p className="text-gray-400">
                      Integrate our content moderation API into your platform or service to provide enhanced content filtering.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Technology Partners</h4>
                    <p className="text-gray-400">
                      Combine your technology with our AI and human review system to create innovative solutions.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-medium mb-2">Reseller Partners</h4>
                    <p className="text-gray-400">
                      Add our content moderation solution to your portfolio and offer it to your customers.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
                    Lx
                  </div>
                  <div>
                    <h4 className="font-medium">Partner Program</h4>
                    <p className="text-sm text-gray-400">Benefits include revenue sharing, dedicated support, and co-marketing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:flex-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="john@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="Company, Inc."
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                    Partnership Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  >
                    <option value="integration">Integration Partner</option>
                    <option value="technology">Technology Partner</option>
                    <option value="reseller">Reseller Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Tell us about your interest
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                    placeholder="I'm interested in integrating your solution into our platform..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  Submit Request
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

