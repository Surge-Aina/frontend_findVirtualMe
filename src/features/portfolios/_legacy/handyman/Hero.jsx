import React from "react";
import "./Hero.css";

export default function Hero({ content }) {
  const {
    title = "Trusted Handyman for Home Repairs & Maintenance",
    subtitle = "Licensed, Insured, and Ready to Help. Call us today!",
    phoneNumber = "(123) 456-7890",
    imageUrl = "https://images.unsplash.com/photo-1598533112127-3da0c37f4b6d?q=80&w=1600&auto=format&fit=crop",

    // NEW (read from DB with fallbacks)
    badge1Text = "Licensed & Insured",
    badge2Text = "5-Star Rated",
    badge3Text = "24/7 Emergency Service",
    ctaText    = "Request a Free Estimate",
  } = content || {};

  return (
    <section className="hero-v2" id="home">
      <div className="hero-inner">
        {/* Left column */}
        <div className="hero-left">{/* ⬅️ force left-align via CSS */}
          <h1 className="hero-h1">{title}</h1>
          <p className="hero-sub">{subtitle}</p>

          <ul className="hero-badges">
            <li>✅ {badge1Text}</li>
            <li>⭐ {badge2Text}</li>
            <li>🕑 {badge3Text}</li>
          </ul>

          <div className="hero-cta-row">
            <a href="#contact" className="hero-btn-primary">{ctaText}</a>
            <a className="hero-phone-pill" href={`tel:${phoneNumber.replace(/[^\d]/g, "")}`}>
              <span className="hero-phone-icn">📞</span>
              <span>{phoneNumber}</span>
            </a>
          </div>
        </div>

        {/* Right column */}
        <div className="hero-right">
          <div className="hero-photo-wrap">
            <img src={imageUrl} alt="Handyman at work" className="hero-photo" />
          </div>

          {/* ⬇️ moved outside the image wrapper so it sits below the photo */}
          <div className="hero-stats">
            <div><strong>15+</strong><span>Years Experience</span></div>
            <div><strong>500+</strong><span>Happy Customers</span></div>
            <div><strong>24/7</strong><span>Emergency Service</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
