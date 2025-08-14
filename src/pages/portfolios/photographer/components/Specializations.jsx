import { useState, useEffect } from "react";
import Editable from "./Editable";

export default function Specializations() {
  const [description, setDescription] = useState("From intimate portraits to grand celebrations, I capture the essence of every moment");
  const [services, setServices] = useState([
    { name: 'Wedding Photography', description: 'Capturing your most precious day with artistry and emotion' },
    { name: 'Portrait Sessions', description: 'Personal and professional portraits that tell your story' },
    { name: 'Event Coverage', description: 'Documenting celebrations and milestones with style' },
    { name: 'Corporate Photography', description: 'Professional imagery for business and branding needs' }
  ]);

  // Load initial data from backend
  useEffect(() => {
    const fetchSpecializationsData = async () => {
      try {
        // Fetch description
        const descRes = await fetch('http://localhost:5000/settings/specializationsDescription');
        if (descRes.ok) {
          const descData = await descRes.json();
          if (descData.value) {
            setDescription(descData.value);
          }
        }

        // Fetch services
        const servicesRes = await fetch('http://localhost:5000/settings/specializationsServices');
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          if (servicesData.value) {
            setServices(JSON.parse(servicesData.value));
          }
        }
      } catch (err) {
        console.error('Failed to fetch specializations data:', err);
      }
    };

    fetchSpecializationsData();
  }, []);

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
    
    try {
      await fetch('http://localhost:5000/settings/specializationsDescription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDescription }),
      });
    } catch (err) {
      console.error('Failed to save description:', err);
    }
  };

  const updateService = async (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);

    // Save to backend
    try {
      await fetch('http://localhost:5000/settings/specializationsServices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(updatedServices) }),
      });
    } catch (err) {
      console.error('Failed to save services:', err);
    }
  };

  return (
    <section className="space-y-12 md:space-y-16 px-4 md:px-0">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 mb-6 tracking-wider px-4">Specializations</h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-8 hover:w-32 transition-all duration-500"></div>
        <Editable
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          tag="p"
          className="text-gray-600 text-lg font-light max-w-2xl mx-auto leading-relaxed"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="group bg-white border border-gray-100 rounded-3xl p-10 hover:shadow-2xl hover:border-gray-200 transform hover:-translate-y-2 hover:scale-105 transition-all duration-700 text-left"
          >
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-gray-800 transition-all duration-300">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            
            <Editable
              type="text"
              value={service.name}
              onChange={(value) => updateService(index, 'name', value)}
              tag="h3"
              className="text-xl font-light text-gray-900 mb-2 group-hover:text-black transition-colors duration-300"
            />
            
            <div className="w-8 h-0.5 bg-gray-300 mt-6 mb-6 group-hover:w-16 group-hover:bg-gray-900 transition-all duration-500"></div>
            
            <Editable
              type="text"
              value={service.description}
              onChange={(value) => updateService(index, 'description', value)}
              className="text-gray-600 font-light leading-relaxed group-hover:text-gray-800 transition-colors duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}