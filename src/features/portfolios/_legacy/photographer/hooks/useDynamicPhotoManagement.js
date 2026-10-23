import { useState, useEffect } from 'react';
import axiosAuth, { authFailureMessage, getOptional } from '@/shared/api/axiosAuth';

function driveErrorMessage(err, fallback) {
  return authFailureMessage(err) || fallback;
}

export function useDynamicPhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const [layoutType, setLayoutType] = useState(initialLayoutType);
  const [photos, setPhotos] = useState([]);
  const [layoutSettings, setLayoutSettings] = useState({});

  const getStorageKey = () => `adminDriveFolderId_${endpoint}`;

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!endpoint) return;

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(getStorageKey());
      if (cached) {
        setCurrentFolderId(cached);
      }
    }

    getOptional(`/settings/${endpoint}DriveFolderId`).then((data) => {
      if (data?.value) {
        setCurrentFolderId(data.value);
        localStorage.setItem(getStorageKey(), data.value);
      }
    });
  }, [endpoint]);

  useEffect(() => {
    if (!endpoint) return;
    if (currentFolderId) {
      localStorage.setItem(getStorageKey(), currentFolderId);
    } else {
      localStorage.removeItem(getStorageKey());
    }
  }, [currentFolderId, endpoint]);

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
        const photosRes = await axiosAuth.get(`/drive/admin/${currentFolderId}`, {
          skipAuthToast: true,
        });
        setPhotos(photosRes.data);
        setError(null);
        await fetchLayoutData();
      } catch (err) {
        console.error('Failed to fetch admin data', err);
        setPhotos([]);
        setError(
          driveErrorMessage(
            err,
            err.response
              ? 'Failed to fetch photos from Google Drive'
              : 'Network error while connecting to Google Drive'
          )
        );
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

    const cachedFolderId = localStorage.getItem(getStorageKey());

    if (cachedFolderId) {
      try {
        const photosRes = await axiosAuth.get(`/drive/admin/${cachedFolderId}`, {
          skipAuthToast: true,
        });
        setPhotos(photosRes.data);
        setError(null);
        setCurrentFolderId(cachedFolderId);
      } catch (err) {
        setPhotos([]);
        setError(driveErrorMessage(err, 'No Google Drive folder connected'));
        setCurrentFolderId(null);
      }
    } else {
      try {
        const photosRes = await axiosAuth.get(`/drive/${endpoint}`, { skipAuthToast: true });
        setPhotos(photosRes.data);
        setError(null);
      } catch (err) {
        setPhotos([]);
        setError(driveErrorMessage(err, 'No Google Drive folder connected'));
      }
    }

    await fetchLayoutData();
    setIsLoading(false);
    setHasInitialized(true);
  };

  const fetchLayoutData = async () => {
    if (!endpoint) return;
    const layoutData = await getOptional(`/settings/${endpoint}Layout`);
    if (layoutData?.value) setLayoutType(layoutData.value);
    const settingsData = await getOptional(`/settings/${endpoint}LayoutSettings`);
    if (settingsData?.value) setLayoutSettings(settingsData.value);
  };

  const handleAdminDriveConnected = (folderId) => {
    setCurrentFolderId(folderId || null);
  };

  const handleImageChange = async (index, newUrl) => {
    const photoToUpdate = photos[index];
    const updatedPhoto = { ...photoToUpdate, url: newUrl };
    if (currentFolderId) {
      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      setPhotos(newPhotos);
      return;
    }
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
    if (!endpoint) return;
    try {
      await axiosAuth.put(`/settings/${endpoint}Layout`, { value: newLayout });
    } catch (err) {
      console.error('Failed to save layout setting', err);
    }
  };

  const handleLayoutSettingsChange = async (layoutType, settings) => {
    const newLayoutSettings = { ...layoutSettings, [layoutType]: settings };
    setLayoutSettings(newLayoutSettings);
    if (!endpoint) return;
    try {
      await axiosAuth.put(`/settings/${endpoint}LayoutSettings`, { value: newLayoutSettings });
    } catch (err) {
      console.error('Failed to save layout settings', err);
    }
  };

  const addPhoto = async () => {
    if (currentFolderId) return;
    if (!endpoint) return;
    try {
      const newPhoto = { url: '/sample-placeholder.jpg' };
      const res = await axiosAuth.post(`/photo/${endpoint}`, newPhoto);
      setPhotos([...photos, res.data]);
    } catch (err) {
      console.error('Failed to add photo', err);
    }
  };

  const deletePhoto = async (index) => {
    if (currentFolderId) return;
    const photoToDelete = photos[index];
    if (!endpoint || !photoToDelete._id) return;
    try {
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
