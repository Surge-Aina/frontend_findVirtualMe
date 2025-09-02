import React from 'react';
import './ProcessTimeline.css';

const ProcessTimeline = ({ steps = [] }) => {
  return (
    <section id="process" className="process-section">
      <h2>Our Simple {steps.length}-Step Process</h2>
      <div className="timeline-container">
        {steps.map((step, index) => (
          <div key={step.number} className="timeline-item">
            <div className="timeline-number"><span>{step.number}</span></div>
            <div className="timeline-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            {/* The connector line logic remains the same */}
            {index < steps.length - 1 && <div className="timeline-connector"></div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessTimeline;