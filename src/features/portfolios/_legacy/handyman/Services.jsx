import React from 'react';
import './Services.css';

/**
 * Renders a 3-up grid of service cards.
 * Each item can include: { icon, title, description, bullets[] }
 * Back-compat: will use `name` if `title` is missing.
 */
const Services = ({ list = [], heading, intro }) => {
  const h =
    heading || 'Our Services';
  const i =
    intro || 'A One-Call Solution for Your To-Do List';

  return (
    <section id="services" className="services-section">
      <h2>{h}</h2>
      {i && <p className="services-intro">{i}</p>}

      <div className="services-grid">
        {list.map((service, idx) => {
          const title = service.title || service.name || `Service ${idx + 1}`;
          const desc = service.description || service.desc || '';
          const bullets = Array.isArray(service.bullets) ? service.bullets : [];
          return (
            <article key={title + idx} className="service-card">
              <div className="service-icon">{service.icon || '🔧'}</div>
              <h3 className="service-title">{title}</h3>
              {desc && <p className="service-desc">{desc}</p>}
              {bullets.length > 0 && (
                <ul className="service-bullets">
                  {bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Services;
