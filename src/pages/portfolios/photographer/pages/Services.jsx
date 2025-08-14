import { useState, useEffect } from "react";
import Editable from "../components/Editable";

export default function Services() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [heroData, setHeroData] = useState({
      subtitle: "Professional photography services tailored to capture your most important moments.",
    });

  const [services, setServices] = useState([
    {
      title: "Weddings",
      description:
        "Capture your special day with elegant, timeless photos that tell the story of your love.",
      image:
        "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Graduations",
      description:
        "Celebrate academic milestones with vibrant portraits that highlight your achievements.",
      image:
        "https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?q=80&w=844&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Sports",
      description:
        "Dynamic action shots to freeze your most exciting and energetic moments in time.",
      image:
        "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Parties",
      description:
        "Fun and candid photography that captures the joy and atmosphere of your celebrations.",
      image:
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80",
    },
  ]);

  const [packages, setPackages] = useState([
    {
      title: "Basic Package",
      description:
        "Includes 2 hours of coverage, 50 edited photos, and a private online gallery.",
    },
    {
      title: "Premium Package",
      description:
        "Includes 4 hours of coverage, 100 edited photos, printed album, and a complimentary photo session.",
    },
  ]);

  // Load initial data from backend
  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        // Fetch hero data
        const heroRes = await fetch('http://localhost:5000/settings/servicesHero');
        if (heroRes.ok) {
          const heroData = await heroRes.json();
          if (heroData.value) {
            setHeroData(heroData.value);
          }
        }

        // Fetch services data
        const servicesRes = await fetch('http://localhost:5000/settings/servicesData');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          if (servicesData.value) {
            setServices(servicesData.value);
          }
        }

        // Fetch packages data
        const packagesRes = await fetch('http://localhost:5000/settings/packagesData');
        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          if (packagesData.value) {
            setPackages(packagesData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch services data:', err);
      }
    };

    fetchServicesData();
  }, []);

  const updateHero = async (key, newValue) => {
    const updatedHero = { ...heroData, [key]: newValue };
    setHeroData(updatedHero);
    
    try {
      await fetch('http://localhost:5000/settings/servicesHero', {
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
    setServices(updated);
    
    try {
      await fetch('http://localhost:5000/settings/servicesData', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to save services:', err);
    }
  };

  const updatePackage = async (index, key, newValue) => {
    const updated = [...packages];
    updated[index][key] = newValue;
    setPackages(updated);
    
    try {
      await fetch('http://localhost:5000/settings/packagesData', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to save packages:', err);
    }
  };

  const deleteService = async (index) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      const updated = services.filter((_, i) => i !== index);
      setServices(updated);
      
      try {
        await fetch('http://localhost:5000/settings/servicesData', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: updated }),
        });
      } catch (err) {
        console.error('Failed to delete service:', err);
      }
    }
  };

  const deletePackage = async (index) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      const updated = packages.filter((_, i) => i !== index);
      setPackages(updated);
      
      try {
        await fetch('http://localhost:5000/settings/packagesData', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: updated }),
        });
      } catch (err) {
        console.error('Failed to delete package:', err);
      }
    }
  };

  const addNewService = async () => {
    const newService = {
      title: "New Service",
      description: "Click to edit this service description.",
      image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80"
    };
    
    const updated = [...services, newService];
    setServices(updated);
    
    try {
      await fetch('http://localhost:5000/settings/servicesData', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to save new service:', err);
    }
  };

  const addNewPackage = async () => {
    const newPackage = {
      title: "New Package",
      description: "Click to edit this package description and details."
    };
    
    const updated = [...packages, newPackage];
    setPackages(updated);
    
    try {
      await fetch('http://localhost:5000/settings/packagesData', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
    } catch (err) {
      console.error('Failed to save new package:', err);
    }
  };

  return (
  <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 space-y-16 md:space-y-24 relative overflow-hidden">

      {/* Services Section */}
      <section className="relative z-10">
        <div className="text-center mb-12 md:mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight mb-6 text-gray-900 tracking-wider px-4">Services</h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-8 animate-expand"></div>
          <Editable
            type="text"
            value={heroData.subtitle}
            onChange={(val) => updateHero("subtitle", val)}
            tag="p"
            className="text-gray-600 text-lg font-light max-w-2xl mx-auto leading-relaxed"
          />
          
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-20">
          {services.map(({ title, description, image }, index) => (
            <div
              key={index}
              className="group animate-fade-in-up"
              style={{animationDelay: `${0.2 * index}s`}}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 relative text-left">
                {/* Delete Button */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteService(index)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      title="Delete service"
                    >
                      Delete
                    </button>
                  </div>
                )}
                {/* Image Container */}
                <div className="w-full h-80 overflow-hidden relative">
                  <Editable
                    type="image"
                    value={image}
                    onChange={(val) => updateService(index, "image", val)}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Text Content */}
                <div className="p-8 space-y-6">
                  <Editable
                    type="text"
                    value={title}
                    onChange={(val) => updateService(index, "title", val)}
                    tag="h3" 
                    className="text-3xl font-light text-gray-900 group-hover:text-black transition-colors duration-300 tracking-wide"
                  />
                  <div className="w-16 h-0.5 bg-gray-300 group-hover:bg-black group-hover:w-24 transition-all duration-500"></div>
                  <Editable
                    type="text"
                    value={description}
                    onChange={(val) => updateService(index, "description", val)}
                    className="text-gray-600 leading-relaxed font-light text-lg group-hover:text-gray-800 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Service Button */}
          {isAdmin && (
            <div
              className="group animate-fade-in-up"
              style={{animationDelay: `${0.2 * services.length}s`}}
            >
              <button
                onClick={addNewService}
                className="w-full bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 border-2 border-dashed border-gray-300 hover:border-gray-400"
              >
                {/* Image Container */}
                <div className="w-full h-80 overflow-hidden relative bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-300 transition-colors duration-300">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-light group-hover:text-gray-500 transition-colors duration-300">Add Image</p>
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-8 space-y-6 text-left">
                  <h3 className="text-3xl font-light text-gray-400 group-hover:text-gray-500 transition-colors duration-300 tracking-wide">
                    Add New Service
                  </h3>
                  <div className="w-16 h-0.5 bg-gray-300 group-hover:bg-gray-400 group-hover:w-24 transition-all duration-500"></div>
                  <p className="text-gray-400 leading-relaxed font-light text-lg group-hover:text-gray-500 transition-colors duration-300">
                    Click to add a new service offering
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Divider Section */}
      <div className="relative py-16 animate-fade-in-up" style={{animationDelay: '1s'}}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-white px-8">
            <div className="w-3 h-3 border border-gray-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <section className="relative z-10">
        <div className="text-center mb-12 md:mb-20 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight mb-6 text-gray-900 tracking-wider px-4">Packages</h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-8 animate-expand" style={{animationDelay: '1.7s'}}></div>
          <p className="text-gray-600 text-lg font-light max-w-xl mx-auto leading-relaxed">
            Thoughtfully crafted photography packages designed to meet your unique needs and budget.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto">
          {packages.map(({ title, description }, index) => (
            <div 
              key={index} 
              className="group animate-fade-in-up relative"
              style={{animationDelay: `${1.4 + 0.2 * index}s`}}
            >
              {/* Delete Button */}
              {isAdmin && (
                <button
                  onClick={() => deletePackage(index)}
                  className="absolute top-2 right-2 z-10 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete package"
                >
                  ×
                </button>
              )}
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 hover:border-gray-200 text-left">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Editable
                      type="text"
                      value={title}
                      onChange={(val) => updatePackage(index, "title", val)}
                      tag="h3" 
                      className="text-3xl font-light text-gray-900 group-hover:text-black transition-colors duration-300 tracking-wide"
                    />
                    <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center group-hover:border-black transition-colors duration-300">
                      <div className="w-2 h-2 bg-gray-400 rounded-full group-hover:bg-black transition-colors duration-300"></div>
                    </div>
                  </div>
                  <div className="w-20 h-0.5 bg-gray-300 group-hover:bg-black group-hover:w-32 transition-all duration-500"></div>
                  <Editable
                    type="text"
                    value={description}
                    onChange={(val) => updatePackage(index, "description", val)}
                    className="text-gray-600 leading-relaxed font-light text-lg group-hover:text-gray-800 transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Package Button */}
          {isAdmin && (
            <div 
              className="group animate-fade-in-up"
              style={{animationDelay: `${1.4 + 0.2 * packages.length}s`}}
            >
              <button
                onClick={addNewPackage}
                className="w-full bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-1 border-2 border-dashed border-gray-200 hover:border-gray-300"
              >
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-light text-gray-400 group-hover:text-gray-500 transition-colors duration-300 tracking-wide">
                      Add New Package
                    </h3>
                    <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center group-hover:border-gray-400 transition-colors duration-300">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="w-20 h-0.5 bg-gray-300 group-hover:bg-gray-400 group-hover:w-32 transition-all duration-500"></div>
                  <p className="text-gray-400 leading-relaxed font-light text-lg group-hover:text-gray-500 transition-colors duration-300">
                    Click to add a new package option
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Button */}
      <div className="text-center mt-24 animate-fade-in-up" style={{animationDelay: '2s'}}>
        <div className="inline-block group">
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 p-12 border border-gray-100 hover:border-gray-200">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto group-hover:from-gray-900 group-hover:to-black transition-all duration-500">
                <div className="w-6 h-6 border-2 border-gray-400 rounded-full group-hover:border-white transition-colors duration-300"></div>
              </div>
              <div>
                <h3 className="text-2xl font-light text-gray-900 mb-4 tracking-wide">Ready to begin?</h3>
                <p className="text-gray-600 text-lg font-light mb-8 max-w-md mx-auto leading-relaxed">
                  Let's discuss your vision and create something beautiful together.
                </p>
              </div>
              <a
                href="/portfolios/photographer/contact"
                className="inline-block px-10 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all duration-500 font-light text-lg tracking-wide transform hover:scale-105 hover:shadow-lg"
              >
                Get In Touch
              </a>
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