import React from 'react';

export default function Grid({ photos, columns = 3, gap = 4, renderPhoto, isAdmin = false, initialSettings = null, onSettingsChange = null }) {
    const [layoutSettings, setLayoutSettings] = React.useState({
      columns: initialSettings?.columns || columns,
      gap: initialSettings?.gap || gap,
      maxPhotos: initialSettings?.maxPhotos || photos.length,
      aspectRatio: initialSettings?.aspectRatio || 'auto'
    });

    // Update settings when initialSettings prop changes
    React.useEffect(() => {
      if (initialSettings) {
        setLayoutSettings(prev => ({
          ...prev,
          ...initialSettings,
          maxPhotos: initialSettings.maxPhotos || photos.length
        }));
      }
    }, [initialSettings, photos.length]);

    const handleSettingChange = (setting, value) => {
      const newSettings = {
        ...layoutSettings,
        [setting]: value
      };
      setLayoutSettings(newSettings);
      
      // Save to backend if callback is provided
      if (onSettingsChange) {
        onSettingsChange('Grid', newSettings);
      }
    };

    const getImageClass = (aspectRatio) => {
      switch (aspectRatio) {
        case 'square':
          return 'aspect-square';
        case 'portrait':
          return 'aspect-[3/4]';
        case 'landscape':
          return 'aspect-[4/3]';
        default:
          return 'aspect-auto';
      }
    };

    const displayPhotos = photos.slice(0, layoutSettings.maxPhotos);

    return (
      <section className="mb-16">
        
        {/* Layout Controls - Only show for admins */}
        {isAdmin && (
          <div className="admin-controls">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={layoutSettings.columns}
                  onChange={(e) => handleSettingChange('columns', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500 mt-1 block">{layoutSettings.columns}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gap (px)</label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={layoutSettings.gap}
                  onChange={(e) => handleSettingChange('gap', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500 mt-1 block">{layoutSettings.gap * 4}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Photos</label>
                <input
                  type="range"
                  min="1"
                  max={photos.length}
                  value={layoutSettings.maxPhotos}
                  onChange={(e) => handleSettingChange('maxPhotos', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500 mt-1 block">{layoutSettings.maxPhotos}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                <select
                  value={layoutSettings.aspectRatio}
                  onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-md focus:border-gray-400 focus:outline-none"
                >
                  <option value="auto">Auto</option>
                  <option value="square">Square</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Grid Display */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${layoutSettings.columns}, minmax(0, 1fr))`,
            gap: `${layoutSettings.gap * 4}px`
          }}
        >
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`
                photo-container
                ${getImageClass(layoutSettings.aspectRatio)}
              `}
            >
              {renderPhoto ? renderPhoto(photo, index) : (
                <img
                  src={photo.url}
                  alt=""
                  className={`
                    w-full h-full object-cover transition-transform duration-300 hover:scale-105
                    ${layoutSettings.aspectRatio === 'auto' ? 'object-contain' : 'object-cover'}
                  `}
                />
              )}       
            </div>
          ))}
        </div>

        {/* Grid Info - Only show for admins */}
        {isAdmin && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Showing {displayPhotos.length} photos in {layoutSettings.columns} columns 
              with {layoutSettings.gap * 4}px gaps
            </p>
            {displayPhotos.length % layoutSettings.columns !== 0 && (
              <p className="text-black-600 mt-1">
                Last row has {displayPhotos.length % layoutSettings.columns} photos
              </p>
            )}
          </div>
        )}
        
        <hr className="mt-12 border-gray-100" />
      </section>
    );
}