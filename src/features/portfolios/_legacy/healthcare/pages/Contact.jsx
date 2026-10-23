import { useState, useEffect } from 'react';
import { useHealthcareBasePath } from "@/features/portfolios/_legacy/healthcare/hooks/useHealthcareBasePath";
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaClock, FaPaperPlane, FaWhatsapp
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import { api } from '../lib/api';

export default function Contact() {
  const { practiceId } = useHealthcareBasePath();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    document.title = 'Contact Us - Healthcare';
    if (practiceId) {
      loadData();
    }
  }, [practiceId]);

  const loadData = async () => {
    try {
      const data = await api.getPracticeData(practiceId); // ✅ Fixed
      setUserData(data);
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('sending');
    //call contactMe route
    try {

      const formattedMesage = `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;

      const formDataToSend = {
        name: formData.name,
        email: formData.email,
        message: formattedMesage,
        portfolioId: practiceId,
        ownerEmail: userData.contact.email,
        ownerName: userData.practiceName || 'Healthcare Practice',
      };
      // console.log("formDataToSend:", formDataToSend);
      await api.contactMe(formDataToSend);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
        console.error('Error submitting contact form:', error);
        setSubmitStatus('error');
        return;
      }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading contact information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={userData} practiceId={practiceId} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
            Get in touch with our team - we're here to help
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get In Touch</h2>
              
              <div className="space-y-6">
                {/* Phone */}
                {userData?.contact?.phone && (
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-4 mr-4">
                      <FaPhone className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a href={`tel:${userData.contact.phone}`} className="text-gray-600 hover:text-blue-600">
                        {userData.contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {userData?.contact?.whatsapp && (
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-4 mr-4">
                      <FaWhatsapp className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                      <a href={`https://wa.me/${userData.contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600">
                        {userData.contact.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {userData?.contact?.email && (
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-4 mr-4">
                      <FaEnvelope className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href={`mailto:${userData.contact.email}`} className="text-gray-600 hover:text-blue-600">
                        {userData.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {userData?.contact?.address && (
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-4 mr-4">
                      <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                      <p className="text-gray-600">
                        {userData.contact.address.street}<br />
                        {userData.contact.address.city}, {userData.contact.address.state} {userData.contact.address.zip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hours */}
                {userData?.hours && (
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-4 mr-4">
                      <FaClock className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>{userData.hours.weekdays}</p>
                        <p>{userData.hours.saturday}</p>
                        <p>{userData.hours.sunday}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                  Thank you! Your message has been sent successfully.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitStatus === 'sending'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {submitStatus === 'sending' ? (
                    'Sending...'
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer userData={userData} practiceId={practiceId} />
      <ScrollToTop />
    </div>
  );
}