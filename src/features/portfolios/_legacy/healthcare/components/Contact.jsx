import { useState } from 'react'
import { FaPhone, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission - replace with actual API call
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.')
      setFormData({ fullName: '', email: '', phone: '', message: '' })
      setIsSubmitting(false)
    }, 2000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="bg-primary text-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            [Contact us today to schedule your appointment or ask any questions]
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <FaPhone className="text-xl mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-blue-100">[+1 (555) 123-4567]</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaWhatsapp className="text-xl mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-blue-100">[+1 (555) 123-4567]</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaEnvelope className="text-xl mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-blue-100">[info@yourpractice.com]</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-xl mr-4 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-blue-100">
                    [123 Healthcare Blvd, Suite 100]<br />
                    [Medical City, TX 75001]
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-xl mr-4 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold">Hours</p>
                  <p className="text-blue-100">
                    Mon-Fri: [8:00 AM - 6:00 PM]<br />
                    Sat: [9:00 AM - 2:00 PM]<br />
                    Sun: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white/10 rounded-xl p-8 backdrop-blur">
            <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 resize-vertical"
                  placeholder="How can we help you?"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-primary hover:bg-gray-100 disabled:opacity-50 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
            
            <p className="text-xs text-blue-100 mt-4">
              Your information is secure and will only be used to respond to your inquiry.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}