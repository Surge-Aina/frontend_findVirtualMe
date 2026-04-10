import React from 'react';
import './TrustHub.css';


const TrustHub = () => {
  return (
    <section id="trust" className="trust-hub-section">
      <div className="trust-hub-container">
        <div className="owner-card">
          <h3>Your Local Expert</h3>
          <p>
            With over 15 years of experience serving families around the Central Valley, I started this service to bring reliable, high-quality craftsmanship back to our community. When you hire me, you get a direct line to the person doing the work.
          </p>
        </div>
        <div className="guarantees-card">
          <h3>Our Promise to You</h3>
          <ul>
            <li><span>✅</span> <strong>On-Time Arrival:</strong> We respect your time and show up when we say we will.</li>
            <li><span>✅</span> <strong>1-Year Workmanship Warranty:</strong> We stand behind our work long after the job is done.</li>
            <li><span>✅</span> <strong>Licensed & Insured:</strong> Your home and peace of mind are fully protected.</li>
            <li><span>✅</span> <strong>Transparent Pricing:</strong> No hidden fees. You approve the price before we start.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrustHub;