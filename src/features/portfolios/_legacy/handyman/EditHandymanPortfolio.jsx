    // pages/portfolios/handyman/EditHandymanPortfolio.jsx
    import React, { useEffect, useState, useRef, useContext } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { toast } from 'react-toastify';
    import handymanAPI from './api.js';
    import { AuthContext } from "@/shared/context/AuthContext";
    import { startTracking, stopTracking, logPortfolioAction } from "@/shared/utils/portfolioEditLogger";

    const EditHandymanPortfolio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    /** New: hold edits & dirty flags for projects */
    const [projectEdits, setProjectEdits] = useState({});   // { [projectId]: {title, subtitle, category} }
    const [projectDirty, setProjectDirty] = useState({});   // { [projectId]: true }

    /** New: per-project file refs (replace before/after) */
    const beforeFileRefs = useRef({});
    const afterFileRefs  = useRef({});

    /** Add form refs stay as-is */
    const addFormRef = useRef(null);
    const addBeforeRef = useRef(null);
    const addAfterRef = useRef(null);

    useEffect(() => {
        const fetchTemplate = async () => {
        try {
            const { data } = await handymanAPI.get(`/api/handyman-template/${id}`);
            setFormData(data);

            // ----- ownership check -----
            let currentUserId = user?.id || user?._id;
            if (!currentUserId && localStorage.getItem('token')) {
            try {
                const me = await handymanAPI.get('/api/users/me');
                currentUserId = me?.data?.id || me?.data?._id;
            } catch {
              /* ignore /user/me fetch errors */
            }
            }
            const ownerId = data?.userId;
            const isOwner =
            currentUserId && ownerId && String(currentUserId) === String(ownerId);

            if (!isOwner) {
            toast.error('You do not have permission to edit this portfolio.');
            navigate(`/portfolios/handyman/${id}`);
            return;
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
        };
        fetchTemplate();
    }, [id, user, navigate]);

    const loadProjects = async () => {
        setProjectsLoading(true);
        try {
        const { data } = await handymanAPI.get('/api/handyman/portfolio', {
            params: { templateId: id },
        });
        const list = Array.isArray(data) ? data : data?.projects ?? [];
        setProjects(list);

        // initialize edits from server data
        const initialEdits = {};
        list.forEach(p => {
            initialEdits[p._id] = {
            title: p.title || '',
            subtitle: p.subtitle || '',
            category: p.category || ''
            };
        });
        setProjectEdits(initialEdits);
        setProjectDirty({}); // reset dirty flags
        beforeFileRefs.current = {};
        afterFileRefs.current = {};
        } catch (e) {
        console.error(e);
        toast.error('Failed to load projects');
        } finally {
        setProjectsLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, [id]);

    // Start tracking when component loads
    useEffect(() => {
        if (formData && user) {
            const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
            startTracking({
                sessionId: sessionId,
                userId: user?.id || user?._id || 'anonymous',
                portfolioID: id,
                portfolioType: 'handyman',
                name: user?.name || formData?.hero?.title || null,
                email: user?.email || null,
            });
        }
        
        return () => {
            stopTracking();
        };
    }, [formData, user, id]);

    // --- nested path setter (already supports hero.imageUrl etc.) ---
    const setNested = (path, value) => {
        const keys = path.split('.');
        setFormData(prev => {
        const copy = structuredClone(prev);
        let cur = copy;
        keys.slice(0, -1).forEach(k => {
            if (!cur[k]) cur[k] = {};
            cur = cur[k];
        });
        cur[keys.at(-1)] = value;
        return copy;
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) return setNested(name, value);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Services helpers ---
    const addService = () =>
        setFormData(p => ({
        ...p,
        services: [
            ...p.services,
            { title: '', description: '', bullets: [] }
        ]
        }));

    const removeService = (i) =>
        setFormData(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));

    const handleServiceField = (index, field, value) => {
        setFormData(prev => {
        const next = [...prev.services];
        next[index] = { ...next[index], [field]: value };
        return { ...prev, services: next };
        });
    };

    const parseServiceBulletsText = (text) => {
        if (typeof text !== 'string') return [];
        return text.split(/\r?\n/);
    };


    const handleStepChange = (index, field, value) => {
        const next = [...formData.processSteps];
        next[index] = {
        ...next[index],
        [field]: field === 'number' ? Number(value) : value,
        };
        setFormData(prev => ({ ...prev, processSteps: next }));
    };
    const addStep = () => {
        const n = (formData.processSteps?.length || 0) + 1;
        setFormData(p => ({
        ...p,
        processSteps: [...p.processSteps, { number: n, title: '', description: '' }],
        }));
    };
    const removeStep = (i) =>
        setFormData(p => ({ ...p, processSteps: p.processSteps.filter((_, idx) => idx !== i) }));

    const handleTestimonialChange = (index, field, value) => {
        const next = [...formData.testimonials];
        next[index] = { ...next[index], [field]: value };
        setFormData(prev => ({ ...prev, testimonials: next }));
    };
    const addTestimonial = () =>
        setFormData(p => ({ ...p, testimonials: [...p.testimonials, { name: '', quote: '' }] }));
    const removeTestimonial = (i) =>
        setFormData(p => ({ ...p, testimonials: p.testimonials.filter((_, idx) => idx !== i) }));

    /** ========== NEW: project field change helpers ========== */
    const onProjectFieldChange = (projectId, field, value) => {
        setProjectEdits(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], [field]: value }
        }));
        setProjectDirty(prev => ({ ...prev, [projectId]: true }));
    };
    const onProjectBeforeFile = (projectId, file) => {
        beforeFileRefs.current[projectId] = file;
        setProjectDirty(prev => ({ ...prev, [projectId]: true }));
    };
    const onProjectAfterFile = (projectId, file) => {
        afterFileRefs.current[projectId] = file;
        setProjectDirty(prev => ({ ...prev, [projectId]: true }));
    };

    /** ========== SAVE ALL (template + dirty projects) ========== */
    const handleSaveAll = async () => {
        try {
        // 1) save template copy
        await handymanAPI.put(`/api/handyman-template/${id}`, formData);

        // 2) save only dirty projects (title/subtitle/category and optional files)
        const dirtyIds = Object.keys(projectDirty).filter(k => projectDirty[k]);
        for (const pid of dirtyIds) {
            const fd = new FormData();
            const edit = projectEdits[pid] || {};
            if (edit.title != null) fd.set('title', edit.title);
            if (edit.subtitle != null) fd.set('subtitle', edit.subtitle);
            if (edit.category != null) fd.set('category', edit.category);

            const bFile = beforeFileRefs.current[pid];
            const aFile = afterFileRefs.current[pid];
            if (bFile) fd.set('beforeImage', bFile);
            if (aFile) fd.set('afterImage', aFile);

            await handymanAPI.put(`/api/handyman/portfolio/${pid}`, fd);
        }

        // Log portfolio update action
        const sessionId = localStorage.getItem("onboardingSessionId") || `session_${Date.now()}`;
        await logPortfolioAction('updated', {
            sessionId: sessionId,
            userId: user?.id || user?._id || 'anonymous',
            portfolioID: id,
            portfolioType: 'handyman',
            name: user?.name || formData?.hero?.title || null,
            email: user?.email || null,
        });

        toast.success('All changes saved!');
        await loadProjects(); // refresh local state/dirty flags
        navigate(`/portfolios/handyman/${id}`);
        } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to save changes');
        }
    };

    /** ========== Add, Delete project remain as-is ========== */
    const handleAddProject = async (e) => {
        e.preventDefault();
        const before = addBeforeRef.current?.files?.[0];
        const after = addAfterRef.current?.files?.[0];
        if (!before || !after) {
        toast.error('Both before and after images are required');
        return;
        }
        const fd = new FormData(addFormRef.current);
        fd.set('templateId', id);
        try {
        await handymanAPI.post('/api/handyman/portfolio', fd);
        toast.success('Project added');
        addFormRef.current.reset();
        await loadProjects();
        } catch (err) {
        console.error('Add project error:', err.response?.data || err.message);
        toast.error(err?.response?.data?.message || 'Failed to add project');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Delete this project?')) return;
        try {
        await handymanAPI.delete(`/api/handyman/portfolio/${projectId}`);
        toast.success('Project deleted');
        await loadProjects();
        } catch (err) {
        console.error(err);
        toast.error('Failed to delete project');
        }
    };

    if (loading || !formData) return <div className="p-10 text-center">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Your Handyman Portfolio</h1>

        {/* ========== TEMPLATE FIELDS ========== */}
        <form id="templateForm" onSubmit={(e)=>{e.preventDefault(); handleSaveAll();}} className="space-y-6">
            {/* Hero */}
            <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>

            <label>Title</label>
            <input
                className="w-full p-2 border rounded"
                name="hero.title"
                value={formData.hero.title}
                onChange={handleInputChange}
            />

            <label className="mt-2">Subtitle</label>
            <input
                className="w-full p-2 border rounded"
                name="hero.subtitle"
                value={formData.hero.subtitle}
                onChange={handleInputChange}
            />

            <label className="mt-2">Phone Number</label>
            <input
                className="w-full p-2 border rounded"
                name="hero.phoneNumber"
                value={formData.hero.phoneNumber}
                onChange={handleInputChange}
            />

            <label className="mt-2">Hero Image URL</label>
            <input
                className="w-full p-2 border rounded"
                name="hero.imageUrl"
                value={formData.hero.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="https://…"
            />

            {/* editable badges + CTA */}
            <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div>
                <label className="block mb-1">Badge 1</label>
                <input
                    className="w-full p-2 border rounded"
                    name="hero.badge1Text"
                    value={formData.hero.badge1Text ?? 'Licensed & Insured'}
                    onChange={handleInputChange}
                />
                </div>
                <div>
                <label className="block mb-1">Badge 2</label>
                <input
                    className="w-full p-2 border rounded"
                    name="hero.badge2Text"
                    value={formData.hero.badge2Text ?? '5-Star Rated'}
                    onChange={handleInputChange}
                />
                </div>
                <div>
                <label className="block mb-1">Badge 3</label>
                <input
                    className="w-full p-2 border rounded"
                    name="hero.badge3Text"
                    value={formData.hero.badge3Text ?? '24/7 Emergency Service'}
                    onChange={handleInputChange}
                />
                </div>
                <div>
                <label className="block mb-1">CTA Button Text</label>
                <input
                    className="w-full p-2 border rounded"
                    name="hero.ctaText"
                    value={formData.hero.ctaText ?? 'Request a Free Estimate'}
                    onChange={handleInputChange}
                />
                </div>
            </div>
            </div>

            {/* Services */}
            <div className="p-4 border rounded space-y-3">
            <h2 className="text-xl font-semibold">Services</h2>

            <label>Section Title</label>
            <input
                className="w-full p-2 border rounded"
                name="servicesSectionTitle"
                value={formData.servicesSectionTitle || ''}
                onChange={handleInputChange}
            />

            <label className="mt-2">Intro Blurb</label>
            <textarea
                rows={3}
                className="w-full p-2 border rounded"
                name="servicesSectionIntro"
                value={formData.servicesSectionIntro || ''}
                onChange={handleInputChange}
            />

            <div className="space-y-4">
                {formData.services.map((service, index) => (
                <div key={index} className="p-3 border rounded-md space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Title */}
                    <div className="col-span-12 sm:col-span-7">
                        <label className="block text-sm mb-1">Title</label>
                        <input
                        className="w-full p-2 border rounded"
                        value={service.title ?? service.name ?? ''}
                        onChange={(e) => handleServiceField(index, 'title', e.target.value)}
                        placeholder="e.g., Plumbing Services"
                        />
                    </div>
                    
                    {/* ✅ NEW: Price (hidden on website, used in emails/estimates) */}
                    <div className="col-span-12 sm:col-span-3">
                    <label className="block text-sm mb-1">Price (hidden)</label>
                    <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded"
                        value={Number(service.price ?? 0)}
                        onChange={(e) => handleServiceField(index, 'price', Number(e.target.value))}
                        placeholder="e.g., 149"
                    />
                    </div>

                    {/* Remove button */}
                    <div className="col-span-12 sm:col-span-2 sm:col-start-12 sm:justify-self-end">
                        <label className="block text-sm opacity-0 select-none">remove</label>
                        <button
                        type="button"
                        className="bg-red-500 text-white px-3 py-2 rounded w-full"
                        onClick={() => removeService(index)}
                        >
                        Remove
                        </button>
                    </div>

                    {/* Description */}
                    <div className="col-span-12">
                        <label className="block text-sm mb-1">Short Description</label>
                        <textarea
                        rows={2}
                        className="w-full p-2 border rounded"
                        value={service.description || ''}
                        onChange={(e) => handleServiceField(index, 'description', e.target.value)}
                        placeholder="One-sentence summary shown under the title."
                        />
                    </div>
                    </div>

                    {/* Bullets */}
                    <div>
                    <label className="block text-sm mb-1">Bullet points (one per line)</label>
                    <textarea
                        rows={5}
                        className="w-full p-2 border rounded resize-y min-h-[6rem]"
                        value={Array.isArray(service.bullets) ? service.bullets.join('\n') : ''}
                        onChange={(e) => handleServiceField(index, 'bullets', parseServiceBulletsText(e.target.value))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') e.stopPropagation();
                        }}
                        placeholder={"e.g. Drywall repair\nDoor & window fixes"}
                    />
                    </div>
                </div>
                ))}
            </div>

            <button type="button" className="bg-blue-600 text-white p-2 rounded" onClick={addService}>
                Add Service
            </button>
            </div>

            {/* Projects section copy (Title/Sub-text/All label) */}
            <div className="p-4 border rounded space-y-3">
            <h2 className="text-xl font-semibold">Projects Section</h2>

            <label>Section Title</label>
            <input
                className="w-full p-2 border rounded"
                name="portfolioTitle"
                value={formData.portfolioTitle || ''}
                onChange={handleInputChange}
                placeholder="Quality Craftsmanship You Can See"
            />

            <label className="mt-2">Section Sub-text</label>
            <textarea
                rows={3}
                className="w-full p-2 border rounded"
                name="portfolioSubtitle"
                value={formData.portfolioSubtitle || ''}
                onChange={handleInputChange}
                placeholder="Short descriptive text that appears above the filter buttons"
            />

            <label className="mt-2">“All” Button Label</label>
            <input
                className="w-full p-2 border rounded"
                name="portfolioAllLabel"
                value={formData.portfolioAllLabel || ''}
                onChange={handleInputChange}
                placeholder="All"
            />
            </div>

            {/* Process */}
            <div className="p-4 border rounded space-y-3">
            <h2 className="text-xl font-semibold">Process</h2>
            <label>Section Title (optional)</label>
            <input
                className="w-full p-2 border rounded"
                name="processSectionTitle"
                value={formData.processSectionTitle || ''}
                onChange={handleInputChange}
            />
            {formData.processSteps.map((step, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                    className="p-2 border rounded col-span-2"
                    type="number"
                    value={step.number}
                    onChange={(e) => handleStepChange(idx, 'number', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-4"
                    placeholder="Title"
                    value={step.title}
                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-5"
                    placeholder="Description"
                    value={step.description}
                    onChange={(e) => handleStepChange(idx, 'description', e.target.value)}
                />
                <button
                    type="button"
                    className="bg-red-500 text-white p-2 rounded col-span-1"
                    onClick={() => removeStep(idx)}
                >
                    X
                </button>
                </div>
            ))}
            <button type="button" className="bg-blue-500 text-white p-2 rounded" onClick={addStep}>
                Add Step
            </button>
            </div>

            {/* Testimonials */}
            <div className="p-4 border rounded space-y-3">
            <h2 className="text-xl font-semibold">Testimonials</h2>

            <label>Section Title</label>
            <input
                className="w-full p-2 border rounded"
                name="testimonialsSectionTitle"
                value={formData.testimonialsSectionTitle || ''}
                onChange={handleInputChange}
            />

            {formData.testimonials.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                    className="p-2 border rounded col-span-6"
                    placeholder="Quote"
                    value={t.quote}
                    onChange={(e) => handleTestimonialChange(idx, 'quote', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-3"
                    placeholder="Name"
                    value={t.name}
                    onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-2"
                    placeholder="Town / Neighborhood"
                    value={t.location || ''}
                    onChange={(e) => handleTestimonialChange(idx, 'location', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-1"
                    placeholder="Service"
                    value={t.service || ''}
                    onChange={(e) => handleTestimonialChange(idx, 'service', e.target.value)}
                />
                <button
                    type="button"
                    className="bg-red-500 text-white p-2 rounded col-span-1"
                    onClick={() => removeTestimonial(idx)}
                >
                    X
                </button>
                </div>
            ))}

            <button
                type="button"
                className="bg-blue-500 text-white p-2 rounded"
                onClick={addTestimonial}
            >
                Add Testimonial
            </button>
            </div>


            {/* Contact copy */}
                <div className="p-4 border rounded">
                <h2 className="text-xl font-semibold">Contact</h2>

                <label>Section Title</label>
                <input
                    className="w-full p-2 border rounded"
                    name="contact.title"
                    value={formData.contact?.title || ''}
                    onChange={handleInputChange}
                    placeholder="Get Your Free Estimate"
                />

                <label className="mt-2">Subtitle (under the main heading)</label>
                <textarea
                    rows={2}
                    className="w-full p-2 border rounded"
                    name="contact.subtitle"
                    value={formData.contact?.subtitle || ''}
                    onChange={handleInputChange}
                    placeholder="Ready to get started? Contact us today..."
                />

                <label className="mt-2">Form Card Title</label>
                <input
                    className="w-full p-2 border rounded"
                    name="contact.formTitle"
                    value={formData.contact?.formTitle || ''}
                    onChange={handleInputChange}
                    placeholder="Ready to get started? Send us a message!"
                />

                <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div>
                    <label>Phone</label>
                    <input
                        className="w-full p-2 border rounded"
                        name="contact.phone"
                        value={formData.contact?.phone || ''}
                        onChange={handleInputChange}
                        placeholder="(112) 233-4455"
                    />
                    </div>
                    <div>
                    <label>Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        name="contact.email"
                        value={formData.contact?.email || ''}
                        onChange={handleInputChange}
                        placeholder="contact@prohandy.com"
                    />
                    </div>
                    <div>
                    <label>Hours</label>
                    <input
                        className="w-full p-2 border rounded"
                        name="contact.hours"
                        value={formData.contact?.hours || ''}
                        onChange={handleInputChange}
                        placeholder="Mon–Fri: 7AM–7PM"
                    />
                    </div>
                    <div>
                    <label>Note (small helper text)</label>
                    <input
                        className="w-full p-2 border rounded"
                        name="contact.note"
                        value={formData.contact?.note || ''}
                        onChange={handleInputChange}
                        placeholder="Weekend & emergency calls available"
                    />
                    </div>
                </div>
                </div>
        </form>

        {/* ========== PROJECTS (Before/After) ========== */}
        <div className="p-4 border rounded space-y-4">
            <h2 className="text-xl font-semibold">Portfolio Projects (Before/After)</h2>

            {/* Add new project */}
            <form
            ref={addFormRef}
            onSubmit={handleAddProject}
            encType="multipart/form-data"
            className="grid gap-3 md:grid-cols-2"
            >
            <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                name="title"
                className="w-full p-2 border rounded"
                placeholder="Kitchen Faucet Replacement"
                required
                />
            </div>
            <div>
                <label className="block text-sm mb-1">Subtitle (optional)</label>
                <input
                name="subtitle"
                className="w-full p-2 border rounded"
                placeholder="New fixtures, counters & lighting"
                />
            </div>
            <div>
                <label className="block text-sm mb-1">Category</label>
                <input
                name="category"
                className="w-full p-2 border rounded"
                placeholder="Plumbing"
                required
                />
            </div>
            <div>
                <label className="block text-sm mb-1">Before Image</label>
                <input
                ref={addBeforeRef}
                type="file"
                name="beforeImage"
                accept="image/*"
                className="w-full p-2 border rounded"
                required
                />
            </div>
            <div>
                <label className="block text-sm mb-1">After Image</label>
                <input
                ref={addAfterRef}
                type="file"
                name="afterImage"
                accept="image/*"
                className="w-full p-2 border rounded"
                required
                />
            </div>

            <input type="hidden" name="templateId" value={id} />

            <div className="md:col-span-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Project
                </button>
            </div>
            </form>

            {/* Existing projects (no per-project Save button) */}
            {projectsLoading ? (
            <p>Loading projects…</p>
            ) : projects.length ? (
            <div className="space-y-4">
                {projects.map((p) => (
                <div key={p._id} className="border rounded p-3 grid gap-3 md:grid-cols-2">
                    <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        value={projectEdits[p._id]?.title || ''}
                        onChange={(e)=>onProjectFieldChange(p._id,'title',e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div>
                    <label className="block text-sm mb-1">Subtitle (optional)</label>
                    <input
                        value={projectEdits[p._id]?.subtitle || ''}
                        onChange={(e)=>onProjectFieldChange(p._id,'subtitle',e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    </div>
                    <div>
                    <label className="block text-sm mb-1">Category</label>
                    <input
                        value={projectEdits[p._id]?.category || ''}
                        onChange={(e)=>onProjectFieldChange(p._id,'category',e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    </div>

                    <div>
                    <label className="block text-sm mb-1">Replace “Before” Image (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        onChange={(e)=>onProjectBeforeFile(p._id, e.target.files?.[0])}
                    />
                    {p.beforeImageUrl && (
                        <img src={p.beforeImageUrl} alt="before" className="h-24 mt-2 object-cover rounded" />
                    )}
                    </div>

                    <div>
                    <label className="block text-sm mb-1">Replace “After” Image (optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        onChange={(e)=>onProjectAfterFile(p._id, e.target.files?.[0])}
                    />
                    {p.afterImageUrl && (
                        <img src={p.afterImageUrl} alt="after" className="h-24 mt-2 object-cover rounded" />
                    )}
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                    {/* Removed per-project Save button */}
                    <button
                        type="button"
                        onClick={() => handleDeleteProject(p._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Delete
                    </button>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <p>No projects yet.</p>
            )}
        </div>

        {/* ✅ Single Save button that saves template + all dirty project edits */}
        <div className="pt-2">
            <button
            onClick={handleSaveAll}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold"
            >
            Save Changes
            </button>
        </div>
        </div>
    );
    };

    export default EditHandymanPortfolio;
