import { useNavigate, useParams, Link } from 'react-router-dom';
import { lazy, Suspense, useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  FaHome, FaCog, FaFileAlt, FaImages, 
  FaEnvelope, FaSave, FaEdit, 
  FaEye, FaSearch, FaArrowLeft , FaTrash,
  FaHospital, FaTooth
} from 'react-icons/fa';
import { FaHospitalUser } from "react-icons/fa6";
import { MdHealthAndSafety } from "react-icons/md";
import { GiHealthNormal } from "react-icons/gi";
import { RiMentalHealthFill } from "react-icons/ri"

const ServicesEditor = lazy(() => import('../../components/admin/ServicesEditor'));
const BlogEditor = lazy(() => import('../../components/admin/BlogEditor'));
const GalleryEditor = lazy(() => import('../../components/admin/GalleryEditor'));

const tabs = [
  { id: 'practice', label: 'Practice Info', icon: FaHome },
  { id: 'contact', label: 'Contact & Hours', icon: FaEnvelope },
  { id: 'services', label: 'Services', icon: FaCog },
  { id: 'blog', label: 'Blog Posts', icon: FaFileAlt },
  { id: 'gallery', label: 'Gallery', icon: FaImages },
  { id: 'ui', label: 'Buttons & Links', icon: FaEdit },
  { id: 'seo', label: 'SEO Settings', icon: FaSearch }
];

export default function AdminDashboard() {
  // ✅ Get portfolio _id from URL (same as other portfolios)
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('practice');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [practiceId]);

  // ✅ Load data for the SPECIFIC portfolio using _id from URL
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!practiceId) {
        console.error('❌ No portfolio ID in URL');
        navigate('/dashboard');
        return;
      }

      console.log(`📋 Loading admin data for portfolio _id: ${practiceId}`);
      
      // ✅ Pass _id to get the specific portfolio
      const data = await api.getAdminData(practiceId);
      
      console.log('✅ Loaded portfolio:', data.portfolioName || data.practice?.name);
      setUserData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save data for the SPECIFIC portfolio
  const saveData = async () => {
    setSaving(true);
    setSaveStatus('Saving...');
    
    try {
      const result = await api.saveAdminData(userData, practiceId);

      if (result.success) {
        setSaveStatus('✅ Saved!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Error');
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('❌ ' + error.message);
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateNestedField = (section, subsection, field, value) => {
    setUserData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: { ...prev[section][subsection], [field]: value }
      }
    }));
  };

  // Generic image upload + save function
  const uploadAndSaveImage = async ({ file, section, subsection, field }) => {
    try {
      const publicUrl = await api.uploadImageToS3(file);
      if (!publicUrl) throw new Error('No URL returned from S3');
      
      // Build updatedData depending on whether subsection is provided
      let updatedData;
      if (subsection) {
        updatedData = {
          ...userData,
          [section]: {
            ...userData[section],
            [subsection]: {
              ...userData[section]?.[subsection],
              [field]: publicUrl
            }
          }
        };
      } else {
        updatedData = {
          ...userData,
          [section]: {
            ...userData[section],
            [field]: publicUrl
          }
        };
      }
      
      // Update state
      setUserData(updatedData);
      
      // Save immediately
      const result = await api.saveAdminData(updatedData, practiceId);
      
      if (result.success) {
        setSaveStatus('✅ Saved!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('❌ Error');
        setTimeout(() => setSaveStatus(''), 5000);
      }
      
    } catch (err) {
      console.error('Image Upload Error:', err);
      alert('Image upload failed');
    }
  };
  
const uploadLogoImage = (file) => {
  uploadAndSaveImage({ file, section: 'practice', field: 'logoImage' });
};

const uploadHeroImage = (file) => {
  uploadAndSaveImage({ file, section: 'ui', subsection: 'hero', field: 'backgroundImage' });
};



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-20 h-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {userData?.practice?.name || userData?.portfolioName || 'Website Management'}
              </h1>
              
              {userData?._id && (
                <Link 
                  to={`/portfolios/healthcare/${userData._id}`}
                  target="_blank"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center mr-2"
                >
                  <FaEye className=" h-8 w-8" /> View Site
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {saveStatus && (
                <span className={`text-sm px-3 py-1 rounded-full ${
                  saveStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {saveStatus}
                </span>
              )}
              <button
                onClick={saveData}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center"
              >
                <FaSave className="mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900 p-2">
                <FaArrowLeft />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left border-b border-gray-200 ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaHome className="mr-3" /> Practice Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Practice Name *</label>
                      <input
                        type="text"
                        value={userData?.practice?.name || ''}
                        onChange={(e) => updateField('practice', 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={userData?.practice?.tagline || ''}
                        onChange={(e) => updateField('practice', 'tagline', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={userData?.practice?.description || ''}
                      onChange={(e) => updateField('practice', 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border-t pt-6"></div>

                  {/* Logo*/}
                  <div className="flex flex-col align-middle pt-6 shadow-sm rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Logo Image</h3>

                    {/* Select from default logos */}
                    <div className="my-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Choose from Default Logo</label>
                      <div className="flex justify-center gap-2 overflow-auto">
                        {[//if adding more make sure to also add to Navbar.jsx iconMap
                          { icon: FaTooth, name: 'FaTooth' },
                          { icon: FaHospital, name: 'FaHospital' },
                          { icon: MdHealthAndSafety, name: 'MdHealthAndSafety' },
                          { icon: GiHealthNormal, name: 'GiHealthNormal' },
                          { icon: FaHospitalUser, name: 'FaHospitalUser' },
                          { icon: RiMentalHealthFill, name: 'RiMentalHealthFill' }
                        ].map((defaultLogo) => (
                          <button
                            key={defaultLogo.name}
                            onClick={() => updateField('practice', 'icon', defaultLogo.name)}
                            className={`flex items-center justify-center w-14 h-14  rounded-full border ${
                              userData?.practice?.icon === defaultLogo.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300'
                            }`}
                          >
                            <defaultLogo.icon className="text-gray-700" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center my-4 text-gray-500">OR</div>
                    
                    {/* URL logo */}
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={userData?.practice?.logoImage || ''}
                      onChange={(e) => updateField('practice', 'logoImage', e.target.value)}
                      className="w-full border rounded-md px-4 py-2 mb-4"
                    />
                    {userData?.practice?.logoImage && (
                      <div className="rounded-lg overflow-hidden border w-32 h-32 flex items-center justify-center mx-auto">
                        <img
                          src={userData.practice.logoImage}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain "
                        />
                      </div>
                    )}
                    {userData?.practice?.logoImage && (
                      <button
                        onClick={() => updateField('practice', 'logoImage', '')}
                        className="mt-3 px-4 py-2 border rounded-4xl shadow hover:text-red-600 hover:cursor-pointer "
                      >
                        <FaTrash className="inline mr-2 text-red-600" /> Remove Logo
                      </button>
                    )}

                    {/* Upload Logo Image */}
                    <div className="space-y-4">
                      <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                        Upload Logo

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadLogoImage(file);
                          }}
                          className="hidden"
                          />
                      </label>
                    </div>
                  </div>


                  {/* Hero background Image URL */}
                  <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                      Hero Background Image
                    </h3>

                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={userData?.ui?.hero?.backgroundImage || ''}
                      onChange={(e) =>
                        updateNestedField('ui', 'hero', 'backgroundImage', e.target.value)
                      }
                      className="w-full border rounded-md px-4 py-2 mb-4"
                    />

                    {userData?.ui?.hero?.backgroundImage && (
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={userData.ui.hero.backgroundImage}
                          alt="Hero background preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {userData?.ui?.hero?.backgroundImage && (
                      <button
                        onClick={() =>
                          updateNestedField('ui', 'hero', 'backgroundImage', '')
                        }
                        className="mt-3 px-4 py-2 border rounded-4xl shadow hover:text-red-600 hover:cursor-pointer "
                      >
                        <FaTrash className="inline mr-2 text-red-600" /> Remove Image
                      </button>
                    )}

                    {/* Upload Hero Image */}
                    <div className="space-y-4">
                      <label className="inline-flex items-center gap-2 text-sm text-blue-600 cursor-pointer border border-blue-600 px-3 py-2 rounded-lg mt-3 hover:bg-blue-50 transition-colors">
                        Upload Hero Image

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadHeroImage(file);
                          }}
                          className="hidden"
                          />
                      </label>

                      <p className="text-xs text-gray-500">
                        JPG, PNG, or WebP recommended. Large images will be resized automatically by the browser.
                      </p>
                    </div>
                  </div>





                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['yearsExperience', 'patientsServed', 'successRate', 'doctorsCount'].map(stat => (
                        <div key={stat}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {stat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                          </label>
                          <input
                            type="text"
                            value={userData?.stats?.[stat] || '0'}
                            onChange={(e) => updateField('stats', stat, e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaEnvelope className="mr-3" /> Contact & Hours
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={userData?.contact?.phone || ''}
                        onChange={(e) => updateField('contact', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        value={userData?.contact?.whatsapp || ''}
                        onChange={(e) => updateField('contact', 'whatsapp', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={userData?.contact?.email || ''}
                        onChange={(e) => updateField('contact', 'email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.street || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'street', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.city || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'city', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.state || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'state', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP</label>
                        <input
                          type="text"
                          value={userData?.contact?.address?.zip || ''}
                          onChange={(e) => updateNestedField('contact', 'address', 'zip', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Hours</h3>
                    {['weekdays', 'saturday', 'sunday'].map(day => (
                      <div key={day} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                        <input
                          type="text"
                          value={userData?.hours?.[day] || ''}
                          onChange={(e) => updateField('hours', day, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                  <ServicesEditor 
                    services={userData?.services || []} 
                    onUpdate={(services) => setUserData(prev => ({ ...prev, services }))}
                  />
                </Suspense>
              )}

              {activeTab === 'blog' && (
                <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                  <BlogEditor 
                    blogPosts={userData?.blogPosts || []} 
                    onUpdate={(blogPosts) => setUserData(prev => ({ ...prev, blogPosts }))}
                  />
                </Suspense>
              )}

              {activeTab === 'gallery' && (
                <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
                  <GalleryEditor 
                    gallery={userData?.gallery || { facilityImages: [], beforeAfterCases: [] }} 
                    onUpdate={(gallery) => setUserData(prev => ({ ...prev, gallery }))}
                  />
                </Suspense>
              )}

              {activeTab === 'ui' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaEdit className="mr-3" /> Buttons & Links
                  </h2>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">Hero Buttons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button</label>
                        <input
                          type="text"
                          value={userData?.ui?.hero?.primaryButtonText || 'Get Started'}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            ui: { ...prev.ui, hero: { ...prev.ui?.hero, primaryButtonText: e.target.value } }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button</label>
                        <input
                          type="text"
                          value={userData?.ui?.hero?.secondaryButtonText || 'Learn More'}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            ui: { ...prev.ui, hero: { ...prev.ui?.hero, secondaryButtonText: e.target.value } }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">CTA Section</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
                        <input
                          type="text"
                          value={userData?.ui?.cta?.heading || ''}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            ui: { ...prev.ui, cta: { ...prev.ui?.cta, heading: e.target.value } }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={userData?.ui?.cta?.description || ''}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            ui: { ...prev.ui, cta: { ...prev.ui?.cta, description: e.target.value } }
                          }))}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                        <input
                          type="text"
                          value={userData?.ui?.cta?.buttonText || ''}
                          onChange={(e) => setUserData(prev => ({
                            ...prev,
                            ui: { ...prev.ui, cta: { ...prev.ui?.cta, buttonText: e.target.value } }
                          }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map(social => (
                        <div key={social}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {social.charAt(0).toUpperCase() + social.slice(1)}
                          </label>
                          <input
                            type="url"
                            value={userData?.ui?.social?.[social] || ''}
                            onChange={(e) => setUserData(prev => ({
                              ...prev,
                              ui: { ...prev.ui, social: { ...prev.ui?.social, [social]: e.target.value } }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={`https://${social}.com/...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <FaSearch className="mr-3" /> SEO Settings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                      <input
                        type="text"
                        value={userData?.seo?.siteTitle || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, siteTitle: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        value={userData?.seo?.metaDescription || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, metaDescription: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                      <input
                        type="text"
                        value={userData?.seo?.keywords || ''}
                        onChange={(e) => setUserData(prev => ({
                          ...prev,
                          seo: { ...prev.seo, keywords: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
  );
}