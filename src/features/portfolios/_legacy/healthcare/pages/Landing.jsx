import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from "@/shared/context/AuthContext";
import { useEffect } from 'react';
import { 
  FaHospital, 
  FaRocket, 
  FaCheck, 
  FaQuoteLeft, 
  FaUserMd, 
  FaHeart,
  FaEdit,      // Used in the features array
  FaPalette,   // Used in the features array
  FaFileAlt,   // Used in the features array
  FaImages,    // Used in the features array
  FaEnvelope,  // Used in the features array
  FaSearch     // Used in the features array
} from 'react-icons/fa';

export default function Landing() {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    document.title = 'Healthcare Platform - Build Your Practice Website';
  }, []);

  const features = [
    { name: 'Easy Content Management', description: 'Update services, hours, and staff info instantly with a simple editor.', icon: FaEdit },
    { name: 'Custom Branding', description: 'Apply your logo, colors, and fonts to match your practice identity.', icon: FaPalette },
    { name: 'Blog & Services', description: 'Publish professional articles and showcase all your specialized medical services.', icon: FaFileAlt },
    { name: 'Patient Gallery', description: 'Securely upload facility photos or before/after cases (where appropriate).', icon: FaImages },
    { name: 'Contact Forms', description: 'Integrated, secure forms to handle appointment requests and patient inquiries.', icon: FaEnvelope },
    { name: 'SEO Optimized', description: 'Built-in tools and structure to help patients find your practice online.', icon: FaSearch }
  ];

  const testimonials = [
    { quote: "Our new website was up in hours, not weeks. It instantly boosted our patient inquiries!", name: "Dr. L. Chen", title: "Pediatric Clinic Owner" },
    { quote: "The content editor is incredibly easy to use. Finally, a platform designed for busy medical professionals.", name: "A. Patel, RN", title: "Practice Manager" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <FaHospital className="text-6xl mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              Build Your Practice Website <span className="block text-blue-200">The Easy Way</span>
            </h1>
            <p className="text-xl opacity-90 mb-10 max-w-3xl mx-auto">
              The all-in-one platform designed for medical professionals.
            </p>
            
            {/* ✅ UPDATED: Auth-aware buttons */}
            <div className="flex gap-4 justify-center">
              {user ? (
                // User is logged in - show dashboard link
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg inline-flex items-center transform hover:scale-105"
                >
                  <FaRocket className="mr-2" />
                  Go to Dashboard
                </Link>
              ) : (
                // User not logged in - show sign up and login
                <>
                  <Link
                    to="/onboarding"
                    className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg inline-flex items-center transform hover:scale-105"
                  >
                    <FaRocket className="mr-2" />
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Powerful Tools, Zero Hassle
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-blue-600">
                <feature.icon className="text-4xl text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Trusted by Professionals
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500">
                <FaQuoteLeft className="text-2xl text-blue-400 mb-4" />
                <p className="text-gray-700 italic mb-4 text-lg">"{t.quote}"</p>
                <div className="flex items-center">
                  <FaUserMd className="text-3xl text-blue-600 mr-3" />
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo and Secondary CTA Footer */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="p-10 border-2 border-blue-200 bg-blue-50 rounded-2xl shadow-inner">
            <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center justify-center">
              <FaHeart className="mr-3 text-blue-600" />
              Ready to Launch Your Practice Online?
            </h2>
            <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
              Start building your professional website today or view our fully featured demo.
            </p>
            <div className="flex gap-6 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-md transform hover:scale-105"
                >
                  Access Dashboard
                </Link>
              ) : (
                <Link
                  to="/onboarding"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-md transform hover:scale-105"
                >
                  Create My Website Now
                </Link>
              )}
              <Link
                to="/portfolios/healthcare/demo"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                View Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}