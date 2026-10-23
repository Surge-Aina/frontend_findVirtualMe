import { useState, useEffect } from 'react';
import axiosAuth, { authFailureMessage, getOptional } from '@/shared/api/axiosAuth';
import { logApiError } from '@/shared/api/safeLog';
import {
  usePhotographerWrite,
  putPhotographerSetting,
  postPhotographerPhoto,
  putPhotographerPhoto,
  deletePhotographerPhoto,
  reorderPhotographerPhotos,
} from '../photographerApi';

function driveErrorMessage(err, fallback) {
  return authFailureMessage(err) || fallback;
}

export function useDynamicPhotoManagement(endpoint, initialLayoutType = 'Mosaic') {
  const { portfolioId, platformAdmin } = usePhotographerWrite();
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

      if (platformAdmin && currentFolderId) {
        setIsLoading(true);
        try {
          const photosRes = await axiosAuth.get(`/drive/admin/${currentFolderId}`, {
            skipAuthToast: true,
          });
          setPhotos(photosRes.data);
          setError(null);
          await fetchLayoutData();
        } catch (err) {
          logApiError(err, 'Failed to fetch admin data');
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
        return;
      }

      await fetchPublicPhotos();
    }
    fetchData();
  }, [currentFolderId, endpoint, platformAdmin]);

  const fetchPublicPhotos = async () => {
    if (!endpoint) return;
    setIsLoading(true);
    try {
      const photosRes = await axiosAuth.get(`/drive/${endpoint}`, { skipAuthToast: true });
      setPhotos(Array.isArray(photosRes.data) ? photosRes.data : []);
      setError(null);
    } catch (err) {
      setPhotos([]);
      setError(driveErrorMessage(err, 'No Google Drive folder connected'));
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
    if (currentFolderId && platformAdmin) {
      const newPhotos = [...photos];
      newPhotos[index] = updatedPhoto;
      setPhotos(newPhotos);
      return;
    }
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
    if (!endpoint) return;
    try {
      await putPhotographerSetting(`${endpoint}Layout`, newLayout, portfolioId);
    } catch (err) {
      logApiError(err, 'Failed to save layout setting');
    }
  };

  const handleLayoutSettingsChange = async (nextLayoutType, settings) => {
    const newLayoutSettings = { ...layoutSettings, [nextLayoutType]: settings };
    setLayoutSettings(newLayoutSettings);
    if (!endpoint) return;
    try {
      await putPhotographerSetting(`${endpoint}LayoutSettings`, newLayoutSettings, portfolioId);
    } catch (err) {
      logApiError(err, 'Failed to save layout settings');
    }
  };

  const addPhoto = async () => {
    if (currentFolderId && platformAdmin) return;
    if (!endpoint) return;
    try {
      const res = await postPhotographerPhoto(endpoint, '/sample-placeholder.jpg', portfolioId);
      setPhotos([...photos, res.data]);
    } catch (err) {
      logApiError(err, 'Failed to add photo');
    }
  };

  const deletePhoto = async (index) => {
    if (currentFolderId && platformAdmin) return;
    const photoToDelete = photos[index];
    if (!endpoint || !photoToDelete?._id) return;
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
    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
    const reordered = newPhotos.map((photo, position) => ({ ...photo, position }));
    setPhotos(reordered);
    if (!endpoint) return;
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
