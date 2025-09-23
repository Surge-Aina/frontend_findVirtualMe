// Portfolio.jsx
import React, { useState, useEffect } from 'react';
import handymanAPI from './api';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Portfolio.css';

const Portfolio = ({ templateId, title, allLabel }) => {   // 👈 accept title + allLabel
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('__ALL__');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await handymanAPI.get('/api/handyman/portfolio', { params: { templateId } });
        setProjects(Array.isArray(data) ? data : (data?.projects ?? []));
      } catch (err) {
        console.error('Error fetching projects:', err);
        setProjects([]);
      }
    };
    if (templateId) fetchProjects();
  }, [templateId]);

  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  const visible = filter === '__ALL__' ? projects : projects.filter(p => p.category === filter);

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '60px',
    slidesToShow: 3,
    speed: 500,
    adaptiveHeight: true,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, centerPadding: '40px' } }],
  };

  return (
    <section id="portfolio" className="portfolio-section">
      {/* 👇 editable title */}
      <h2>{title || 'Quality Craftsmanship You Can See'}</h2>

      <div className="portfolio-filters">
        {/* 👇 editable ALL label */}
        <button
          className={filter === '__ALL__' ? 'active' : ''}
          onClick={() => setFilter('__ALL__')}
        >
          {allLabel || 'All'}
        </button>

        {categories.map(cat => (
          <button
            key={cat}
            className={filter === cat ? 'active' : ''}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="portfolio-slider">
        {visible.length > 0 ? (
          <Slider {...settings}>
            {visible.map(project => (
              <div key={project._id} className="project-slide">
                <div className="project-card">
                  <h3>{project.title}</h3>
                  <div className="project-pair">
                    <div className="project-image">
                      <img src={project.beforeImageUrl} alt="Before work" />
                      <div className="image-overlay">Before</div>
                    </div>
                    <div className="project-image">
                      <img src={project.afterImageUrl} alt="After work" />
                      <div className="image-overlay">After</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p>No projects yet.</p>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
