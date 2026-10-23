import React from 'react';

export default function Scrapbook({ photos, isAdmin = false, initialSettings = null, onSettingsChange = null }) {
    const [scrapbookSettings, setScrapbookSettings] = React.useState({
      density: initialSettings?.density || 90,
      rotationRange: initialSettings?.rotationRange || 15,
      maxImageSize: initialSettings?.maxImageSize || 200,
      maxPhotos: initialSettings?.maxPhotos || photos.length
    });

    // Update settings when initialSettings prop changes
    React.useEffect(() => {
      if (initialSettings) {
        setScrapbookSettings(prev => ({
          ...prev,
          ...initialSettings,
          maxPhotos: initialSettings.maxPhotos || photos.length
        }));
      }
    }, [initialSettings, photos.length]);

    const handleSettingChange = (setting, value) => {
      const newSettings = {
        ...scrapbookSettings,
        [setting]: value
      };
      setScrapbookSettings(newSettings);
      
      // Save to backend if callback is provided
      if (onSettingsChange) {
        onSettingsChange('Scrapbook', newSettings);
      }
    };

    const displayPhotos = photos.slice(0, scrapbookSettings.maxPhotos);

    return (
    <section className="mb-16">
      
      {isAdmin && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Density (%)</label>
              <input
                type="range"
                min="50"
                max="100"
                value={scrapbookSettings.density}
                onChange={(e) => handleSettingChange('density', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{scrapbookSettings.density}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rotation Range (°)</label>
              <input
                type="range"
                min="5"
                max="45"
                value={scrapbookSettings.rotationRange}
                onChange={(e) => handleSettingChange('rotationRange', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{scrapbookSettings.rotationRange}°</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Size (px)</label>
              <input
                type="range"
                min="100"
                max="300"
                value={scrapbookSettings.maxImageSize}
                onChange={(e) => handleSettingChange('maxImageSize', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{scrapbookSettings.maxImageSize}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Photos</label>
              <input
                type="range"
                min="1"
                max={photos.length}
                value={scrapbookSettings.maxPhotos}
                onChange={(e) => handleSettingChange('maxPhotos', parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{scrapbookSettings.maxPhotos}</span>
            </div>
          </div>
        </div>
      )}

      <div
        className="grid gap-4 auto-rows-[1fr] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          columnGap: `${(100 - scrapbookSettings.density) / 2}px`,
        }}
      >
        {displayPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative overflow-hidden rounded-xl shadow-md border border-gray-200 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            style={{
              transform: `rotate(${Math.random() * scrapbookSettings.rotationRange - scrapbookSettings.rotationRange / 2}deg)`,
              maxWidth: `${scrapbookSettings.maxImageSize}px`,
              margin: "0 auto"
            }}
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>

      <hr className="mt-8 border-gray-300" />
    </section>
  );
}