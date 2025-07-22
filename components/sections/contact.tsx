import React, { useState } from 'react'
import { Mail, Phone, Send, MessageSquare } from 'lucide-react'
import {toast} from 'sonner';
export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message have been recieved. Thank you for reaching out!')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    })
  }

  return (
    <section className="relative py-16" id="contact">
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Get in Touch</h2>
          <p className="text-lg text-gray-300">
            Have questions or need more information? Reach out to our team.
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1">
            <div className="h-full rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-semibold">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                    <Mail size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">Email Us</h4>
                    <p className="text-gray-400">info@enudalabs.com</p>
                    <p className="text-gray-400">support@enudalabs.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                    <Phone size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">Call Us</h4>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                    <p className="text-gray-400">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                {/* <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Visit Us</h4>
                    <p className="text-gray-400">123 AI Avenue</p>
                    <p className="text-gray-400">San Francisco, CA 94105</p>
                  </div>
                </div> */}

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                    <MessageSquare size={20} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">Live Chat</h4>
                    <p className="text-gray-400">
                      Available 24/7 on our website
                    </p>
                    <p className="text-gray-400">
                      Average response time: 2 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="mb-4 font-medium">Connect With Us</h4>
                <div className="flex gap-4">
                  {['twitter', 'facebook', 'linkedin', 'github'].map(
                    (social, index) => (
                      <a
                        key={index}
                        href="#"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 transition-colors duration-300 hover:bg-orange-500"
                      >
                        <span className="sr-only">{social}</span>
                        <svg
                          className="h-5 w-5 text-white"
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
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-semibold">Send a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="I'd like to learn more about..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/25"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
