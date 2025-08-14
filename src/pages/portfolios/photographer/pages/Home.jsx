import About from '../components/About';
import Specializations from '../components/Specializations';
import ClientTestimonial from '../components/ClientTestimonial';
import ContactSection from '../components/ContactSection';
import Layout from '../components/Layout';
import HeroText from '../components/HeroText';
import AdminGalleryControls from '../components/AdminGalleryControls';
import EmptyGalleryState from '../components/EmptyGalleryState';
import { useDynamicPhotoManagement } from '../hooks/useDynamicPhotoManagement';

export default function Home() {
  const {
    photos,
    layoutType,
    layoutSettings,
    currentFolderId,
    isLoading,
    error,
    hasInitialized,
    handleImageChange,
    handleLayoutChange,
    handleLayoutSettingsChange,
    handleAdminDriveConnected,
    deletePhoto,
    movePhoto,
  } = useDynamicPhotoManagement('highlights');

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative px-4 md:px-8 py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="animate-fade-in-up text-center">
            <HeroText />
          </div>
        </div>
        
        {/* Floating elements around hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-32 w-4 h-4 bg-gradient-to-br from-black/25 to-gray-700/25 rounded-full animate-gentle-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-32 left-24 w-3 h-3 bg-gradient-to-br from-gray-800/22 to-gray-600/22 rounded-full animate-gentle-float" style={{animationDelay: '1s'}}></div>
          
          {/* Geometric shapes near hero */}
          <div className="absolute top-24 right-48 w-8 h-8 border border-black/15 rotate-45 animate-slow-spin" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-52 left-32 w-6 h-6 border border-gray-800/12 rotate-12 animate-slow-spin" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-36 left-96 w-10 h-10 border border-gray-600/10 rounded-full animate-slow-spin" style={{animationDelay: '6s'}}></div>
          
          {/* Distant floating elements */}
          <div className="absolute bottom-40 left-16 w-4 h-4 bg-gradient-to-br from-gray-900/20 to-black/20 rounded-full animate-gentle-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-gradient-to-br from-black/20 to-gray-800/20 rounded-full animate-gentle-float" style={{animationDelay: '6s'}}></div>
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16 md:space-y-32 pb-12 md:pb-24 relative z-10">
        {/* Admin Controls - Admin Only */}
        {isAdmin && (
          <AdminGalleryControls
            layoutType={layoutType}
            onLayoutChange={handleLayoutChange}
            onDriveConnected={handleAdminDriveConnected}
            currentFolderId={currentFolderId}
            endpoint="highlights"
            title="Gallery Controls"
          />
        )}
        
        {/* Photo Gallery */}
        <section className="space-y-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          {photos.length > 0 ? (
            <div className="transform hover:scale-[1.01] transition-transform duration-700">
              <Layout 
                layoutType={layoutType} 
                photos={photos} 
                onPhotoChange={handleImageChange}
                onPhotoDelete={deletePhoto}
                onPhotoMove={movePhoto}
                showAdminControls={isAdmin}
                layoutSettings={layoutSettings}
                onLayoutSettingsChange={handleLayoutSettingsChange}
              />
            </div>
          ) : (
            <EmptyGalleryState
              currentFolderId={currentFolderId}
              error={error}
              hasInitialized={hasInitialized}
              isLoading={isLoading}
              isAdmin={isAdmin}
              title="No Photos Found"
              subtitle="No photos available to display."
            />
          )}
        </section>

        {/* Services Section */}
        <section className="animate-fade-in-up" style={{animationDelay: '1.2s'}}>
          <Specializations />
        </section>

        {/* About Section */}
        <section className="animate-fade-in-up" style={{animationDelay: '1.5s'}}>
          <About />
        </section>

        {/* Testimonials Section */}
        <section className="animate-fade-in-up" style={{animationDelay: '2.1s'}}>
          <ClientTestimonial />
        </section>

        {/* Contact Section */}
        <section className="animate-fade-in-up" style={{animationDelay: '2.4s'}}>
          <ContactSection />
        </section>
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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.4;
          }
        }

        @keyframes slow-float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-35px) rotate(180deg);
            opacity: 0.3;
          }
        }

        @keyframes slow-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-gentle-float {
          animation: gentle-float 8s ease-in-out infinite;
        }

        .animate-slow-float {
          animation: slow-float 10s ease-in-out infinite;
        }

        .animate-slow-spin {
          animation: slow-spin 20s linear infinite;
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