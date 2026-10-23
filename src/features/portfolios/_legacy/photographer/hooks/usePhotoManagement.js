import { useState, useEffect } from 'react';
import axiosAuth, { getOptional } from '@/shared/api/axiosAuth';

export function usePhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const [layoutType, setLayoutType] = useState(initialLayoutType);
  const [photos, setPhotos] = useState([]);
  const [layoutSettings, setLayoutSettings] = useState({});

  useEffect(() => {
    async function fetchData() {
      const photosData = await getOptional(`/drive/${endpoint}`);
      if (Array.isArray(photosData)) setPhotos(photosData);

      const layoutData = await getOptional(`/settings/${endpoint}Layout`);
      if (layoutData?.value) setLayoutType(layoutData.value);

      const settingsData = await getOptional(`/settings/${endpoint}LayoutSettings`);
      if (settingsData?.value) setLayoutSettings(settingsData.value);
    }
    fetchData();
  }, [endpoint]);

  const handleImageChange = async (index, newUrl) => {
    const photoToUpdate = photos[index];
    const updatedPhoto = { ...photoToUpdate, url: newUrl };

    try {
      await axiosAuth.put(`/photo/${endpoint}/${photoToUpdate._id}`, updatedPhoto);

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
      await axiosAuth.put(`/settings/${endpoint}Layout`, { value: newLayout });
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
      await axiosAuth.put(`/settings/${endpoint}LayoutSettings`, { value: newLayoutSettings });
    } catch (err) {
      console.error('Failed to save layout settings', err);
    }
  };

  const addPhoto = async () => {
    try {
      const newPhoto = { url: '/sample-placeholder.jpg' };
      const res = await axiosAuth.post(`/photo/${endpoint}`, newPhoto);
      setPhotos([...photos, res.data]);
    } catch (err) {
      console.error('Failed to add photo', err);
    }
  };

  const deletePhoto = async (index) => {
    const photoToDelete = photos[index];
    try {
      console.log('Deleting photo:', photoToDelete);
      await axiosAuth.delete(`/photo/${endpoint}/${photoToDelete._id}`);
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
