import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHealthcareBasePath } from "@/features/portfolios/_legacy/healthcare/hooks/useHealthcareBasePath";
import { 
  FaUserMd, FaHeartbeat, FaMicroscope, 
  FaShieldAlt, FaProcedures, FaTooth,
  FaCheck
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import Footer from '../components/Footer';
import { api } from '../lib/api';

export default function Services() {
  const { basePath, practiceId } = useHealthcareBasePath();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Services - Healthcare';
    if (practiceId) {
      loadData();
    }
  }, [practiceId]);

  const loadData = async () => {
    try {
      const data = await api.getPracticeData(practiceId); // ✅ Fixed
      setUserData(data);
    } catch (error) {
      console.error('Failed to load services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (iconName) => {
    const icons = {
      'tooth': FaTooth,
      'user-md': FaUserMd,
      'heartbeat': FaHeartbeat,
      'microscope': FaMicroscope,
      'shield-alt': FaShieldAlt,
      'procedures': FaProcedures
    };
    return icons[iconName] || FaUserMd;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={userData} practiceId={practiceId} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Medical Services</h1>
          <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto">
            Comprehensive healthcare services delivered by experienced professionals
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {userData?.services && userData.services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userData.services.map((service, index) => {
                const Icon = getServiceIcon(service.icon);
                return (
                  <div 
                    key={service.id || index} 
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 p-8"
                  >
                    {service.image ? (
                      <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-50 rounded-full w-20 h-20 mb-6 flex items-center justify-center">
                        <Icon className="text-blue-600 text-3xl" />
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    
                    {service.price && (
                      <div className="text-blue-600 font-bold text-xl mb-4">{service.price}</div>
                    )}
                    
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No services available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contact us today to schedule your appointment
          </p>
          <Link
            to={`${basePath}/contact`}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg inline-block transition-all hover:scale-105"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer userData={userData} practiceId={practiceId} />
      <ScrollToTop />
    </div>
  );
}