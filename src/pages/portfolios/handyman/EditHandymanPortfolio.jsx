import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import handymanAPI from './api.js';
import { toast } from 'react-toastify';

const EditHandymanPortfolio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const response = await handymanAPI.get(`/api/handyman-template/${id}`);
                setFormData(response.data);
            } catch (err) {
                toast.error("Could not load portfolio data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPortfolioData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        
        if (field) { // Nested object like hero.title
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else { // Top-level field
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleServiceChange = (index, e) => {
        const { name, value } = e.target;
        const newServices = [...formData.services];
        newServices[index][name] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, { icon: '🔧', name: '' }]
        }));
    };

    const removeService = (index) => {
        const filteredServices = formData.services.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, services: filteredServices }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handymanAPI.put(`/api/handyman-template/${id}`, formData);
            toast.success("Portfolio updated successfully!");
            navigate(`/portfolios/handyman/${id}`);
        } catch (err) {
            toast.error("Failed to update portfolio.");
            console.error(err);
        }
    };
    
    if (loading) return <div className="p-10 text-center">Loading editor...</div>;
    if (!formData) return <div className="p-10 text-center">Could not find portfolio to edit.</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Edit Your Handyman Portfolio</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Hero Section */}
                <div className="p-4 border rounded">
                    <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
                    <label>Title</label>
                    <input type="text" name="hero.title" value={formData.hero.title} onChange={handleInputChange} className="w-full p-2 border rounded" />
                    <label className="mt-2">Subtitle</label>
                    <input type="text" name="hero.subtitle" value={formData.hero.subtitle} onChange={handleInputChange} className="w-full p-2 border rounded" />
                    <label className="mt-2">Phone Number</label>
                    <input type="text" name="hero.phoneNumber" value={formData.hero.phoneNumber} onChange={handleInputChange} className="w-full p-2 border rounded" />
                </div>

                {/* Services Section */}
                <div className="p-4 border rounded">
                    <h2 className="text-xl font-semibold mb-4">Services</h2>
                    {formData.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" name="icon" placeholder="Icon (e.g., 🔧)" value={service.icon} onChange={(e) => handleServiceChange(index, e)} className="p-2 border rounded w-20" />
                            <input type="text" name="name" placeholder="Service Name" value={service.name} onChange={(e) => handleServiceChange(index, e)} className="p-2 border rounded flex-grow" />
                            <button type="button" onClick={() => removeService(index)} className="bg-red-500 text-white p-2 rounded">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addService} className="bg-blue-500 text-white p-2 rounded mt-2">Add Service</button>
                </div>

                {/* You would add more form sections here for Testimonials, ProcessSteps, etc. */}

                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">Save Changes</button>
            </form>
        </div>
    );
};

export default EditHandymanPortfolio;