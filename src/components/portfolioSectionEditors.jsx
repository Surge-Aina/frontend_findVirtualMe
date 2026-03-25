import { FieldEditor } from "./PortfolioEditorFields";

function linesToList(s) {
  if (!s || typeof s !== "string") return [];
  return s
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function listToLines(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join("\n");
}

function CardShell({ title, onRemove, children }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/80">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800">{title}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-xs text-red-600 hover:text-red-800">
            Remove
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/** Statistics block */
export function StatsEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const vis = data.visibility || {};
  const setVis = (k, v) => onChange({ ...data, visibility: { ...vis, [k]: v } });

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.showStatsSection !== false}
          onChange={(e) => set("showStatsSection", e.target.checked)}
        />
        <span className="text-sm font-medium text-gray-700">Show statistics section</span>
      </label>
      {["yearsExperience", "patientsServed", "successRate", "doctorsCount"].map((key) => (
        <div key={key} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <FieldEditor label={key} value={data[key]} onChange={(v) => set(key, v)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 pb-2">
            <input
              type="checkbox"
              checked={vis[key] !== false}
              onChange={(e) => setVis(key, e.target.checked)}
            />
            Visible
          </label>
        </div>
      ))}
    </div>
  );
}

/** Hours block */
export function HoursEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <FieldEditor label="Weekdays" value={data.weekdays} onChange={(v) => set("weekdays", v)} />
      <FieldEditor label="Saturday" value={data.saturday} onChange={(v) => set("saturday", v)} />
      <FieldEditor label="Sunday" value={data.sunday} onChange={(v) => set("sunday", v)} />
    </div>
  );
}

/** SEO block */
export function SeoEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <FieldEditor label="Site title (browser tab)" value={data.siteTitle} onChange={(v) => set("siteTitle", v)} />
      <FieldEditor label="Meta description" value={data.metaDescription} onChange={(v) => set("metaDescription", v)} type="textarea" rows={3} />
      <FieldEditor label="Keywords" value={data.keywords} onChange={(v) => set("keywords", v)} />
    </div>
  );
}

/** Project Manager summary */
export function SummarySectionEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-4">
      <FieldEditor label="Name" value={data.name} onChange={(v) => set("name", v)} />
      <FieldEditor label="Professional title" value={data.title} onChange={(v) => set("title", v)} />
      <FieldEditor label="Bio" value={data.bio} onChange={(v) => set("bio", v)} type="textarea" rows={4} />
      <FieldEditor label="Summary" value={data.summary} onChange={(v) => set("summary", v)} type="textarea" rows={4} />
      <FieldEditor label="Email" value={data.email} onChange={(v) => set("email", v)} type="email" />
      <FieldEditor label="Phone" value={data.phone} onChange={(v) => set("phone", v)} />
      <FieldEditor label="Location" value={data.location} onChange={(v) => set("location", v)} />
      <FieldEditor label="Profile image URL" value={data.profileImage} onChange={(v) => set("profileImage", v)} />
      <FieldEditor label="Resume URL" value={data.resumeUrl} onChange={(v) => set("resumeUrl", v)} />
    </div>
  );
}

export function SkillsEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? [...data.items] : [];
  const setItems = (next) => onChange({ ...data, items: next });

  const updateAt = (i, val) => {
    const next = [...items];
    next[i] = val;
    setItems(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Add one skill per row. These appear as tags or chips on your portfolio.</p>
      {items.map((skill, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={typeof skill === "string" ? skill : ""}
            onChange={(e) => updateAt(i, e.target.value)}
            placeholder="e.g. React, Project management"
          />
          <button
            type="button"
            className="text-sm text-red-600 shrink-0 px-2"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-blue-600 font-medium"
        onClick={() => setItems([...items, ""])}
      >
        + Add skill
      </button>
    </div>
  );
}

export function ExperienceEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  const patch = (i, patchObj) => {
    const next = [...items];
    next[i] = { ...next[i], ...patchObj };
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Add each role with dates and a short impact summary.</p>
      {items.map((exp, i) => (
        <CardShell title={`Role ${i + 1}`} onRemove={() => setItems(items.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="Job title" value={exp.title} onChange={(v) => patch(i, { title: v })} />
          <FieldEditor label="Company" value={exp.company} onChange={(v) => patch(i, { company: v })} />
          <FieldEditor label="Location" value={exp.location} onChange={(v) => patch(i, { location: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldEditor label="Start date" value={exp.startDate} onChange={(v) => patch(i, { startDate: v })} placeholder="YYYY-MM-DD" />
            <FieldEditor label="End date (leave empty if current)" value={exp.endDate} onChange={(v) => patch(i, { endDate: v })} placeholder="YYYY-MM-DD" />
          </div>
          <FieldEditor label="Description" value={exp.description} onChange={(v) => patch(i, { description: v })} type="textarea" rows={4} />
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add experience
      </button>
    </div>
  );
}

export function EducationEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  const patch = (i, patchObj) => {
    const next = [...items];
    next[i] = { ...next[i], ...patchObj };
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Schools, bootcamps, and certifications.</p>
      {items.map((edu, i) => (
        <CardShell title={`School ${i + 1}`} onRemove={() => setItems(items.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="School" value={edu.school} onChange={(v) => patch(i, { school: v })} />
          <FieldEditor label="Field of study" value={edu.fieldOfStudy} onChange={(v) => patch(i, { fieldOfStudy: v })} />
          <FieldEditor label="GPA (optional)" value={edu.gpa} onChange={(v) => patch(i, { gpa: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldEditor label="Start date" value={edu.startDate} onChange={(v) => patch(i, { startDate: v })} />
            <FieldEditor label="End date" value={edu.endDate} onChange={(v) => patch(i, { endDate: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degrees (one per line)</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={listToLines(edu.degrees)}
              onChange={(e) => patch(i, { degrees: linesToList(e.target.value) })}
              placeholder="B.S. Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Awards (one per line)</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={listToLines(edu.awards)}
              onChange={(e) => patch(i, { awards: linesToList(e.target.value) })}
            />
          </div>
          <FieldEditor label="Description" value={edu.description} onChange={(v) => patch(i, { description: v })} type="textarea" rows={3} />
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add education
      </button>
    </div>
  );
}

export function ProjectsEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  const patch = (i, patchObj) => {
    const next = [...items];
    next[i] = { ...next[i], ...patchObj };
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Projects with optional link to a demo or repo.</p>
      {items.map((p, i) => (
        <CardShell title={`Project ${i + 1}`} onRemove={() => setItems(items.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="Name" value={p.name} onChange={(v) => patch(i, { name: v })} />
          <FieldEditor label="Description" value={p.description} onChange={(v) => patch(i, { description: v })} type="textarea" rows={4} />
          <FieldEditor label="Link URL" value={p.link} onChange={(v) => patch(i, { link: v })} />
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add project
      </button>
    </div>
  );
}

function HealthcareServiceItemEditor({ item, onChange, onRemove }) {
  const patch = (k, v) => onChange({ ...item, [k]: v });
  const featuresText = listToLines(item.features);

  return (
    <CardShell title="Service" onRemove={onRemove}>
      <FieldEditor label="Title" value={item.title} onChange={(v) => patch("title", v)} />
      <FieldEditor label="Short description" value={item.description} onChange={(v) => patch("description", v)} type="textarea" rows={3} />
      <FieldEditor label="Image URL" value={item.image} onChange={(v) => patch("image", v)} />
      <FieldEditor label="Icon (emoji optional)" value={item.icon} onChange={(v) => patch("icon", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldEditor label="Price" value={item.price} onChange={(v) => patch("price", v)} />
        <FieldEditor label="Duration" value={item.duration} onChange={(v) => patch("duration", v)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={featuresText}
          onChange={(e) => patch("features", linesToList(e.target.value))}
        />
      </div>
    </CardShell>
  );
}

function HandymanServiceItemEditor({ item, onChange, onRemove }) {
  const patch = (k, v) => onChange({ ...item, [k]: v });

  return (
    <CardShell title="Service" onRemove={onRemove}>
      <FieldEditor label="Icon (emoji)" value={item.icon} onChange={(v) => patch("icon", v)} />
      <FieldEditor label="Title" value={item.title} onChange={(v) => patch("title", v)} />
      <FieldEditor label="Description" value={item.description} onChange={(v) => patch("description", v)} type="textarea" rows={3} />
      <FieldEditor label="Price" value={item.price != null ? String(item.price) : ""} onChange={(v) => patch("price", v === "" ? undefined : Number(v) || v)} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bullet points (one per line)</label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={listToLines(item.bullets)}
          onChange={(e) => patch("bullets", linesToList(e.target.value))}
        />
      </div>
    </CardShell>
  );
}

export function ServicesDataEditor({ template, data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  if (template === "healthcare") {
    return (
      <div className="space-y-4">
        <FieldEditor label="View all button text" value={data.viewAllText} onChange={(v) => onChange({ ...data, viewAllText: v })} />
        <FieldEditor label="Book button text" value={data.bookButtonText} onChange={(v) => onChange({ ...data, bookButtonText: v })} />
        <p className="text-sm text-gray-600 font-medium pt-2">Services</p>
        {items.map((item, i) => (
          <HealthcareServiceItemEditor
            key={i}
            item={item}
            onChange={(next) => {
              const arr = [...items];
              arr[i] = next;
              setItems(arr);
            }}
            onRemove={() => setItems(items.filter((_, j) => j !== i))}
          />
        ))}
        <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
          + Add service
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FieldEditor label="Section title" value={data.sectionTitle} onChange={(v) => onChange({ ...data, sectionTitle: v })} />
      <FieldEditor label="Section intro" value={data.sectionIntro} onChange={(v) => onChange({ ...data, sectionIntro: v })} type="textarea" />
      {items.map((item, i) => (
        <HandymanServiceItemEditor
          key={i}
          item={item}
          onChange={(next) => {
            const arr = [...items];
            arr[i] = next;
            setItems(arr);
          }}
          onRemove={() => setItems(items.filter((_, j) => j !== i))}
        />
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add service
      </button>
    </div>
  );
}

function HealthcareGalleryEditor({ data, onChange }) {
  const facilityImages = Array.isArray(data.facilityImages) ? data.facilityImages : [];
  const beforeAfterCases = Array.isArray(data.beforeAfterCases) ? data.beforeAfterCases : [];

  const setFacility = (next) => onChange({ ...data, facilityImages: next });
  const setCases = (next) => onChange({ ...data, beforeAfterCases: next });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-gray-800 mb-3">Facility photos</p>
        <p className="text-sm text-gray-600 mb-3">Images of your space or team. Add a caption for accessibility.</p>
        {facilityImages.map((img, i) => (
          <CardShell
            key={i}
            title={`Photo ${i + 1}`}
            onRemove={() => setFacility(facilityImages.filter((_, j) => j !== i))}
          >
            <FieldEditor label="Image URL" value={img.url} onChange={(v) => {
              const next = [...facilityImages];
              next[i] = { ...next[i], url: v };
              setFacility(next);
            }} />
            <FieldEditor label="Caption" value={img.caption} onChange={(v) => {
              const next = [...facilityImages];
              next[i] = { ...next[i], caption: v };
              setFacility(next);
            }} />
          </CardShell>
        ))}
        <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setFacility([...facilityImages, { url: "", caption: "" }])}>
          + Add facility photo
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-800 mb-3">Before &amp; after cases</p>
        {beforeAfterCases.map((c, i) => (
          <CardShell
            key={i}
            title={`Case ${i + 1}`}
            onRemove={() => setCases(beforeAfterCases.filter((_, j) => j !== i))}
          >
            <FieldEditor label="Title" value={c.title} onChange={(v) => {
              const next = [...beforeAfterCases];
              next[i] = { ...next[i], title: v };
              setCases(next);
            }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldEditor label="Treatment" value={c.treatment} onChange={(v) => {
                const next = [...beforeAfterCases];
                next[i] = { ...next[i], treatment: v };
                setCases(next);
              }} />
              <FieldEditor label="Duration" value={c.duration} onChange={(v) => {
                const next = [...beforeAfterCases];
                next[i] = { ...next[i], duration: v };
                setCases(next);
              }} />
            </div>
            <FieldEditor label="Before image URL" value={c.beforeImage} onChange={(v) => {
              const next = [...beforeAfterCases];
              next[i] = { ...next[i], beforeImage: v };
              setCases(next);
            }} />
            <FieldEditor label="After image URL" value={c.afterImage} onChange={(v) => {
              const next = [...beforeAfterCases];
              next[i] = { ...next[i], afterImage: v };
              setCases(next);
            }} />
            <FieldEditor label="Description" value={c.description} onChange={(v) => {
              const next = [...beforeAfterCases];
              next[i] = { ...next[i], description: v };
              setCases(next);
            }} type="textarea" rows={3} />
          </CardShell>
        ))}
        <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setCases([...beforeAfterCases, {}])}>
          + Add before/after case
        </button>
      </div>
    </div>
  );
}

function HandymanGalleryEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  return (
    <div className="space-y-4">
      <FieldEditor label="Section title" value={data.sectionTitle} onChange={(v) => onChange({ ...data, sectionTitle: v })} />
      <FieldEditor label="Section subtitle" value={data.sectionSubtitle} onChange={(v) => onChange({ ...data, sectionSubtitle: v })} type="textarea" rows={2} />
      <FieldEditor label="&quot;All&quot; filter label" value={data.allLabel} onChange={(v) => onChange({ ...data, allLabel: v })} />
      <p className="text-sm font-medium text-gray-800 pt-2">Gallery items</p>
      {items.map((item, i) => (
        <CardShell
          key={i}
          title={`Item ${i + 1}`}
          onRemove={() => setItems(items.filter((_, j) => j !== i))}
        >
          <FieldEditor label="Title" value={item.title} onChange={(v) => {
            const next = [...items];
            next[i] = { ...next[i], title: v };
            setItems(next);
          }} />
          <FieldEditor label="Category" value={item.category} onChange={(v) => {
            const next = [...items];
            next[i] = { ...next[i], category: v };
            setItems(next);
          }} />
          <FieldEditor label="Subtitle" value={item.subtitle} onChange={(v) => {
            const next = [...items];
            next[i] = { ...next[i], subtitle: v };
            setItems(next);
          }} />
          <FieldEditor label="Before image URL" value={item.beforeImageUrl} onChange={(v) => {
            const next = [...items];
            next[i] = { ...next[i], beforeImageUrl: v };
            setItems(next);
          }} />
          <FieldEditor label="After image URL" value={item.afterImageUrl} onChange={(v) => {
            const next = [...items];
            next[i] = { ...next[i], afterImageUrl: v };
            setItems(next);
          }} />
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add gallery item
      </button>
    </div>
  );
}

export function GalleryDataEditor({ template, data, onChange }) {
  if (template === "handyman") {
    return <HandymanGalleryEditor data={data} onChange={onChange} />;
  }
  return <HealthcareGalleryEditor data={data} onChange={onChange} />;
}

export function BlogDataEditor({ data, onChange }) {
  const posts = Array.isArray(data.posts) ? data.posts : [];
  const setPosts = (next) => onChange({ ...data, posts: next });

  const patch = (i, obj) => {
    const next = [...posts];
    next[i] = { ...next[i], ...obj };
    setPosts(next);
  };

  return (
    <div className="space-y-4">
      <FieldEditor label="Read more button text" value={data.readMoreText} onChange={(v) => onChange({ ...data, readMoreText: v })} />
      <FieldEditor label="View all text" value={data.viewAllText} onChange={(v) => onChange({ ...data, viewAllText: v })} />
      <p className="text-sm text-gray-600">Blog posts appear as cards; readers can open the full text in a lightbox.</p>
      {posts.map((post, i) => (
        <CardShell title={`Post ${i + 1}`} onRemove={() => setPosts(posts.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="Title" value={post.title} onChange={(v) => patch(i, { title: v })} />
          <FieldEditor label="Category" value={post.category} onChange={(v) => patch(i, { category: v })} />
          <FieldEditor label="Excerpt" value={post.excerpt} onChange={(v) => patch(i, { excerpt: v })} type="textarea" rows={3} />
          <FieldEditor label="Full content (optional)" value={post.content} onChange={(v) => patch(i, { content: v })} type="textarea" rows={6} />
          <FieldEditor label="Image URL" value={post.image} onChange={(v) => patch(i, { image: v })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldEditor label="Publish date" value={post.publishDate} onChange={(v) => patch(i, { publishDate: v })} />
            <FieldEditor label="Read time" value={post.readTime} onChange={(v) => patch(i, { readTime: v })} placeholder="e.g. 5 min" />
          </div>
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setPosts([...posts, {}])}>
        + Add post
      </button>
    </div>
  );
}

export function ProcessEditor({ data, onChange }) {
  const steps = Array.isArray(data.steps) ? data.steps : [];
  const setSteps = (next) => onChange({ ...data, steps: next });

  const patch = (i, obj) => {
    const next = [...steps];
    next[i] = { ...next[i], ...obj };
    setSteps(next);
  };

  return (
    <div className="space-y-4">
      <FieldEditor label="Section title" value={data.sectionTitle} onChange={(v) => onChange({ ...data, sectionTitle: v })} />
      {steps.map((step, i) => (
        <CardShell title={`Step ${i + 1}`} onRemove={() => setSteps(steps.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="Step number (optional)" value={step.number != null ? String(step.number) : ""} onChange={(v) => patch(i, { number: v === "" ? undefined : Number(v) })} />
          <FieldEditor label="Title" value={step.title} onChange={(v) => patch(i, { title: v })} />
          <FieldEditor label="Description" value={step.description} onChange={(v) => patch(i, { description: v })} type="textarea" rows={3} />
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setSteps([...steps, {}])}>
        + Add step
      </button>
    </div>
  );
}

export function TestimonialsEditor({ data, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const setItems = (next) => onChange({ ...data, items: next });

  const patch = (i, obj) => {
    const next = [...items];
    next[i] = { ...next[i], ...obj };
    setItems(next);
  };

  return (
    <div className="space-y-4">
      <FieldEditor label="Section title" value={data.sectionTitle} onChange={(v) => onChange({ ...data, sectionTitle: v })} />
      {items.map((t, i) => (
        <CardShell title={`Testimonial ${i + 1}`} onRemove={() => setItems(items.filter((_, j) => j !== i))} key={i}>
          <FieldEditor label="Client name" value={t.name} onChange={(v) => patch(i, { name: v })} />
          <FieldEditor label="Quote" value={t.quote} onChange={(v) => patch(i, { quote: v })} type="textarea" rows={4} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldEditor label="Location" value={t.location} onChange={(v) => patch(i, { location: v })} />
            <FieldEditor label="Service" value={t.service} onChange={(v) => patch(i, { service: v })} />
          </div>
        </CardShell>
      ))}
      <button type="button" className="text-sm text-blue-600 font-medium" onClick={() => setItems([...items, {}])}>
        + Add testimonial
      </button>
    </div>
  );
}
