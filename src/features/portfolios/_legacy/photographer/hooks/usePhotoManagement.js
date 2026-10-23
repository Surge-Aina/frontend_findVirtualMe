import { useState, useEffect } from 'react';
import { getOptional } from '@/shared/api/axiosAuth';
import { logApiError } from '@/shared/api/safeLog';
import {
  usePhotographerWrite,
  putPhotographerSetting,
  postPhotographerPhoto,
  putPhotographerPhoto,
  deletePhotographerPhoto,
  reorderPhotographerPhotos,
} from '../photographerApi';

export function usePhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const { portfolioId } = usePhotographerWrite();
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
      await putPhotographerPhoto(endpoint, photoToUpdate._id, updatedPhoto, portfolioId);
      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      setPhotos(newPhotos);
    } catch (err) {
      logApiError(err, 'Failed to update photo');
    }
  };

  const handleLayoutChange = async (newLayout) => {
    setLayoutType(newLayout);
    try {
      await putPhotographerSetting(`${endpoint}Layout`, newLayout, portfolioId);
    } catch (err) {
      logApiError(err, 'Failed to save layout setting');
    }
  };

  const handleLayoutSettingsChange = async (nextLayoutType, settings) => {
    const newLayoutSettings = {
      ...layoutSettings,
      [nextLayoutType]: settings,
    };
    setLayoutSettings(newLayoutSettings);
    try {
      await putPhotographerSetting(`${endpoint}LayoutSettings`, newLayoutSettings, portfolioId);
    } catch (err) {
      logApiError(err, 'Failed to save layout settings');
    }
  };

  const addPhoto = async () => {
    try {
      const res = await postPhotographerPhoto(endpoint, '/sample-placeholder.jpg', portfolioId);
      setPhotos([...photos, res.data]);
    } catch (err) {
      logApiError(err, 'Failed to add photo');
    }
  };

  const deletePhoto = async (index) => {
    const photoToDelete = photos[index];
    try {
      await deletePhotographerPhoto(endpoint, photoToDelete._id, portfolioId);
      setPhotos(photos.filter((_, i) => i !== index));
    } catch (err) {
      logApiError(err, 'Failed to delete photo');
    }
  };

  const movePhoto = async (index, direction) => {
    const newPhotos = [...photos];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

    [newPhotos[index], newPhotos[targetIndex]] = [
      newPhotos[targetIndex],
      newPhotos[index],
    ];
    const reordered = newPhotos.map((photo, position) => ({ ...photo, position }));
    setPhotos(reordered);
    try {
      await reorderPhotographerPhotos(endpoint, reordered, portfolioId);
    } catch (err) {
      logApiError(err, 'Failed to reorder photos');
    }
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
