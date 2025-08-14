import React from 'react';
import './ProcessTimeline.css';

const ProcessTimeline = () => {
  const steps = [
    { number: 1, title: 'Request a Quote', description: 'Fill out our form or give us a call.' },
    { number: 2, title: 'We Confirm Details', description: 'We\'ll contact you to confirm the job scope.' },
    { number: 3, title: 'You Approve the Price', description: 'Get a firm, upfront price. No surprises.' },
    { number: 4, title: 'We Do the Work', description: 'We complete the job professionally and on time.' },
    { number: 5, title: 'Guaranteed Satisfaction', description: 'We ensure you\'re 100% happy with the result.' },
  ];

  return (
    <section id="process" className="process-section">
      <h2>Our Simple 5-Step Process</h2>
      <div className="timeline-container">
        {steps.map((step, index) => (
          <div key={step.number} className="timeline-item">
            <div className="timeline-number"><span>{step.number}</span></div>
            <div className="timeline-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            {index < steps.length - 1 && <div className="timeline-connector"></div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessTimeline;
