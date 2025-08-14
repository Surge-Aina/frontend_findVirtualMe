import React from 'react';
import './Services.css';

const services = [
  { icon: '💧', name: 'Plumbing Repairs' },
  { icon: '💡', name: 'Electrical Work' },
  { icon: '🔨', name: 'Drywall & Painting' },
  { icon: '🚪', name: 'Door Installation' },
  { icon: '🔧', name: 'Fixture Replacement' },
  { icon: '🌳', name: 'Fence & Gate Repair' },
  { icon: '📦', name: 'Furniture Assembly' },
  { icon: '🏠', name: 'Gutter Cleaning' },
];

const Services = () => {
  return (
    <section id="services" className="services-section">
      <h2>A One-Call Solution for Your To-Do List</h2>
      <p className="services-intro">We handle a wide range of home maintenance and repair solutions so you don't have to juggle multiple contractors.</p>
      <div className="services-grid">
        {services.map(service => (
          <div key={service.name} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;