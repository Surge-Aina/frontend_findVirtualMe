import React from 'react';
import './Testimonials.css';

const testimonials = [
  { id: 1, name: 'Jane D.', quote: '"Incredibly reliable and professional. The job was done perfectly and on time!"' },
  { id: 2, name: 'John S.', quote: '"Finally found a handyman I can trust. Highly recommended for any home repair."' },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <h2>What Our Clients Say</h2>
      <div className="testimonials-container">
        {testimonials.map(item => (
          <blockquote key={item.id} className="testimonial-card">
            <p>{item.quote}</p>
            <footer>- {item.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;