import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext.jsx';

const Editable = ({ 
  type, 
  value, 
  onChange, 
  options = [], 
  tag: Tag = 'div', 
  className = '',
  asBackground = false
}) => {
  const { isAdmin } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Update tempValue when value prop changes
  useEffect(() => {
    setTempValue(value);
    setPreviewUrl(null);
  }, [value]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:5000/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      if (type === 'image' && previewUrl) {
        // If we have a preview URL, it means a file was selected
        const fileInput = document.querySelector(`input[type="file"][data-editing="true"]`);
        const file = fileInput?.files?.[0];
        
        if (file) {
          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(file);
          onChange(cloudinaryUrl);
        } else {
          onChange(tempValue);
        }
      } else {
        onChange(tempValue);
      }
      
      setEditing(false);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTempValue(url);
    }
  };

  // Cleanup preview URL when component unmounts or editing changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isAdmin) {
    // Not admin: just show the value
    if (type === 'text') return <Tag className={className}>{value}</Tag>;
    if (type === 'image') {
      return asBackground ? null : (
        <img 
          src={value} 
          alt="" 
          className={className}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80";
          }}
        />
      );
    }
    if (type === 'layout') return null;
    return null;
  }

  // Admin: show edit UI
  return (
    <div className="editable relative">
      {editing ? (
        <div className={asBackground ? "bg-white p-3 rounded-lg shadow-lg min-w-64 z-50 relative" : "admin-controls"}>
          {type === 'text' && (
            <textarea
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-300 focus:outline-none resize-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={Math.min(3, (tempValue || '').split('\n').length || 1)}
              disabled={uploading}
            />
          )}
          
          {type === 'image' && (
            <div className="space-y-3">
              <img 
                src={previewUrl || tempValue} 
                alt="" 
                className={asBackground ? "w-20 h-20 object-cover rounded border border-gray-200" : "w-28 h-28 object-cover rounded border border-gray-200"}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className={`block w-full ${asBackground ? 'text-xs' : 'text-sm'}`}
                disabled={uploading}
                data-editing="true"
              />
              <input
                type="url"
                placeholder="Or paste image URL"
                value={previewUrl ? '' : tempValue}
                onChange={(e) => {
                  setTempValue(e.target.value);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                }}
                className={`w-full px-2 py-1 border border-gray-300 rounded ${asBackground ? 'text-xs' : 'text-sm'} focus:ring-1 focus:ring-blue-300 focus:outline-none`}
                disabled={uploading}
              />
            </div>
          )}
          
          {type === 'layout' && (
            <select
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-300 focus:outline-none"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              disabled={uploading}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          <div className={`flex gap-${asBackground ? '2' : '3'} mt-${asBackground ? '3' : '4'}`}>
            <button
                onClick={handleSave}
                disabled={uploading}
                className={asBackground 
                  ? `px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1`
                  : `admin-button disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1`
                }
            >
                {uploading && (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {uploading ? 'Uploading...' : 'Save'}
            </button>
            <button
                onClick={() => {
                  setTempValue(value);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                  setEditing(false);
                }}
                disabled={uploading}
                className={asBackground 
                  ? "px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  : "admin-button-secondary disabled:bg-gray-400 disabled:cursor-not-allowed"
                }
            >
                Cancel
            </button>
            </div>
        </div>
      ) : (
        <div className="group relative">
          {type === 'text' && (
            <div className="inline-block">
              <Tag className={className}>{value}</Tag>
              <button
                onClick={() => setEditing(true)}
                className="mt-3 text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                Edit
              </button>
            </div>
          )}
          
          {type === 'image' && (
            <div className="relative">
              {!asBackground && (
                <img 
                  src={value} 
                  alt="" 
                  className={className}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80";
                  }}
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className={asBackground 
                  ? `${className} opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800`
                  : "absolute top-2 left-2 text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                }
              >
                {asBackground ? 'Edit Image' : 'Edit'}
              </button>
            </div>
          )}

          {type === 'layout' && (
            <div className="p-3 bg-gray-50 rounded-md flex flex-col items-center text-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Layout:</span>
                <span className="text-gray-600">{value}</span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="mt-3 text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Editable;