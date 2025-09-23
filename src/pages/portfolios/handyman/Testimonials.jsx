import React from 'react';
import './Testimonials.css';

const Testimonials = ({ list = [], title }) => {
  return (
    <section id="testimonials" className="testimonials-section">
      <h2>{title || 'What Our Clients Say'}</h2>
      <div className="testimonials-container">
        {list.map(item => (
          <blockquote key={item.name} className="testimonial-card">
            <p>"{item.quote}"</p>
            <footer>- {item.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
