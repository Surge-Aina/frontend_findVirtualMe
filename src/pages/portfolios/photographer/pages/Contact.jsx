import { useState, useEffect } from 'react';
import Editable from '../components/Editable';

export default function Contact() {
  const [email, setEmail] = useState('janedoe@example.com');
  const [phone, setPhone] = useState('(123) 456-7890');
  const [responseTime, setResponseTime] = useState('Within 24 hours');
  const [description, setDescription] = useState('Ready to capture your special moments?')

  // Load initial contact data from backend
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        // Fetch description
        const descriptionRes = await fetch('http://localhost:5000/settings/contactDescription');
        if (descriptionRes.ok) {
          const descriptionData = await descriptionRes.json();
          if (descriptionData.value) {
            setDescription(descriptionData.value);
          }
        }

        // Fetch email
        const emailRes = await fetch('http://localhost:5000/settings/contactEmail');
        if (emailRes.ok) {
          const emailData = await emailRes.json();
          if (emailData.value) {
            setEmail(emailData.value);
          }
        }

        // Fetch phone
        const phoneRes = await fetch('http://localhost:5000/settings/contactPhone');
        if (phoneRes.ok) {
          const phoneData = await phoneRes.json();
          if (phoneData.value) {
            setPhone(phoneData.value);
          }
        }

        // Fetch response time
        const responseTimeRes = await fetch('http://localhost:5000/settings/contactResponseTime');
        if (responseTimeRes.ok) {
          const responseTimeData = await responseTimeRes.json();
          if (responseTimeData.value) {
            setResponseTime(responseTimeData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch contact data:', err);
      }
    };

    fetchContactData();
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
    
    try {
      await fetch('http://localhost:5000/settings/contactDescription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDescription }),
      });
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  };

  const handleEmailChange = async (newEmail) => {
    setEmail(newEmail);
    
    try {
      await fetch('http://localhost:5000/settings/contactEmail', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newEmail }),
      });
    } catch (err) {
      console.error('Failed to save email:', err);
    }
  };

  const handlePhoneChange = async (newPhone) => {
    setPhone(newPhone);
    
    try {
      await fetch('http://localhost:5000/settings/contactPhone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newPhone }),
      });
    } catch (err) {
      console.error('Failed to save phone:', err);
    }
  };

  const handleResponseTimeChange = async (newTime) => {
    setResponseTime(newTime);
  
    try {
      await fetch('http://localhost:5000/settings/contactResponseTime', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newTime }),
      });
    } catch (err) {
      console.error('Failed to save response time:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Hero Section */}
      <div className="relative px-4 md:px-8 py-12 md:py-16 lg:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extralight mb-6 md:mb-8 text-gray-900 tracking-wider">
            Let's Connect
          </h1>
          <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-6 md:mb-8 animate-expand"></div>
          <Editable
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            tag="p"
            className="text-lg sm:text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto px-2"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8 md:pb-12 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-20 items-start">
          {/* Contact Info Card */}
          <div className="space-y-6 md:space-y-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-700 transform hover:scale-105 text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 md:mb-10 text-gray-900 tracking-wide">Get In Touch</h2>
              <div className="w-16 md:w-20 h-0.5 bg-gray-300 mb-6 md:mb-10"></div>
            
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-start sm:items-center space-x-4 md:space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg mt-1 sm:mt-0">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider mb-1 md:mb-2">Email</p>
                    <Editable 
                      type="text" 
                      value={email} 
                      onChange={handleEmailChange} 
                      className="text-lg md:text-xl text-gray-700 font-light hover:text-black transition-colors cursor-pointer break-all" 
                    />
                  </div>
                </div>

                <div className="flex items-start sm:items-center space-x-4 md:space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg mt-1 sm:mt-0">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider mb-1 md:mb-2">Phone</p>
                    <Editable 
                      type="text" 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      className="text-lg md:text-xl text-gray-700 font-light hover:text-black transition-colors cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="flex items-start sm:items-center space-x-4 md:space-x-6 group">
                  <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg mt-1 sm:mt-0">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wider mb-1 md:mb-2">Response Time</p>
                    <Editable 
                      type="text" 
                      value={responseTime} 
                      onChange={handleResponseTimeChange} 
                      className="text-lg md:text-xl text-gray-700 font-light hover:text-black transition-colors cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-700 transform hover:scale-105 text-left">
              <h3 className="text-2xl sm:text-3xl font-light mb-6 md:mb-8 text-gray-900 tracking-wide">What I Offer</h3>
              <div className="w-12 md:w-16 h-0.5 bg-gray-300 mb-6 md:mb-8"></div>
              <div className="space-y-4 md:space-y-6">
                {['Wedding Photography', 'Portrait Sessions', 'Event Coverage', 'Corporate Photography'].map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 md:space-x-4 group">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full group-hover:bg-gradient-to-br group-hover:from-gray-800 group-hover:to-black transition-all duration-300 flex-shrink-0"></div>
                    <span className="font-light text-base md:text-lg text-gray-700 group-hover:text-black transition-colors duration-300">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-700 transform hover:scale-105 text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 md:mb-10 text-gray-900 tracking-wide">Send a Message</h2>
              <div className="w-16 md:w-20 h-0.5 bg-gray-300 mb-6 md:mb-10"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="space-y-2 md:space-y-3">
                  <label className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 md:p-5 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-black focus:outline-none transition-all duration-500 font-light text-base md:text-lg hover:border-gray-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-4 md:p-5 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-black focus:outline-none transition-all duration-500 font-light text-base md:text-lg hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2 md:space-y-3">
                  <label className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">Your Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={5}
                    className="w-full p-4 md:p-5 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-black focus:outline-none transition-all duration-500 resize-none font-light text-base md:text-lg hover:border-gray-300"
                    placeholder="Tell me about your project, event date, and any specific requirements..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-br from-gray-900 to-black text-white py-4 md:py-5 px-6 md:px-8 rounded-xl md:rounded-2xl font-light text-base md:text-lg hover:from-black hover:to-gray-800 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-500"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 md:mt-24 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
          <div className="inline-block group w-full max-w-4xl">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 p-8 md:p-12 lg:p-16 border border-gray-100 hover:border-gray-200 mx-auto">
              <div className="space-y-6 md:space-y-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto group-hover:from-gray-900 group-hover:to-black transition-all duration-500">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-4 md:mb-6 tracking-wide">
                    Ready to get started?
                  </h3>
                  <p className="text-gray-600 font-light mb-6 md:mb-10 leading-relaxed text-base md:text-lg max-w-2xl mx-auto px-2">
                    Every great photo session begins with a conversation. Let's discuss your vision and create something beautiful together.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4">
                  <a
                    href={`tel:${phone}`}
                    className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-br from-gray-900 to-black text-white rounded-xl md:rounded-2xl hover:from-black hover:to-gray-800 transition-all duration-500 font-light text-base md:text-lg tracking-wide transform hover:-translate-y-1 hover:shadow-lg text-center"
                  >
                    Call Now
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="px-8 md:px-10 py-3 md:py-4 border-2 border-gray-200 text-gray-700 rounded-xl md:rounded-2xl hover:border-black hover:bg-gray-50 transition-all duration-500 font-light text-base md:text-lg tracking-wide transform hover:-translate-y-1 text-center"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slow-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }

        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slow-float {
          animation: slow-float 8s ease-in-out infinite;
        }

        .animate-expand {
          animation: expand 1.5s ease-out forwards;
          animation-delay: 0.5s;
          width: 0;
        }
      `}</style>
    </div>
  );
}