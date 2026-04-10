import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function VisitorProfile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const { portfolioId } = useParams();

  useEffect(() => {
    // Load visitor data from localStorage
    const visitor = JSON.parse(localStorage.getItem('visitor'));
    
    if (!visitor) {
      // Not logged in, redirect to login
      if (portfolioId) {
        navigate(`/portfolios/cleaningService/${portfolioId}/visitor-login`);
      } else {
        navigate('/portfolios/cleaningService/visitor-login');
      }
      return;
    }

    setName(visitor.name || '');
    setEmail(visitor.email || '');
    setPhone(visitor.phone || '');
  }, [navigate, portfolioId]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('visitorToken');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/guestUser/editProfile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,

        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        const updatedVisitor = { name, email, phone };
        localStorage.setItem('visitor', JSON.stringify(updatedVisitor));
        
        // Trigger navbar update
        window.dispatchEvent(new Event('visitor-auth-change'));
        
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        console.log('Success:', data);
      } else {
        setMessage('Error: ' + data.message);
        console.log('Error:', data);
      }
    } catch (error) {
      setMessage('Error: Could not connect to server');
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('visitorToken');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API}/guestUser/deleteProfile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('visitor');
        localStorage.removeItem('visitorToken');
        
        // Trigger navbar update
        window.dispatchEvent(new Event('visitor-auth-change'));
        
        setMessage('Account deleted successfully!');
        console.log('Success:', data);
        
        // Redirect to home
        setTimeout(() => {
          if (portfolioId) {
            navigate(`/portfolios/cleaningService/${portfolioId}/about`);
          } else {
            navigate('/portfolios/cleaningService/about');
          }
        }, 1500);
      } else {
        setMessage('Error: ' + data.message);
        console.log('Error:', data);
      }
    } catch (error) {
      setMessage('Error: Could not connect to server');
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('visitor');
    localStorage.removeItem('visitorToken');
    
    // Trigger navbar update
    window.dispatchEvent(new Event('visitor-auth-change'));
    
    if (portfolioId) {
      navigate(`/portfolios/cleaningService/${portfolioId}/about`);
    } else {
      navigate('/portfolios/cleaningService/about');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Profile</h1>
        
        {message && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '5px',
            background: message.includes('Error') ? '#fee' : '#dfd',
            color: message.includes('Error') ? '#c33' : '#363',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              background: isEditing ? 'white' : '#f5f5f5'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              background: isEditing ? 'white' : '#f5f5f5'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!isEditing}
            placeholder="Add phone number"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              background: isEditing ? 'white' : '#f5f5f5'
            }}
          />
        </div>

        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button 
              onClick={handleSave}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Cancel
            </button>
          </>
        )}

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Logout
        </button>

        <button 
          onClick={handleDelete}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#ccc' : '#343a40',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div>
    </div>
  );
}