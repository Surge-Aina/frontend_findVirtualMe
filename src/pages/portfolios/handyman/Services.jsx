import React from 'react';
import './Services.css';

// The component now accepts a 'list' prop
const Services = ({ list = [] }) => {
  return (
    <section id="services" className="services-section">
      <h2>A One-Call Solution for Your To-Do List</h2>
      <p className="services-intro">We handle a wide range of home maintenance and repair solutions so you don't have to juggle multiple contractors.</p>
      <div className="services-grid">
        {/* We now map over the 'list' prop passed from the parent */}
        {list.map(service => (
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