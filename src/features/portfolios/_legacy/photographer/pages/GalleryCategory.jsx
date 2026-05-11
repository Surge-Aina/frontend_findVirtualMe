import Layout from "../components/Layout";
import AdminGalleryControls from "../components/AdminGalleryControls";
import EmptyGalleryState from "../components/EmptyGalleryState";
import { useDynamicPhotoManagement } from '../hooks/useDynamicPhotoManagement';
import { useParams } from 'react-router-dom';

export default function GalleryCategory() {
  const { category } = useParams();
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
  } = useDynamicPhotoManagement(category);

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Gallery';

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight mb-8 text-gray-900 tracking-wider px-4">{title}</h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-8 animate-expand"></div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <AdminGalleryControls
            layoutType={layoutType}
            onLayoutChange={handleLayoutChange}
            onDriveConnected={handleAdminDriveConnected}
            currentFolderId={currentFolderId}
            endpoint={category}
            title={`${title} Controls`}
          />
        )}

        {/* Photo Gallery */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          {photos.length > 0 ? (
            <div className="transform hover:scale-[1.02] transition-transform duration-700">
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
              title={`No ${title} Photos`}
              subtitle={`No ${title.toLowerCase()} photos available.`}
            />
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-24 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
          <div className="inline-block group">
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 p-12 border border-gray-100 hover:border-gray-200">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto group-hover:from-gray-900 group-hover:to-black transition-all duration-500">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded-full group-hover:border-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Explore more collections</h3>
                  <p className="text-gray-600 text-lg font-light mb-8 max-w-md mx-auto leading-relaxed">
                    Discover other beautiful moments captured through our lens.
                  </p>
                </div>
                <a
                  href="/portfolios/photographer/gallery"
                  className="inline-block px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all duration-500 font-light text-lg tracking-wide transform hover:scale-105 hover:shadow-lg"
                >
                  Back to Gallery
                </a>
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