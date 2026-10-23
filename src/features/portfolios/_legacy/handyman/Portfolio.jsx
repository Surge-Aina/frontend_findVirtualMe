import React, { useEffect, useMemo, useState } from "react";
import handymanAPI from "./api.js";
import "./Portfolio.css";

/**
 * Props:
 * - title: section heading
 * - subtitle: section sub-text
 * - allLabel: label for "All" filter button
 * - templateId?: when provided and no 'items' are passed, fetch projects for this template
 * - items?: static array of projects to render (skips fetching when provided)
 *
 * Project item shape expected:
 * { title, subtitle?, category, beforeImageUrl, afterImageUrl }
 */
export default function Portfolio({
  title = "Quality Craftsmanship You Can See",
  subtitle = "",
  allLabel = "All",
  templateId,
  items, // when present -> static mode
}) {
  const isStatic = Array.isArray(items) && items.length >= 0;

  const [projects, setProjects] = useState(items || []);
  const [active, setActive] = useState(allLabel);

  // Fetch only when not in static mode and we have a templateId
  useEffect(() => {
    if (isStatic) return;
    if (!templateId) return;
    let ignore = false;

    (async () => {
      try {
        const { data } = await handymanAPI.get("/api/handyman/portfolio", {
          params: { templateId },
        });
        if (!ignore) {
          const list = Array.isArray(data) ? data : data?.projects ?? [];
          setProjects(list);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
        setProjects([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isStatic, templateId]);

  // Build category list from current projects
  const categories = useMemo(() => {
    const cats = new Set();
    projects.forEach((p) => p?.category && cats.add(p.category));
    return [allLabel, ...Array.from(cats)];
  }, [projects, allLabel]);

  const filtered = useMemo(() => {
    if (active === allLabel) return projects;
    return projects.filter((p) => p.category === active);
  }, [projects, active, allLabel]);

  return (
    <section id="portfolio" className="portfolio-section">
      <h2 className="portfolio-title">{title}</h2>
      {subtitle ? <p className="portfolio-subtext">{subtitle}</p> : null}

      {/* Filters */}
      <div className="portfolio-filters">
        {categories.map((c) => (
          <button
            key={c}
            className={c === active ? "active" : ""}
            onClick={() => setActive(c)}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="portfolio-empty">No projects yet.</p>
      ) : (
        <div className="projects-grid">
          {filtered.map((p, i) => (
            <article key={i} className="project-card">
              {/* Category pill (top-right) */}
              {p.category && <span className="category-pill">{p.category}</span>}

              {/* Header */}
              <header className="project-header">
                <h3 className="project-title">{p.title}</h3>
                {p.subtitle ? (
                  <p className="project-subtitle">{p.subtitle}</p>
                ) : null}
              </header>

              {/* Before / After pair */}
              <div className="project-pair">
                <a
                  className="project-image"
                  href={p.beforeImageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={p.beforeImageUrl} alt={`${p.title} before`} />
                  <span className="badge badge--before">Before</span>
                </a>
                <a
                  className="project-image"
                  href={p.afterImageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={p.afterImageUrl} alt={`${p.title} after`} />
                  <span className="badge badge--after">After</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
