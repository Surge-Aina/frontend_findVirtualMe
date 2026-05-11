import React from 'react';
import './Testimonials.css';

const Testimonials = ({ list = [], title }) => {
  return (
    <section id="testimonials" className="testimonials-section">
      <h2>{title || 'What Our Clients Say'}</h2>

      {list.length === 0 ? (
        <p className="testimonials-empty">No testimonials yet.</p>
      ) : (
        <div className="testimonials-grid">
          {list.map((t, i) => (
            <article key={i} className="testimonial-card">
              <p className="t-quote">“{t.quote}”</p>

              <div className="t-meta">
                <div className="t-name">{t.name}</div>
                {t.location ? <div className="t-location">{t.location}</div> : null}
                {t.service ? <div className="t-service">{t.service}</div> : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
