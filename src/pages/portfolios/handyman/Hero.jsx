import React from 'react';
import './Hero.css';

const Hero = ({ content }) => {
  // Use a default object to prevent errors if content is not passed
  const { 
    title = 'Default Title', 
    subtitle = 'Default Subtitle', 
    phoneNumber = '(000) 000-0000' 
  } = content || {};

  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        <h1>{title}</h1>
        <p className="hero-subheading">{subtitle}</p>
        <div className="hero-cta-group">
          <a href="#contact" className="hero-button">Request a Free Estimate</a>
          <a href={`tel:${phoneNumber}`} className="hero-phone">{phoneNumber}</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;