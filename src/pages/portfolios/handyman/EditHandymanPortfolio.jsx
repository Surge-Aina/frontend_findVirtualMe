    // pages/portfolios/handyman/EditHandymanPortfolio.jsx
    import React, { useEffect, useState, useRef } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { toast } from 'react-toastify';
    import handymanAPI from './api.js';

    const EditHandymanPortfolio = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // main template document
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    // projects (before/after pairs)
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    // refs for the Add Project form + file inputs
    const addFormRef = useRef(null);
    const beforeRef = useRef(null);
    const afterRef = useRef(null);

    // ----------------------- data loads -----------------------
    useEffect(() => {
        const fetchTemplate = async () => {
        try {
            const { data } = await handymanAPI.get(`/api/handyman-template/${id}`);
            setFormData(data);
        } catch (e) {
            console.error(e);
            toast.error('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
        };
        fetchTemplate();
    }, [id]);

    const loadProjects = async () => {
        setProjectsLoading(true);
        try {
        const { data } = await handymanAPI.get('/api/handyman/portfolio', {
            params: { templateId: id },
        });
        setProjects(Array.isArray(data) ? data : data?.projects ?? []);
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

    // ----------------------- form helpers -----------------------
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

    // services
    const handleServiceChange = (index, e) => {
        const { name, value } = e.target;
        const next = [...formData.services];
        next[index][name] = value;
        setFormData(prev => ({ ...prev, services: next }));
    };
    const addService = () =>
        setFormData(p => ({ ...p, services: [...p.services, { icon: '🔧', name: '' }] }));
    const removeService = (i) =>
        setFormData(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));

    // process steps
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

    // testimonials
    const handleTestimonialChange = (index, field, value) => {
        const next = [...formData.testimonials];
        next[index] = { ...next[index], [field]: value };
        setFormData(prev => ({ ...prev, testimonials: next }));
    };
    const addTestimonial = () =>
        setFormData(p => ({ ...p, testimonials: [...p.testimonials, { name: '', quote: '' }] }));
    const removeTestimonial = (i) =>
        setFormData(p => ({ ...p, testimonials: p.testimonials.filter((_, idx) => idx !== i) }));

    // ----------------------- save template -----------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await handymanAPI.put(`/api/handyman-template/${id}`, formData);
        toast.success('Portfolio updated successfully!');
        navigate(`/portfolios/handyman/${id}`);
        } catch (err) {
        console.error(err);
        toast.error('Failed to update portfolio.');
        }
    };

    // ----------------------- projects: add / update / delete -----------------------
    const handleAddProject = async (e) => {
        e.preventDefault();

        const before = beforeRef.current?.files?.[0];
        const after = afterRef.current?.files?.[0];
        if (!before || !after) {
        toast.error('Both before and after images are required');
        return;
        }

        // Build FormData from the real form element
        const fd = new FormData(addFormRef.current);
        fd.set('templateId', id);

        try {
        await handymanAPI.post('/api/handyman/portfolio', fd); // do NOT set Content-Type manually
        toast.success('Project added');
        addFormRef.current.reset();
        loadProjects();
        } catch (err) {
        console.error('Add project error:', err.response?.data || err.message);
        toast.error(err?.response?.data?.message || 'Failed to add project');
        }
    };

    const handleUpdateProject = async (projectId, e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
        await handymanAPI.put(`/api/handyman/portfolio/${projectId}`, fd);
        toast.success('Project updated');
        loadProjects();
        } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to update project');
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Delete this project?')) return;
        try {
        await handymanAPI.delete(`/api/handyman/portfolio/${projectId}`);
        toast.success('Project deleted');
        loadProjects();
        } catch (err) {
        console.error(err);
        toast.error('Failed to delete project');
        }
    };

    if (loading || !formData) return <div className="p-10 text-center">Loading editor...</div>;

    // ----------------------- UI -----------------------
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Edit Your Handyman Portfolio</h1>

        {/* ========== TEMPLATE FIELDS ========== */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

            {formData.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                <input
                    name="icon"
                    className="p-2 border rounded w-20"
                    value={service.icon}
                    onChange={(e) => handleServiceChange(index, e)}
                />
                <input
                    name="name"
                    className="p-2 border rounded flex-grow"
                    value={service.name}
                    onChange={(e) => handleServiceChange(index, e)}
                />
                <button
                    type="button"
                    className="bg-red-500 text-white p-2 rounded"
                    onClick={() => removeService(index)}
                >
                    Remove
                </button>
                </div>
            ))}
            <button type="button" className="bg-blue-500 text-white p-2 rounded" onClick={addService}>
                Add Service
            </button>
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
                    className="p-2 border rounded col-span-7"
                    placeholder="Quote"
                    value={t.quote}
                    onChange={(e) => handleTestimonialChange(idx, 'quote', e.target.value)}
                />
                <input
                    className="p-2 border rounded col-span-4"
                    placeholder="Name"
                    value={t.name}
                    onChange={(e) => handleTestimonialChange(idx, 'name', e.target.value)}
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
                name="contactSectionTitle"
                value={formData.contactSectionTitle || ''}
                onChange={handleInputChange}
            />
            <label className="mt-2">Subtitle</label>
            <input
                className="w-full p-2 border rounded"
                name="contactSectionSubtitle"
                value={formData.contactSectionSubtitle || ''}
                onChange={handleInputChange}
            />
            </div>

            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">
            Save Changes
            </button>
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
                ref={beforeRef}
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
                ref={afterRef}
                type="file"
                name="afterImage"
                accept="image/*"
                className="w-full p-2 border rounded"
                required
                />
            </div>

            {/* ensures templateId is in the FormData as well */}
            <input type="hidden" name="templateId" value={id} />

            <div className="md:col-span-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Project
                </button>
            </div>
            </form>

            {/* Existing projects */}
            {projectsLoading ? (
            <p>Loading projects…</p>
            ) : projects.length ? (
            <div className="space-y-4">
                {projects.map((p) => (
                <div key={p._id} className="border rounded p-3">
                    <form
                    onSubmit={(e) => handleUpdateProject(p._id, e)}
                    encType="multipart/form-data"
                    className="grid gap-3 md:grid-cols-2"
                    >
                    <div>
                        <label className="block text-sm mb-1">Title</label>
                        <input name="title" defaultValue={p.title} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Category</label>
                        <input
                        name="category"
                        defaultValue={p.category}
                        className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Replace “Before” Image (optional)</label>
                        <input
                        type="file"
                        name="beforeImage"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        />
                        {p.beforeImageUrl && (
                        <img
                            src={p.beforeImageUrl}
                            alt="before"
                            className="h-24 mt-2 object-cover rounded"
                        />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Replace “After” Image (optional)</label>
                        <input
                        type="file"
                        name="afterImage"
                        accept="image/*"
                        className="w-full p-2 border rounded"
                        />
                        {p.afterImageUrl && (
                        <img
                            src={p.afterImageUrl}
                            alt="after"
                            className="h-24 mt-2 object-cover rounded"
                        />
                        )}
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Save
                        </button>
                        <button
                        type="button"
                        onClick={() => handleDeleteProject(p._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                        Delete
                        </button>
                    </div>
                    </form>
                </div>
                ))}
            </div>
            ) : (
            <p>No projects yet.</p>
            )}
        </div>
        </div>
    );
    };

    export default EditHandymanPortfolio;
