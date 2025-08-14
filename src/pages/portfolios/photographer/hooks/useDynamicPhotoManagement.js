import { useState, useEffect } from 'react';

export function useDynamicPhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const [layoutType, setLayoutType] = useState(initialLayoutType);
  const [photos, setPhotos] = useState([]);
  const [layoutSettings, setLayoutSettings] = useState({});
  
  const getStorageKey = () => `adminDriveFolderId_${endpoint}`;

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load from server first, fallback to localStorage
  useEffect(() => {
    if (!endpoint) return;

    // Fallback cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) {
        setCurrentFolderId(cached);
      }
    }

    // Server fetch
    fetch(`http://localhost:5000/settings/${endpoint}DriveFolderId`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.value) {
          setCurrentFolderId(data.value);
          localStorage.setItem(getStorageKey(), data.value);
        } else {
          setCurrentFolderId(null);
          localStorage.removeItem(getStorageKey());
        }
      })
      .catch(err => console.error('Failed to load folder ID from server', err));
  }, [endpoint]);

  // Keep localStorage in sync with state
  useEffect(() => {
    if (!endpoint) return;
    if (currentFolderId) {
      localStorage.setItem(getStorageKey(), currentFolderId);
    } else {
      localStorage.removeItem(getStorageKey());
    }
  }, [currentFolderId, endpoint]);

  // Fetch photos
  useEffect(() => {
    async function fetchData() {
      if (!endpoint) {
        setHasInitialized(true);
        return;
      }
      setError(null);
      
      if (!currentFolderId) {
        await fetchDefaultData();
        return;
      }

      setIsLoading(true);
      try {
        const photosRes = await fetch(`http://localhost:5000/drive/admin/${currentFolderId}`);
        if (photosRes.ok) {
          const photosData = await photosRes.json();
          setPhotos(photosData);
          setError(null);
        } else {
          setPhotos([]);
          setError('Failed to fetch photos from Google Drive');
        }
        await fetchLayoutData();
      } catch (err) {
        console.error('Failed to fetch admin data', err);
        setPhotos([]);
        setError('Network error while connecting to Google Drive');
      } finally {
        setIsLoading(false);
        setHasInitialized(true);
      }
    }
    fetchData();
  }, [currentFolderId, endpoint]);

  const fetchDefaultData = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    try {
      const photosRes = await fetch(`http://localhost:5000/drive/${endpoint}`);
      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData);
        setError(null);
      } else {
        setPhotos([]);
        setError('No Google Drive folder connected');
      }
      await fetchLayoutData();
    } catch {
      setPhotos([]);
      setError('No Google Drive folder connected');
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  };

  const fetchLayoutData = async () => {
    if (!endpoint) return;
    try {
      const layoutRes = await fetch(`http://localhost:5000/settings/${endpoint}Layout`);
      if (layoutRes.ok) {
        const layoutData = await layoutRes.json();
        if (layoutData.value) setLayoutType(layoutData.value);
      }
      const settingsRes = await fetch(`http://localhost:5000/settings/${endpoint}LayoutSettings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.value) setLayoutSettings(settingsData.value);
      }
    } catch (err) {
      console.error('Failed to fetch layout data', err);
    }
  };

  const handleAdminDriveConnected = (folderId) => {
    setCurrentFolderId(folderId || null);
  };

  // photo editing functions (unchanged)
  const handleImageChange = async (index, newUrl) => {
    const photoToUpdate = photos[index];
    const updatedPhoto = { ...photoToUpdate, url: newUrl };
    if (currentFolderId) {
      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      setPhotos(newPhotos);
      return;
    }
    await fetch(`http://localhost:5000/photo/${endpoint}/${photoToUpdate._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPhoto),
    });
    const newPhotos = [...photos];
    newPhotos[index] = updatedPhoto;
    setPhotos(newPhotos);
  };

  const handleLayoutChange = async (newLayout) => {
    setLayoutType(newLayout);
    if (!endpoint) return;
    await fetch(`http://localhost:5000/settings/${endpoint}Layout`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newLayout }),
    });
  };

  const handleLayoutSettingsChange = async (layoutType, settings) => {
    const newLayoutSettings = { ...layoutSettings, [layoutType]: settings };
    setLayoutSettings(newLayoutSettings);
    if (!endpoint) return;
    await fetch(`http://localhost:5000/settings/${endpoint}LayoutSettings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newLayoutSettings }),
    });
  };

  const addPhoto = async () => {
    if (currentFolderId) return;
    if (!endpoint) return;
    const newPhoto = { url: '/sample-placeholder.jpg' };
    const res = await fetch(`http://localhost:5000/photo/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPhoto),
    });
    const savedPhoto = await res.json();
    setPhotos([...photos, savedPhoto]);
  };

  const deletePhoto = async (index) => {
    if (currentFolderId) return;
    const photoToDelete = photos[index];
    if (!endpoint || !photoToDelete._id) return;
    await fetch(`http://localhost:5000/photo/${endpoint}/${photoToDelete._id}`, {
      method: 'DELETE',
    });
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const movePhoto = (index, direction) => {
    const newPhotos = [...photos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;
    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
    setPhotos(newPhotos);
  };

  return {
    photos,
    layoutType,
    layoutSettings,
    currentFolderId,
    isLoading,
    error,
    hasInitialized,
    handleImageChange,
    handleLayoutChange,
    handleLayoutSettingsChange,
    handleAdminDriveConnected,
    addPhoto,
    deletePhoto,
    movePhoto,
  };
}
