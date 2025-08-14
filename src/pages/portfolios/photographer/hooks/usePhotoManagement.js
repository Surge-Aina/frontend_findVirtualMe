import { useState, useEffect } from 'react';

export function usePhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const [layoutType, setLayoutType] = useState(initialLayoutType);
  const [photos, setPhotos] = useState([]);
  const [layoutSettings, setLayoutSettings] = useState({});

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch photos
        const photosRes = await fetch(`http://localhost:5000/drive/${endpoint}`);
        const photosData = await photosRes.json();
        setPhotos(photosData);

        // Fetch layout type
        const layoutRes = await fetch(`http://localhost:5000/settings/${endpoint}Layout`);
        if (layoutRes.ok) {
          const layoutData = await layoutRes.json();
          if (layoutData.value) {
            setLayoutType(layoutData.value);
          }
        }

        // Fetch layout settings
        const settingsRes = await fetch(`http://localhost:5000/settings/${endpoint}LayoutSettings`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.value) {
            setLayoutSettings(settingsData.value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    }
    fetchData();
  }, [endpoint]);

  // Photo management functions
  const handleImageChange = async (index, newUrl) => {
    const photoToUpdate = photos[index];
    const updatedPhoto = { ...photoToUpdate, url: newUrl };

    try {
      await fetch(`http://localhost:5000/photo/${endpoint}/${photoToUpdate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPhoto),
      });

      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      setPhotos(newPhotos);
    } catch (err) {
      console.error('Failed to update photo', err);
    }
  };

  const handleLayoutChange = async (newLayout) => {
    setLayoutType(newLayout);
    
    try {
      await fetch(`http://localhost:5000/settings/${endpoint}Layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newLayout }),
      });
    } catch (err) {
      console.error('Failed to save layout setting', err);
    }
  };

  const handleLayoutSettingsChange = async (layoutType, settings) => {
    const newLayoutSettings = {
      ...layoutSettings,
      [layoutType]: settings
    };
    setLayoutSettings(newLayoutSettings);
    
    try {
      await fetch(`http://localhost:5000/settings/${endpoint}LayoutSettings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newLayoutSettings }),
      });
    } catch (err) {
      console.error('Failed to save layout settings', err);
    }
  };

  const addPhoto = async () => {
    try {
      const newPhoto = { url: '/sample-placeholder.jpg' };
      const res = await fetch(`http://localhost:5000/photo/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto),
      });
      const savedPhoto = await res.json();
      setPhotos([...photos, savedPhoto]);
    } catch (err) {
      console.error('Failed to add photo', err);
    }
  };

  const deletePhoto = async (index) => {
    const photoToDelete = photos[index];
    try {
      console.log('Deleting photo:', photoToDelete);
      await fetch(`http://localhost:5000/photo/${endpoint}/${photoToDelete._id}`, {
        method: 'DELETE',
      });
      setPhotos(photos.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const movePhoto = (index, direction) => {
    const newPhotos = [...photos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

    [newPhotos[index], newPhotos[targetIndex]] = [
      newPhotos[targetIndex],
      newPhotos[index],
    ];
    setPhotos(newPhotos);
  };

  return {
    photos,
    layoutType,
    layoutSettings,
    handleImageChange,
    handleLayoutChange,
    handleLayoutSettingsChange,
    addPhoto,
    deletePhoto,
    movePhoto,
  };
} 