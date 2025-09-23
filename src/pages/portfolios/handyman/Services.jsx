import React from 'react';
import './Services.css';

const Services = ({ list = [], heading, intro }) => {
  const h = heading || 'A One-Call Solution for Your To-Do List';
  const i = intro   || "We handle a wide range of home maintenance and repair solutions so you don't have to juggle multiple contractors.";
  return (
    <section id="services" className="services-section">
      <h2>{h}</h2>
      <p className="services-intro">{i}</p>
      <div className="services-grid">
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
