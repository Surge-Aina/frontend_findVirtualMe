import { useNavigate, useParams, Link } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { 
  FaHome, FaCog, FaFileAlt, FaUsers, FaImages, 
  FaEnvelope, FaSignOutAlt, FaSave, FaEdit, 
  FaPlus, FaTrash, FaTimes, FaEye, FaSearch, FaArrowLeft 
} from 'react-icons/fa'

  const checkAuth = () => {
  const token = localStorage.getItem('token'); // Main platform token
  const { practiceId } = useParams();
  
  if (!token) {
    navigate('/login'); // Main platform login
    return false;
  }
  return true;
};
// Lazy load admin components
const ServicesEditor = lazy(() => import('../../components/admin/ServicesEditor'))
const BlogEditor = lazy(() => import('../../components/admin/BlogEditor'))
const GalleryEditor = lazy(() => import('../../components/admin/GalleryEditor'))
const tabs = [
  { id: 'practice', label: 'Practice Info', icon: FaHome },
  { id: 'contact', label: 'Contact & Hours', icon: FaEnvelope },
  { id: 'services', label: 'Services', icon: FaCog },
  { id: 'blog', label: 'Blog Posts', icon: FaFileAlt },
  { id: 'gallery', label: 'Gallery', icon: FaImages },
  { id: 'ui', label: 'Buttons & Links', icon: FaEdit },
  { id: 'seo', label: 'SEO Settings', icon: FaSearch }
]

export default function AdminDashboard() {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('practice');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadUserData();
  }, []);

  // ✅ UPDATED: Check main platform auth
  const checkAuth = () => {
    const token = localStorage.getItem('token'); // Main platform token
    if (!token) {
      navigate('/login'); // Navigate to main login
      return false;
    }
    return true;
  };

  // ✅ UPDATED: Load using main platform auth
  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminData(); // Uses main platform token
      console.log('✅ Loaded admin data:', data);
      setUserData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      // If portfolio doesn't exist, redirect to create one
      if (error.message.includes('not found')) {
        navigate('/dashboard'); // Back to main dashboard
      } else {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Save using main platform auth
  const saveData = async () => {
    setSaving(true);
    setSaveStatus('Saving...');
    
    try {
      const result = await api.saveAdminData(userData); // Uses main platform token

      if (result.success) {
        setSaveStatus('✅ Changes saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Error: ' + (result.error || 'Save failed'));
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setSaveStatus('❌ Error: ' + error.message);
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ✅ UPDATED: Logout goes to dashboard, not login
  const logout = () => {
    // Don't remove main platform token!
    // Just navigate back to dashboard
    navigate('/dashboard');
  };

  const updateField = (section, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const updateNestedField = (section, subsection, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }))
  }
 


   if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Website Management</h1>
              
              {/* ✅ UPDATED: View Site Button */}
              {userData?._id && (
                <Link 
                  to={`/portfolios/healthcare/${userData._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                >
                  <FaEye className="mr-1" />
                  View Site
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {saveStatus && (
                <span className={`text-sm px-3 py-1 rounded-full ${
                  saveStatus.includes('Error') || saveStatus.includes('❌') 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {saveStatus}
                </span>
              )}
              <button
                onClick={saveData}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 p-2 transition-colors"
                title="Back to Dashboard"
              >
                <FaArrowLeft />
              </button>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-200 transition-colors ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              
              {/* Practice Info Tab */}
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaHome className="mr-3" />
                    Practice Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Practice Name *
                      </label>
                      <input
                        type="text"
                        value={userData?.practice?.name || ''}
                        onChange={(e) => updateField('practice', 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter practice name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagline *
                      </label>
                      <input
                        type="text"
                        value={userData?.practice?.tagline || ''}
                        onChange={(e) => updateField('practice', 'tagline', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter tagline"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description 
                    </label>
                    <textarea
                      value={userData?.practice?.description || ''}
                      onChange={(e) => updateField('practice', 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your practice"
                    />
                  </div>

                  {/* Stats */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years Experience
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.yearsExperience || ''}
                          onChange={(e) => updateField('stats', 'yearsExperience', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patients Served
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.patientsServed || ''}
                          onChange={(e) => updateField('stats', 'patientsServed', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="5,000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Success Rate (%)
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.successRate || ''}
                          onChange={(e) => updateField('stats', 'successRate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="98"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Doctors
                        </label>
                        <input
                          type="text"
                          value={userData?.stats?.doctorsCount || ''}
                          onChange={(e) => updateField('stats', 'doctorsCount', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact & Hours Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaEnvelope className="mr-3" />
                    Contact Information & Hours
                  </h2>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={userData?.contact?.phone || ''}
                        onChange={(e) => updateField('contact', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={userData?.contact?.whatsapp || ''}
                        onChange={(e) => updateField('contact', 'whatsapp', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userData?.contact?.email || ''}
                      onChange={(e) => updateField('contact', 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@yourpractice.com"
                    />
                  </div>

                  {/* Address */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.street || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'street', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123 Your Street, Suite 100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.city || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'city', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.state || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'state', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="ST"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.zip || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'zip', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weekdays (Mon-Fri)
                        </label>
                        <input
                          type="text"
                          value={userData?.hours?.weekdays || ''}
                          onChange={(e) => updateField('hours', 'weekdays', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mon-Fri: 8:00 AM - 6:00 PM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Saturday
                        </label>
                        <input
                          type="text"
                          value={userData?.hours?.saturday || ''}
                          onChange={(e) => updateField('hours', 'saturday', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sat: 9:00 AM - 2:00 PM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sunday
                        </label>
                        <input
                          type="text"
                          value={userData?.hours?.sunday || ''}
                          onChange={(e) => updateField('hours', 'sunday', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Sun: Closed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <Suspense fallback={<div className="text-center py-12">Loading Services Editor...</div>}>
                  <ServicesEditor 
                    services={userData.services || []} 
                    onUpdate={(services) => setUserData(prev => ({...prev, services}))}
                  />
                </Suspense>
              )}

              {/* Blog Tab */}
              {activeTab === 'blog' && (
                <Suspense fallback={<div className="text-center py-12">Loading Blog Editor...</div>}>
                  <BlogEditor 
                    blogPosts={userData.blogPosts || []} 
                    onUpdate={(blogPosts) => setUserData(prev => ({...prev, blogPosts}))}
                  />
                </Suspense>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <Suspense fallback={<div className="text-center py-12">Loading Gallery Editor...</div>}>
                  <GalleryEditor 
                    gallery={userData.gallery || { facilityImages: [], beforeAfterCases: [] }} 
                    onUpdate={(gallery) => setUserData(prev => ({...prev, gallery}))}
                  />
                </Suspense>
              )}
              {/* Buttons & Links Tab */}
{activeTab === 'ui' && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
      <FaEdit className="mr-3" />
      Buttons & Links Configuration
    </h2>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <p className="text-blue-800 text-sm">
        Customize the text that appears on buttons and links throughout your website.
      </p>
    </div>

    {/* Hero Section Buttons */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section Buttons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Button Text
          </label>
          <input
            type="text"
            value={userData?.ui?.hero?.primaryButtonText || 'Get Started'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                hero: {
                  ...prev.ui?.hero,
                  primaryButtonText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Get Started"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Button Text
          </label>
          <input
            type="text"
            value={userData?.ui?.hero?.secondaryButtonText || 'Learn More'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                hero: {
                  ...prev.ui?.hero,
                  secondaryButtonText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Learn More"
          />
        </div>
      </div>
    </div>

    {/* Services Section */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View All Services Button
          </label>
          <input
            type="text"
            value={userData?.ui?.services?.viewAllText || 'View All Services'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                services: {
                  ...prev.ui?.services,
                  viewAllText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="View All Services"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Service Button
          </label>
          <input
            type="text"
            value={userData?.ui?.services?.bookButtonText || 'Book Now'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                services: {
                  ...prev.ui?.services,
                  bookButtonText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Book Now"
          />
        </div>
      </div>
    </div>

    {/* Blog Section */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Read More Link Text
          </label>
          <input
            type="text"
            value={userData?.ui?.blog?.readMoreText || 'Read More'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                blog: {
                  ...prev.ui?.blog,
                  readMoreText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Read More"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View All Posts Button
          </label>
          <input
            type="text"
            value={userData?.ui?.blog?.viewAllText || 'View All Posts'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                blog: {
                  ...prev.ui?.blog,
                  viewAllText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="View All Posts"
          />
        </div>
      </div>
    </div>

    {/* Contact Section */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Section</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Button Text
          </label>
          <input
            type="text"
            value={userData?.ui?.contact?.buttonText || 'Contact Us'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                contact: {
                  ...prev.ui?.contact,
                  buttonText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact Us"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send Message Button
          </label>
          <input
            type="text"
            value={userData?.ui?.contact?.submitText || 'Send Message'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                contact: {
                  ...prev.ui?.contact,
                  submitText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Send Message"
          />
        </div>
      </div>
    </div>

    {/* Call-to-Action Sections */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Call-to-Action Text</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main CTA Heading
          </label>
          <input
            type="text"
            value={userData?.ui?.cta?.heading || 'Ready to Get Started?'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                cta: {
                  ...prev.ui?.cta,
                  heading: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ready to Get Started?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main CTA Description
          </label>
          <textarea
            value={userData?.ui?.cta?.description || 'Contact us today to schedule your appointment'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                cta: {
                  ...prev.ui?.cta,
                  description: e.target.value
                }
              }
            }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contact us today to schedule your appointment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTA Button Text
          </label>
          <input
            type="text"
            value={userData?.ui?.cta?.buttonText || 'Schedule Appointment'}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                cta: {
                  ...prev.ui?.cta,
                  buttonText: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Schedule Appointment"
          />
        </div>
      </div>
    </div>

    {/* Social Media Links */}
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facebook URL
          </label>
          <input
            type="url"
            value={userData?.ui?.social?.facebook || ''}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                social: {
                  ...prev.ui?.social,
                  facebook: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            value={userData?.ui?.social?.instagram || ''}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                social: {
                  ...prev.ui?.social,
                  instagram: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://instagram.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Twitter URL
          </label>
          <input
            type="url"
            value={userData?.ui?.social?.twitter || ''}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                social: {
                  ...prev.ui?.social,
                  twitter: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://twitter.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={userData?.ui?.social?.linkedin || ''}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                social: {
                  ...prev.ui?.social,
                  linkedin: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://linkedin.com/company/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            value={userData?.ui?.social?.youtube || ''}
            onChange={(e) => setUserData(prev => ({
              ...prev,
              ui: {
                ...prev.ui,
                social: {
                  ...prev.ui?.social,
                  youtube: e.target.value
                }
              }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://youtube.com/channel/yourchannel"
          />
        </div>
      </div>
    </div>
  </div>
)}
              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaSearch className="mr-3" />
                    SEO Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                      <input
                        type="text"
                        value={userData.seo?.siteTitle || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, siteTitle: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your Practice Name - Services"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        value={userData.seo?.metaDescription || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, metaDescription: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description for search engines (150-160 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                      <input
                        type="text"
                        value={userData.seo?.keywords || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, keywords: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="healthcare, medical, doctors, clinic"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}