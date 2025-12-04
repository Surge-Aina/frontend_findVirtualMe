import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserMd, FaHeartbeat, FaMicroscope, 
  FaShieldAlt, FaProcedures, FaTooth,
  FaCalendarCheck, FaUsers, FaChartLine 
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { api } from '../lib/api';

export default function Home() {
  const { practiceId } = useParams(); // Get practiceId from URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!practiceId) {
      navigate('/portfolios/healthcare/auth/login');
      return;
    }
    
    loadData();
  }, [practiceId]);

  useEffect(() => {
    if (userData) {
      document.title = `${userData.practice?.name || 'Healthcare'} - Home`;
    }
  }, [userData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getPracticeData(practiceId);
      setUserData(data);
    } catch (error) {
      console.error('Error loading practice data:', error);
      setError('Practice not found');
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
        <p className="text-gray-600">Loading practice...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Practice Not Found</h1>
          <p className="text-gray-600 mb-8">The practice you're looking for doesn't exist.</p>
          <Link 
            to="/portfolios/healthcare/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const statsData = [
    { icon: FaCalendarCheck, value: userData?.stats?.yearsExperience || '0', label: 'Years Experience' },
    { icon: FaUsers, value: userData?.stats?.patientsServed || '0', label: 'Patients Served' },
    { icon: FaChartLine, value: userData?.stats?.successRate || '0', label: 'Success Rate' },
    { icon: FaUserMd, value: userData?.stats?.doctorsCount || '0', label: 'Expert Doctors' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userData={userData} practiceId={practiceId} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-36 pb-20">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
      {userData?.practice?.tagline || 'Your Health, Our Priority'}
    </h1>
    <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-3xl mx-auto">
      {userData?.practice?.description || 'Providing quality healthcare services.'}
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  <Link 
    to={`/portfolios/healthcare/${practiceId}/contact`}
    className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
  >
    {userData?.ui?.hero?.primaryButtonText || 'Get Started'}
  </Link>

  <Link 
    to={`/portfolios/healthcare/${practiceId}/services`}
    className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
  >
    {userData?.ui?.services?.viewAllText || 'View All Services'}
  </Link>
</div>

  </div>
</section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-blue-50 group-hover:bg-blue-600 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center transition-all">
                    <Icon className="text-blue-600 group-hover:text-white text-3xl transition-colors" />
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stat.value}{stat.label.includes('Rate') ? '%' : '+'}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      
      {/* Admin Access Link */}
      <Link
        to={`/portfolios/healthcare/${practiceId}/admin/dashboard`}
        className="admin-link"
      >
        Admin
      </Link>
    </div>
  );
}