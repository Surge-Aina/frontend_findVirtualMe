
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VisitorData.css';

export default function VisitorsData() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({
    email: '',
    phone: '',
    loyaltyPoints: ''
  });
  const { portfolioId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is owner
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(`/portfolios/cleaningService/${portfolioId}/about`);
      return;
    }
    fetchVisitors();
  }, [portfolioId]);

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/guestAdminPanel/getAllUsers?portfolioId=${portfolioId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setVisitors(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch visitors');
      }
    } catch (err) {
      setError('Could not connect to server');
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (visitor) => {
    setEditingId(visitor._id);
    setEditedData({
      email: visitor.email || '',
      phone: visitor.phone || '',
      loyaltyPoints: visitor.loyaltyPoints || 0
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({
      email: '',
      phone: '',
      loyaltyPoints: ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async (visitorId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data to send (only changed fields)
      const updateData = {};
      if (editedData.email) updateData.email = editedData.email;
      if (editedData.phone) updateData.phone = editedData.phone;
      if (editedData.loyaltyPoints !== '') updateData.loyaltyPoints = parseInt(editedData.loyaltyPoints);

      const response = await fetch(`http://localhost:5000/guestAdminPanel/editUser/${visitorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the visitor in the local state with the returned data
        setVisitors(visitors.map(v => 
          v._id === visitorId ? data.data : v
        ));
        setEditingId(null);
        setEditedData({
          email: '',
          phone: '',
          loyaltyPoints: ''
        });
      } else {
        alert(data.message || 'Failed to update visitor information');
      }
    } catch (err) {
      console.error('Error updating visitor:', err);
      alert('Could not update visitor information');
    }
  };

  const handleBackToPortfolio = () => {
    navigate(`/portfolios/cleaningService/${portfolioId}/about`);
  };

  if (loading) {
    return (
      <div className="visitors-container">
        <div className="loading">Loading visitors data...</div>
      </div>
    );
  }

  return (
    <div className="visitors-container">
      <div className="visitors-header">
        <h1>Visitor's Data</h1>
        <p className="subtitle">View all visitors who signed up for your portfolio</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="table-container">
        <table className="visitors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Loyalty Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visitors.length > 0 ? (
              visitors.map((visitor, index) => (
                <tr key={visitor._id || index}>
                  <td>
                    <div className="cell-content">
                      <span className="icon">👤</span>
                      {visitor.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <span className="icon">✉️</span>
                      {editingId === visitor._id ? (
                        <input
                          type="email"
                          value={editedData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="edit-input"
                          placeholder="Email"
                        />
                      ) : (
                        visitor.email || 'N/A'
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <span className="icon">📱</span>
                      {editingId === visitor._id ? (
                        <input
                          type="tel"
                          value={editedData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="edit-input"
                          placeholder="Phone"
                        />
                      ) : (
                        visitor.phone || 'Not provided'
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <span className="icon">⭐</span>
                      {editingId === visitor._id ? (
                        <input
                          type="number"
                          value={editedData.loyaltyPoints}
                          onChange={(e) => handleInputChange('loyaltyPoints', e.target.value)}
                          className="edit-input points-input"
                          min="0"
                        />
                      ) : (
                        visitor.loyaltyPoints || 0
                      )}
                    </div>
                  </td>
                  <td>
                    {editingId === visitor._id ? (
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleSaveChanges(visitor._id)}
                          className="save-btn"
                        >
                          ✓ Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="cancel-btn"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(visitor)}
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No visitors yet. Share your portfolio link to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

          <div className="back-button-wrapper">
      <button className="back-button" onClick={handleBackToPortfolio}>
        ← Back to Portfolio
      </button>
    </div>
    </div>
  );
}