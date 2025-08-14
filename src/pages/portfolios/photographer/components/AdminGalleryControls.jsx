import { useState } from 'react';
import Editable from './Editable';
import AdminDriveConnection from './AdminDriveConnection';

export default function AdminGalleryControls({ 
  layoutType, 
  onLayoutChange, 
  onDriveConnected, 
  currentFolderId,
  endpoint,
  title = "Gallery Controls"
}) {
  const [activeTab, setActiveTab] = useState('layout'); // 'layout' or 'drive'

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
              <AdminDriveConnection 
                onDriveConnected={onDriveConnected}
                currentFolderId={currentFolderId}
                endpoint={endpoint}
                compact={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}