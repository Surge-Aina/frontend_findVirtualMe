// client/src/pages/cleanServices.jsx
import React, { useEffect, useState, Suspense, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { RoomModel } from '../models/RoomModels';

const BASE = '/portfolios/cleaningService'; // ✅ add this

const Services = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const token = localStorage.getItem('token');
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchRoomPrices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/services', authHeaders);
      setServices(res.data);
    } catch {
      toast.error('Failed to load services');
    }
  };

  const fetchRoomPrices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/rooms', authHeaders);
      const prices = {};
      res.data.forEach((room) => {
        prices[room.type] = parseFloat(room.price);
      });
      setRoomPrices(prices);
    } catch {
      toast.error('Failed to load room prices');
    }
  };

  const startEditPrices = () => {
    setEditDraft({ ...roomPrices });
    setEditPricesMode(true);
  };

  const saveEditedPrices = async () => {
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
      await axios.put('http://localhost:5000/rooms', changed, authHeaders);
      setRoomPrices((prev) => ({ ...prev, ...changed }));
      toast.success('Room prices updated');
    } catch {
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
    // (you said this flow is fine—no redirect here)
  };

  const handleAddService = async () => {
    if (!title.trim() || !description.trim())
      return toast.error('Please fill all fields');
    try {
      await axios.post(
        'http://localhost:5000/services',
        { title, description, price: '' },
        authHeaders
      );
      toast.success('Service added');
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchServices();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`http://localhost:5000/services/${id}`, authHeaders);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
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
        {isAdmin && <div className="admin-chip">👑 Admin Mode</div>}

        {/* ROOM BUILDER */}
        <section className="room-builder card">
          <h3 className="section-title">Build Your Rooms</h3>

          <div className="room-grid">
            {['bedroom', 'kitchen', 'bathroom', 'livingRoom'].map((room) => (
              <div className="room-control" key={room}>
                <label className="room-label" htmlFor={`select-${room}`}>
                  {room.charAt(0).toUpperCase() + room.slice(1)}
                </label>

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

                {isAdmin && editPricesMode && (
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

            {isAdmin &&
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
                {/* ⬇️ FIX: absolute path into the sub-app */}
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
            <h2 className="section-title">Cleaning Services</h2>
            {isAdmin && (
              <button className="btn primary" onClick={() => setShowForm((s) => !s)}>
                {showForm ? 'Cancel' : 'Add Service'}
              </button>
            )}
          </div>

          {isAdmin && showForm && (
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
                  // ⬇️ FIX: absolute path into the sub-app
                  navigate(`${BASE}/charges`);
                }}
              >
                <h3>{service.title}</h3>
                <p>{service.description}</p>

                {isAdmin && (
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
