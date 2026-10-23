import { useEffect, useState } from 'react';
import Editable from './Editable';
import AdminDriveConnection from './AdminDriveConnection';
import axiosAuth, { authFailureMessage } from '@/shared/api/axiosAuth';
import { usePhotographerWrite } from '../photographerApi';

function OwnerDriveFolder({ endpoint, currentFolderId, onDriveConnected }) {
  const { portfolioId } = usePhotographerWrite();
  const [folderId, setFolderId] = useState(currentFolderId || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFolderId(currentFolderId || '');
  }, [currentFolderId]);

  const saveFolder = async () => {
    setSaving(true);
    setStatus('');
    try {
      await axiosAuth.put(
        `/settings/${endpoint}DriveFolderId`,
        { value: folderId.trim() || null, portfolioId },
        { skipAuthToast: true }
      );
      setStatus(folderId.trim() ? 'Folder id saved.' : 'Folder id cleared.');
      if (onDriveConnected) onDriveConnected(folderId.trim() || null);
    } catch (error) {
      setStatus(authFailureMessage(error) || 'Could not save the folder id.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-left">
      <label htmlFor="ownerFolderId" className="block text-sm text-gray-700">
        Google Drive folder id
      </label>
      <input
        id="ownerFolderId"
        value={folderId}
        onChange={(event) => setFolderId(event.target.value)}
        placeholder="Folder id"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <button
        type="button"
        onClick={saveFolder}
        disabled={saving}
        className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save folder id'}
      </button>
      {status && (
        <p role="status" className="text-sm text-gray-700">
          {status}
        </p>
      )}
    </div>
  );
}

export default function AdminGalleryControls({ 
  layoutType, 
  onLayoutChange, 
  onDriveConnected, 
  currentFolderId,
  endpoint,
  title = "Gallery Controls"
}) {
  const [activeTab, setActiveTab] = useState('layout'); // 'layout' or 'drive'
  const { platformAdmin } = usePhotographerWrite();

  return (
    <div className="flex justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
      <div className="group bg-white border border-gray-200 rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:border-gray-300 transition-all duration-700 hover:scale-105 max-w-2xl w-full">
        <h3 className="text-xl font-light text-gray-900 mb-6 text-center tracking-wide">{title}</h3>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-900 to-transparent mx-auto mb-6 group-hover:w-20 transition-all duration-300"></div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'layout'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Layout
            </button>
            <button
              onClick={() => setActiveTab('drive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'drive'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google Drive
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transform group-hover:scale-105 transition-transform duration-300">
          {activeTab === 'layout' ? (
            <div className="text-center">
              <p className="text-gray-600 font-light mb-6 text-sm leading-relaxed">
                Choose your preferred viewing style
              </p>
              <Editable
                type="layout"
                value={layoutType}
                onChange={onLayoutChange}
                options={['Grid', 'Mosaic', 'Scrapbook', 'Slideshow']}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 font-light text-sm leading-relaxed text-center">
                Connect to any Google Drive folder to display photos
              </p>
              {platformAdmin ? (
                <AdminDriveConnection
                  onDriveConnected={onDriveConnected}
                  currentFolderId={currentFolderId}
                  endpoint={endpoint}
                  compact={true}
                />
              ) : (
                <OwnerDriveFolder
                  endpoint={endpoint}
                  currentFolderId={currentFolderId}
                  onDriveConnected={onDriveConnected}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}