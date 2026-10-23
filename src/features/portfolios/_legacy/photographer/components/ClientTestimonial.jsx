import { useState, useEffect } from "react";
import Editable from "./Editable";

export default function ClientTestimonial() {
  const backendUrl = import.meta.env.VITE_BACKEND_API;
  const [testimonials, setTestimonials] = useState([
    { quote: "Absolutely stunning work. Every photo tells a story and captures emotion beautifully.", author: "Sarah M." },
    { quote: "Professional, creative, and incredibly talented. Made our wedding day magical.", author: "David & Emma" },
    { quote: "The attention to detail and artistic vision exceeded all our expectations.", author: "Michael R." }
  ]);
  const [description, setDescription] = useState(
    "What our clients say about their photography experience with us."
  );  

  // Load initial data from backend
  useEffect(() => {
    const fetchTestimonialsData = async () => {
      try {
        // Fetch description
  const descriptionRes = await fetch(`${backendUrl}/settings/testimonialsDescription`);
        if (descriptionRes.ok) {
          const descriptionData = await descriptionRes.json();
          if (descriptionData.value) {
            setDescription(descriptionData.value);
          }
        }

        // Fetch testimonials
  const res = await fetch(`${backendUrl}/settings/testimonials`);
        if (res.ok) {
          const data = await res.json();
          if (data.value) {
            setTestimonials(JSON.parse(data.value));
          }
        }
      } catch (err) {
        console.error('Failed to fetch testimonials data:', err);
      }
    };

    fetchTestimonialsData();
  }, []);

  const handleDescriptionChange = async (newDescription) => {
    setDescription(newDescription);
  
    try {
  await fetch(`${backendUrl}/settings/testimonialsDescription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDescription }),
      });
    } catch (err) {
      console.error('Failed to save testimonials description:', err);
    }
  };
  
  const updateTestimonial = async (index, field, value) => {
    const updatedTestimonials = [...testimonials];
    updatedTestimonials[index][field] = value;
    setTestimonials(updatedTestimonials);

    // Save to backend
    try {
  await fetch(`${backendUrl}/settings/testimonials`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(updatedTestimonials) }),
      });
    } catch (err) {
      console.error('Failed to save testimonials:', err);
    }
  };

  return (
    <section className="space-y-12 md:space-y-16 px-4 md:px-0">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-gray-900 mb-6 tracking-wider px-4">What Clients Say</h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-8 hover:w-32 transition-all duration-500"></div>
        <Editable
          type="text"
          value={description}
          onChange={handleDescriptionChange}
          className="text-gray-600 text-lg font-light max-w-2xl mb-3 mx-auto leading-relaxed hover:text-black cursor-pointer transition-colors"
        />
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="group bg-white border border-gray-100 rounded-3xl p-10 hover:shadow-2xl hover:border-gray-200 transform hover:-translate-y-2 hover:scale-105 transition-all duration-700 text-left"
          >
            <div className="text-4xl md:text-5xl lg:text-6xl text-gray-200 font-serif mb-6 group-hover:text-gray-300 transition-colors duration-300">"</div>
            <Editable
              type="text"
              value={testimonial.quote}
              onChange={(value) => updateTestimonial(index, 'quote', value)}
              className="text-gray-700 font-light italic leading-relaxed mb-8 group-hover:text-gray-800 transition-colors duration-300"
            />
            <div className="w-12 h-0.5 bg-gray-300 mt-6 mb-6 group-hover:w-20 group-hover:bg-gray-900 transition-all duration-500"></div>
            <Editable
              type="text"
              value={testimonial.author}
              onChange={(value) => updateTestimonial(index, 'author', value)}
              className="text-gray-900 font-light tracking-wide group-hover:text-black transition-colors duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}