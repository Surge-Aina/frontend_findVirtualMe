import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editable from "../components/Editable";
import { AuthContext } from "../components/AuthContext";

const GalleryPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);

  const [heroData, setHeroData] = useState({
    subtitle: "Explore our photography collections across different occasions and styles",
  });

  // Load initial data from backend
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        // Fetch hero data
        const heroRes = await fetch('http://localhost:5000/settings/galleryHero');
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          if (heroData.value) {
            setHeroData(heroData.value);
          }
        }

        // Fetch services data
        const servicesRes = await fetch('http://localhost:5000/settings/galleryServices');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          if (servicesData.value) {
            setServices(servicesData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch gallery data:', err);
      }
    };

    fetchGalleryData();
  }, []);

  const [services, setServices] = useState([
    {
      name: "Weddings",
      description: "Romantic moments captured forever",
      image:
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      path: "/gallery/weddings",
      featured: true,
    },
    {
      name: "Graduations",
      description: "Celebrate your achievements",
      image:
        "https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?q=80&w=844&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      path: "/gallery/graduations",
      featured: false,
    },
    {
      name: "Sports",
      description: "Dynamic action photography",
      image:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
      path: "/gallery/sports",
      featured: false,
    },
    {
      name: "Parties",
      description: "Fun celebrations and events",
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      path: "/gallery/parties",
      featured: false,
    },
    {
      name: "Corporate",
      description: "Professional business photography",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
      path: "/gallery/corporate",
      featured: false,
    },
    {
      name: "Portraits",
      description: "Personal portrait sessions",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      path: "/gallery/portraits",
      featured: false,
    },
  ]);

  const updateHero = async (key, newValue) => {
    const updatedHero = { ...heroData, [key]: newValue };
    setHeroData(updatedHero);
    
    try {
      await fetch('http://localhost:5000/settings/galleryHero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updatedHero }),
      });
    } catch (err) {
      console.error('Failed to save hero data:', err);
    }
  };

  const updateService = async (index, key, newValue) => {
    const updated = [...services];
    updated[index][key] = newValue;
  
    // If name is updated, update the path as well
    if (key === "name") {
      const slug = newValue.toLowerCase().replace(/\s+/g, "-");
      updated[index]["path"] = `/gallery/${slug}`;
    }
  
    setServices(updated);
    
    try {
      await fetch('http://localhost:5000/settings/galleryServices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to save services:', err);
    }
  };  

  const addService = async () => {
    const newService = {
      name: "New Category",
      description: "Add your description here",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
      path: "/gallery/new-category",
      featured: false,
    };
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    
    try {
      await fetch('http://localhost:5000/settings/galleryServices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updatedServices }),
      });
    } catch (err) {
      console.error('Failed to save new service:', err);
    }
  };

  const removeService = async (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
    
    try {
      await fetch('http://localhost:5000/settings/galleryServices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to remove service:', err);
    }
  };

  const featuredServices = services.filter(service => service.featured);
  const regularServices = services.filter(service => !service.featured);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Hero Section */}
      <div className="relative px-4 md:px-8 py-16 md:py-32 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight mb-8 text-gray-900 tracking-wider px-4">Gallery</h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-8 animate-expand"></div>
          <Editable
            type="text"
            value={heroData.subtitle}
            onChange={(val) => updateHero("subtitle", val)}
            tag="p"
            className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 md:pb-20 relative z-10">
        {/* Featured Section */}
        {featuredServices.length > 0 && (
          <section className="mb-24">
            <div className="text-center mb-20 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight mb-6 text-gray-900 tracking-wider px-4">Featured Collections</h2>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto animate-expand" style={{animationDelay: '0.8s'}}></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {featuredServices.map((service, index) => {
                const originalIndex = services.findIndex(s => s === service);
                return (
                  <div
                    key={originalIndex}
                    className={`group animate-fade-in-up relative`}
                    style={{animationDelay: `${0.6 + 0.2 * index}s`}}
                  >
                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-[60] space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateService(originalIndex, "featured", false);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200 shadow-lg pointer-events-auto"
                          type="button"
                        >
                          Remove Featured
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeService(originalIndex);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors duration-200 shadow-lg pointer-events-auto"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl text-left">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                  
                        {/* Background Image Editor for Admin */}
                        {isAdmin && (
                          <div className="absolute top-4 left-4 z-50">
                            <Editable
                              type="image"
                              value={service.image}
                              onChange={(val) => updateService(originalIndex, "image", val)}
                              asBackground={true}
                              className="text-xs text-gray-600"
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-10 space-y-6">
                        <Editable
                          type="text"
                          value={service.name}
                          onChange={(val) => updateService(originalIndex, "name", val)}
                          tag="h3"
                          className="text-4xl font-light text-gray-900 tracking-wide"
                          onClick={(e) => isAdmin && e.stopPropagation()}
                        />
                        <div className="w-20 h-0.5 bg-gray-300"></div>
                        <Editable
                          type="text"
                          value={service.description}
                          onChange={(val) => updateService(originalIndex, "description", val)}
                          tag="p"
                          className="text-gray-600 leading-relaxed font-light text-lg"
                          onClick={(e) => isAdmin && e.stopPropagation()}
                        />
                  
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/portfolios/photographer${service.path.startsWith('/') ? service.path : '/' + service.path}`);
                          }}
                          className="inline-block px-8 py-3 bg-gray-900 text-white rounded-2xl font-light tracking-wide mt-6"
                        >
                          View Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Divider Section */}
        <div className="relative py-16 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-8">
              <div className="w-3 h-3 border border-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Regular Collections Grid */}
        <section>
          <div className="text-center mb-20 animate-fade-in-up" style={{animationDelay: '1.4s'}}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight mb-6 text-gray-900 tracking-wider px-4">All Collections</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto animate-expand" style={{animationDelay: '1.9s'}}></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {regularServices.map((service, index) => {
              const originalIndex = services.findIndex(s => s === service);
              return (
                <div
                  key={originalIndex}
                  className={`group animate-fade-in-up relative`}
                  style={{animationDelay: `${1.6 + 0.1 * index}s`}}
                >
                  {/* Admin Controls - Simplified without background */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-[60] space-x-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateService(originalIndex, "featured", true);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors duration-200 pointer-events-auto"
                        type="button"
                        title="Make Featured"
                      >
                        ★
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeService(originalIndex);
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200 pointer-events-auto"
                        type="button"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div 
                    className={`bg-white rounded-3xl overflow-hidden shadow-lg ${!isAdmin ? 'cursor-pointer' : ''} text-left`}
                    onClick={!isAdmin ? () => navigate(`/portfolios/photographer${service.path.startsWith('/') ? service.path : '/' + service.path}`) : undefined}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
              
                      {/* Background Image Editor for Admin */}
                      {isAdmin && (
                        <div className="absolute top-4 left-4 z-50">
                          <Editable
                            type="image"
                            value={service.image}
                            onChange={(val) => updateService(originalIndex, "image", val)}
                            asBackground={true}
                            className="text-xs text-gray-600"
                          />
                        </div>
                      )}
                    </div>
            
                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <Editable
                        type="text"
                        value={service.name}
                        onChange={(val) => updateService(originalIndex, "name", val)}
                        tag="h3"
                        className="text-2xl font-light text-gray-900 tracking-wide"
                        onClick={(e) => isAdmin && e.stopPropagation()}
                      />
                      <div className="w-12 h-0.5 bg-gray-300"></div>
                      <Editable
                        type="text"
                        value={service.description}
                        onChange={(val) => updateService(originalIndex, "description", val)}
                        tag="p"
                        className="text-gray-600 font-light"
                        onClick={(e) => isAdmin && e.stopPropagation()}
                      />

                      {/* View Gallery Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolios/photographer${service.path.startsWith('/') ? service.path : '/' + service.path}`);
                        }}
                        className="inline-block px-6 py-2 bg-gray-100 text-gray-800 rounded-xl font-light text-sm tracking-wide mt-4"
                      >
                        View Gallery
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Service Card (Admin Only) */}
            {isAdmin && (
              <div
                onClick={addService}
                className="aspect-square rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer group animate-fade-in-up"
                style={{animationDelay: `${1.6 + 0.1 * regularServices.length}s`}}
              >
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">+</div>
                  <div className="text-sm font-light">Add Category</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Contact Button */}
        <div className="text-center mt-24 animate-fade-in-up" style={{animationDelay: '2.2s'}}>
          <div className="inline-block group">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
              <div className="space-y-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Ready to book your session?</h3>
                  <p className="text-gray-600 text-lg font-light mb-8 max-w-md mx-auto leading-relaxed">
                    Let's discuss your vision and create something beautiful together.
                  </p>
                </div>
                <a
                  href="/contact"
                  className="inline-block px-10 py-4 bg-gray-900 text-white rounded-2xl font-light text-lg tracking-wide"
                >
                  Get In Touch
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

        .animate-expand {
          animation: expand 1.5s ease-out forwards;
          animation-delay: 0.5s;
          width: 0;
        }
      `}</style>
    </div>
  );
};

export default GalleryPage;