import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Mail, Phone, MapPin, Linkedin, Github, Send, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  const { portfolio } = usePortfolio();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const contactInfo = {
    email: portfolio.email,
    location: portfolio.location,
    github: portfolio.socialLinks?.github,
    linkedin: portfolio.socialLinks?.linkedin
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Your message has been sent! I\'ll get back to you soon.',
      severity: 'success'
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center animate-slide-up">
        <h1 className="section-title">Get In Touch</h1>
        <p className="section-subtitle">
          Have a question or want to work together? Feel free to reach out!
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
        {/* Contact Information */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <a 
                  href={`mailto:${contactInfo.email || 'ghadigaonkargargi@gmail.com'}`}
                  className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  {contactInfo.email || 'ghadigaonkargargi@gmail.com'}
                </a>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <a 
                  href={`tel:${contactInfo.phone || '+15307155928'}`}
                  className="text-gray-900 hover:text-primary-600 transition-colors duration-200"
                >
                  {contactInfo.phone || '+1 (530) 715-5928'}
                </a>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">
                  {contactInfo.location || 'Chico, CA, USA'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-4">Connect with me</p>
            <div className="flex space-x-3">
              {contactInfo.linkedin && (
                <a 
                  href={contactInfo.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors duration-200"
                >
                  <Linkedin className="h-5 w-5 text-primary-600" />
                </a>
              )}
              {contactInfo.github && (
                <a 
                  href={contactInfo.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                >
                  <Github className="h-5 w-5 text-gray-600" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Me a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="input-field resize-none"
                placeholder="Enter your message"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="btn-primary flex items-center"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 text-sm">{snackbar.message}</p>
              <button
                onClick={handleCloseSnackbar}
                className="ml-4 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
