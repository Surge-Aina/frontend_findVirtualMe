import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        <h1>Trusted Handyman for Home Repairs & Maintenance</h1>
        <p className="hero-subheading">Licensed, Insured, and Ready to Help. Call us today!</p>
        <div className="hero-cta-group">
          <a href="#contact" className="hero-button">Request a Free Estimate</a>
          <a href="tel" className="hero-phone">(123) 456-7890</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;