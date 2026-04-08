
import React, { useEffect, useState, Suspense, useMemo, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { RoomModel } from '../models/RoomModels';
import Editable from './Editable';
import { AuthContext } from '../context/AuthContext';

const Services = () => {
  
  const { portfolioId } = useParams();
  const BASE = portfolioId 
    ? `/portfolios/cleaningService/${portfolioId}`
    : `/portfolios/cleaningService`;

  const backendUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [buildRoomsTitle, setBuildRoomsTitle] = useState("Build Your Rooms");
  const [cleaningServicesTitle, setCleaningServicesTitle] = useState("Cleaning Services");
  const [roomLabels, setRoomLabels] = useState({
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    bathroom: 'Bathroom',
    livingRoom: 'LivingRoom'
  });
  const [roomCounts, setRoomCounts] = useState({
    bedroom: 0,
    kitchen: 0,
    bathroom: 0,
    livingRoom: 0,
  });
  const [roomPrices, setRoomPrices] = useState({});
  const [editPricesMode, setEditPricesMode] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [quoteTotal, setQuoteTotal] = useState(null);
  const { isAdmin ,setCurrentPortfolioId} = useContext(AuthContext);
// ✅ ADD THIS ENTIRE useEffect:
useEffect(() => {
  if (portfolioId) {
    setCurrentPortfolioId(portfolioId);
  }
  
  return () => setCurrentPortfolioId(null);
}, [portfolioId, setCurrentPortfolioId]);

useEffect(() => {
  console.log('🔥 Services - isAdmin CHANGED! New value:', isAdmin);
}, [isAdmin]);
  // ✅ ADD THIS DEBUG LOG:
  console.log('🔍 Services Debug:', {
    portfolioId,
    isAdmin,
    hasToken: !!localStorage.getItem('token')
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchRoomPrices();
    if (portfolioId) {
      fetchTitles();
      fetchRoomLabels();
    }
  }, [portfolioId]);

  const fetchRoomLabels = async () => {
  if (!portfolioId) return;
  
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${backendUrl}/api/portfolios/${portfolioId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    
    const response = await res.json();
    const p = response.portfolio || response;
    
    // ✅ Get room labels from portfolio
    if (p.roomLabels) {
      setRoomLabels({
        bedroom: p.roomLabels.bedroom || 'Bedroom',
        kitchen: p.roomLabels.kitchen || 'Kitchen',
        bathroom: p.roomLabels.bathroom || 'Bathroom',
        livingRoom: p.roomLabels.livingRoom || 'Living Room'
      });
    }
  } catch (err) {
    console.error('Failed to fetch room labels:', err);
  }
};

const handleRoomLabelChange = async (roomType, newValue) => {
  if (!portfolioId) {
    toast.info('This is a demo. Sign up to create your own portfolio!');
    return;
  }
  
  // Update local state
  setRoomLabels(prev => ({
    ...prev,
    [roomType]: newValue
  }));

  try {
    const token = localStorage.getItem('token');
    
    // ✅ Save to portfolio's roomLabels object
    await fetch(`${backendUrl}/api/portfolios/my-portfolio`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        [`roomLabels.${roomType}`]: newValue  // ← Nested field update
      })
    });
    
    toast.success('Room label updated!');
  } catch (err) {
    console.error('Failed to save room label:', err);
    toast.error('Failed to save room label');
  }
};

 const fetchTitles = async () => {
  if (!portfolioId) {
    console.log('📋 No portfolioId - using default titles (demo mode)');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');  // ← Get token
    
    const res = await fetch(`${backendUrl}/api/portfolios/${portfolioId}?t=${Date.now()}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}  // ← Add headers
    });
    
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    
    const response = await res.json();
    const p = response.portfolio || response;
    
    if (p.buildRoomsTitle) setBuildRoomsTitle(p.buildRoomsTitle);
    if (p.cleaningServicesTitle) setCleaningServicesTitle(p.cleaningServicesTitle);
    
  } catch (err) {
    console.error('Failed to fetch titles:', err);
  }
};

  const handleTitleChange = async (key, newValue) => {
    if (!portfolioId) {
      toast.info('This is a demo. Sign up to create your own portfolio!');
      return;
    }
    
    // Update local state immediately
    if (key === 'buildRoomsTitle') {
      setBuildRoomsTitle(newValue);
    } else if (key === 'cleaningServicesTitle') {
      setCleaningServicesTitle(newValue);
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${backendUrl}/api/portfolios/my-portfolio`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: newValue })
      });
      toast.success('Title updated!');
    } catch (err) {
      console.error('Failed to save title:', err);
      toast.error('Failed to save title');
    }
  };

  const fetchServices = async () => {
  if (!portfolioId) {
    console.log('No portfolio ID, skipping service fetch');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Fetch services from the portfolio
    const res = await axios.get(
      `${backendUrl}/api/portfolios/${portfolioId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    
    const portfolio = res.data.portfolio || res.data;
    setServices(portfolio.services || []);
    
    console.log('✅ Services fetched:', portfolio.services);
  } catch (err) {
    console.error('Failed to load services:', err);
    toast.error('Failed to load services');
  }
};
const fetchRoomPrices = async () => {
  if (!portfolioId) {
    // Use default prices for demo
    setRoomPrices({
      bedroom: 25,
      kitchen: 40,
      bathroom: 30,
      livingRoom: 35
    });
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `${backendUrl}/api/portfolios/${portfolioId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    
    const portfolio = res.data.portfolio || res.data;
    
    // Extract room prices from portfolio
    const prices = {};
    if (portfolio.roomPricing && portfolio.roomPricing.length > 0) {
      portfolio.roomPricing.forEach((room) => {
        prices[room.roomType || room.type] = parseFloat(room.price);
      });
    } else {
      // Default prices if none set
      prices.bedroom = 25;
      prices.kitchen = 40;
      prices.bathroom = 30;
      prices.livingRoom = 35;
    }
    
    setRoomPrices(prices);
  } catch (err) {
    console.error('Failed to load room prices:', err);
    // Keep default prices
    setRoomPrices({
      bedroom: 25,
      kitchen: 40,
      bathroom: 30,
      livingRoom: 35
    });
  }
};

  const startEditPrices = () => {
    if (!portfolioId) {
      toast.info('This is a demo. Sign up to create your own portfolio!');
      return;
    }
    setEditDraft({ ...roomPrices });
    setEditPricesMode(true);
  };
const saveEditedPrices = async () => {
  if (!portfolioId) {
    toast.info('This is a demo. Sign up to edit room prices!');
    setEditPricesMode(false);
    setEditDraft(null);
    return;
  }
  
  try {
    const draft = editDraft || {};
    const changed = Object.fromEntries(
      Object.entries(draft).filter(([k, v]) => v !== roomPrices[k])
    );
    
    if (Object.keys(changed).length === 0) {
      toast.info('No price changes');
      setEditPricesMode(false);
      setEditDraft(null);
      return;
    }
    
    // Convert to array format expected by backend
    const updatedRoomPricing = Object.entries({ ...roomPrices, ...changed }).map(
      ([roomType, price]) => ({
        roomType,
        price: Number(price)
      })
    );
    
    const token = localStorage.getItem('token');
    await axios.put(
      `${backendUrl}/api/portfolios/my-portfolio/room-pricing`,
      { roomPricing: updatedRoomPricing },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setRoomPrices((prev) => ({ ...prev, ...changed }));
    toast.success('Room prices updated');
    
    // Refetch to confirm
    fetchRoomPrices();
  } catch (err) {
    console.error('Failed to update room prices:', err);
    toast.error('Failed to update room prices');
  } finally {
    setEditPricesMode(false);
    setEditDraft(null);
  }
};

  const handleRoomChange = (type, count) => {
    setRoomCounts((prev) => ({
      ...prev,
      [type]: Math.min(3, Math.max(0, parseInt(count, 10) || 0)),
    }));
  };

  const calculateDraft = () => {
    const breakdown = Object.entries(roomCounts)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => {
        const unitPrice = roomPrices[type] ?? 25;
        return { type, count, unitPrice, subtotal: unitPrice * count };
      });

    const total = breakdown.reduce((sum, b) => sum + b.subtotal, 0);

    return {
      rooms: { ...roomCounts },
      roomPrices: { ...roomPrices },
      breakdown,
      total,
      createdAt: new Date().toISOString(),
    };
  };

  const handleGetQuote = () => {
    const draft = calculateDraft();
    setQuoteTotal(draft.total);
    localStorage.setItem('quoteDraft', JSON.stringify(draft));
    toast.success(`Rough Estimate: $${draft.total}`);
  };

const handleAddService = async () => {
  if (!portfolioId) {
    toast.info('This is a demo. Sign up to create your own portfolio!');
    return;
  }
  
  if (!title.trim() || !description.trim())
    return toast.error('Please fill all fields');
    
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Use the correct endpoint
    await axios.post(
      `${backendUrl}/api/portfolios/my-portfolio/services`,
      { title, description, price: '' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    toast.success('Service added');
    setTitle('');
    setDescription('');
    setShowForm(false);
    fetchServices();
  } catch (err) {
    console.error('Add service error:', err);
    toast.error(err?.response?.data?.message || 'Failed to add service');
  }
};

  const handleDeleteService = async (id) => {
  if (!isAdmin) {
    toast.error('Admin access only');
    return;
  }
  
  if (!portfolioId) {
    toast.info('This is a demo. Sign up to create your own portfolio!');
    return;
  }
  
  if (!window.confirm('Delete this service?')) return;
  
  try {
    const token = localStorage.getItem('token');
    
    // ✅ FIX: Change the URL to match the backend route
    await axios.delete(`${backendUrl}/api/portfolios/my-portfolio/services/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    toast.success('Service deleted');
    fetchServices();
  } catch (err) {
    console.error('Delete error:', err);
    toast.error(err?.response?.data?.message || 'Failed to delete service');
  }
};
  const roomInstances = useMemo(() => {
    const types = ['bedroom', 'bathroom', 'kitchen', 'livingRoom'];
    const instances = [];
    for (const type of types) {
      const n = Math.max(0, roomCounts[type] || 0);
      for (let i = 0; i < n; i++) instances.push({ type, i });
    }
    for (let i = instances.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [instances[i], instances[j]] = [instances[j], instances[i]];
    }
    const spacing = 60;
    const levelHeight = 85;
    const maxPerRow = 6;

    const N = instances.length;
    const firstRow = Math.min(N, maxPerRow);
    const secondRow = Math.max(0, N - firstRow);

    const start1 = -((firstRow - 1) * spacing) / 2;
    const start2 = -((secondRow - 1) * spacing) / 2;

    const laidOut = [];
    for (let i = 0; i < firstRow; i++) {
      const inst = instances[i];
      const x = start1 + i * spacing;
      laidOut.push({ ...inst, position: [x, 0, 0] });
    }
    for (let j = 0; j < secondRow; j++) {
      const inst = instances[firstRow + j];
      const x = start2 + j * spacing;
      laidOut.push({ ...inst, position: [x, levelHeight, 0] });
    }
    return laidOut;
  }, [roomCounts]);

  return (
    <div className="services-container">
      <div className="services-left">
        {isAdmin  && <div className="admin-chip">👑 Admin Mode</div>}
        
        {/* Show demo banner if no portfolioId */}
        {!portfolioId && (
          <div style={{
            padding: '1rem',
            background: '#3B82F6',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>
              📋 This is a demo. <strong>Sign up</strong> to create your own portfolio!
            </p>
          </div>
        )}

        {/* ROOM BUILDER */}
        <section className="room-builder card">
          <Editable
            type="text"
            value={buildRoomsTitle}
            onChange={(newValue) => handleTitleChange('buildRoomsTitle', newValue)}
            tag="h3"
            className="section-title buildRoomsTitle"
          />
          <div className="room-grid">
            {['bedroom', 'kitchen', 'bathroom', 'livingRoom'].map((room) => (
              <div className="room-control" key={room}>
                <Editable
                  type="text"
                  value={roomLabels[room]}
                  onChange={(newValue) => handleRoomLabelChange(room, newValue)}
                  tag="label"
                  className="room-label"
                />

                <select
                  id={`select-${room}`}
                  className="room-select"
                  value={roomCounts[room]}
                  onChange={(e) => handleRoomChange(room, e.target.value)}
                >
                  {[0, 1, 2, 3].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>

                {isAdmin  && editPricesMode && (
                  <input
                    type="number"
                    className="form-input price-editor-input"
                    placeholder="Price"
                    min={0}
                    step="1"
                    value={editDraft?.[room] ?? ''}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...(d || {}), [room]: Number(e.target.value) }))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="quote-actions">
            <button className="btn primary" onClick={handleGetQuote}>
              Get a Quote
            </button>

            {isAdmin  &&
              (editPricesMode ? (
                <button className="btn" onClick={saveEditedPrices}>
                  Done Editing Prices
                </button>
              ) : (
                <button className="btn" onClick={startEditPrices}>
                  Edit Room Prices
                </button>
              ))}

            {quoteTotal !== null && (
              <>
                <p className="quote-total">Estimate: ${quoteTotal}</p>
                <button className="btn" onClick={() => navigate(`${BASE}/charges`)}>
                  Go to Charges
                </button>
              </>
            )}
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="services-section card">
          <div className="services-header">
            <Editable
              type="text"
              value={cleaningServicesTitle}
              onChange={(newValue) => handleTitleChange('cleaningServicesTitle', newValue)}
              tag="h3"
              className="section-title cleaningServicesTitle"
            />
            {isAdmin  && (
              <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Cancel' : 'Add Service'}
              </button>
            )}
          </div>

          {isAdmin  && showForm && (
            <div className="add-service-form">
              <div className="form-group">
                <label>Service Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <button className="btn primary" onClick={handleAddService}>
                Submit
              </button>
            </div>
          )}

          <div className="service-grid">
            {services.map((service) => (
              <div
                key={service._id}
                className={`service-card ${isAdmin ? 'admin' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('.delete-btn')) return;
                  navigate(`${BASE}/charges`);
                }}
              >
                <h3>{service.title}</h3>
                <p>{service.description}</p>

                {isAdmin  && (
                  <button
                    className="delete-btn"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService(service._id);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT PANEL */}
      <div className="services-right">
        <div className="services-canvas-wrap">
          <Canvas camera={{ position: [0, 20, 40], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={1} />
            <Environment preset="city" />
            <OrbitControls />
            <Suspense fallback={null}>
              {roomInstances.map(({ type, position, i }, idx) => (
                <RoomModel key={`${type}-${i}-${idx}`} type={type} position={position} />
              ))}
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Services;