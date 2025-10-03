import React, { useEffect, useState } from 'react'
import { Handshake, ArrowRight } from 'lucide-react'

export default function Partnership() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    type: 'integration',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script')
      script.id = 'calendly-script'
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Build and open the dynamic Calendly popup
  const openCalendly = () => {
    const { name, email } = formData
    const calendlyUrl = new URL('https://calendly.com/enudalabs')
    if (name) calendlyUrl.searchParams.set('name', name)
    if (email) calendlyUrl.searchParams.set('email', email)

    if (typeof window !== 'undefined' && window.Calendly) {
      window.Calendly?.initPopupWidget({ url: calendlyUrl.toString() })
    } else {
      console.warn('Calendly widget not loaded yet.')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    openCalendly()
    setFormData({
      name: '',
      email: '',
      company: '',
      message: '',
      type: 'integration',
    })
  }

  return (
    <section className="relative py-10" id="partnership">
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Partner With Us
          </h2>
          <p className="text-lg text-gray-300">
            Join our ecosystem of partners and collaborate on the future of
            content moderation.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/20 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-semibold">
                Partnership Opportunities
              </h3>

              <div className="space-y-10 py-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-medium">
                      Integration Partners
                    </h4>
                    <p className="text-gray-400">
                      Integrate our content moderation API into your platform or
                      service to provide enhanced content filtering.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-medium">
                      Technology Partners
                    </h4>
                    <p className="text-gray-400">
                      Combine your technology with our AI and human review
                      system to create innovative solutions.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    <Handshake size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-medium">
                      Reseller Partners
                    </h4>
                    <p className="text-gray-400">
                      Add our content moderation solution to your portfolio and
                      offer it to your customers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-lg border-gray-700 bg-gray-900/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-xl font-bold text-white">
                    Lx
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Partner Program</h4>
                    <p className="text-sm text-gray-400">
                      Benefits include revenue sharing, dedicated support, and
                      co-marketing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:flex-1">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/20 p-8 backdrop-blur-sm">
              <h3 className="mb-6 text-2xl font-semibold">Get in Touch</h3>

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
                    className="w-full rounded-lg border border-gray-700 bg-gray-900/20 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                    className="w-full rounded-lg border border-gray-700 bg-gray-900/20 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-700 bg-gray-900/20 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Company, Inc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Partnership Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="h-12 w-full rounded-lg border border-gray-700 bg-gray-900/20 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="integration">Integration Partner</option>
                    <option value="technology">Technology Partner</option>
                    <option value="reseller">Reseller Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Tell us about your interest
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900/20 px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="I'm interested in integrating your solution into our platform..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/25"
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
  )
}
