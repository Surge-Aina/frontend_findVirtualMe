import Grid from './layouts/Grid';
import Mosaic from './layouts/Mosaic';
import Scrapbook from './layouts/Scrapbook';
import Slideshow from './layouts/Slideshow';
import Editable from './Editable';
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export default function Layout({ 
  layoutType, 
  photos, 
  renderPhoto,
  onPhotoChange,
  onPhotoDelete,
  onPhotoMove,
  showAdminControls = false,
  layoutSettings = null,
  onLayoutSettingsChange = null
}) {
  const { isAdmin } = useContext(AuthContext);
  const isAdminUser = isAdmin || localStorage.getItem("isAdmin") === "true";

  // Create a default render function that includes Editable functionality
  const defaultRenderPhoto = (photo, index) => {
    const baseElement = (
      <img
        src={photo.url}
        alt=""
        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
      />
    );

    // If admin controls are enabled and user is admin, wrap with Editable
    if (showAdminControls && isAdminUser && onPhotoChange) {
      return (
        <div className="relative group">
          <Editable
            type="image"
            value={photo.url}
            onChange={(newUrl) => onPhotoChange(index, newUrl)}
            className="w-full h-full object-cover"
          />
          
          {/* Admin Controls */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
            {onPhotoMove && (
              <>
                <button
                  onClick={() => onPhotoMove(index, -1)}
                  className="bg-white bg-opacity-80 px-2 text-xs rounded hover:bg-black hover:text-white"
                >
                  ↑
                </button>
                <button
                  onClick={() => onPhotoMove(index, 1)}
                  className="bg-white bg-opacity-80 px-2 text-xs rounded hover:bg-black hover:text-white"
                >
                  ↓
                </button>
              </>
            )}
            {onPhotoDelete && (
              <button
                onClick={() => onPhotoDelete(index)}
                className="bg-black text-white text-xs px-2 py-1 rounded hover:bg-gray-800"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      );
    }

    // If custom render function is provided, use it
    if (renderPhoto) {
      return renderPhoto(photo, index);
    }

    // Default rendering
    return baseElement;
  };

  const layoutProps = {
    photos,
    renderPhoto: defaultRenderPhoto,
    isAdmin: isAdminUser,
    initialSettings: layoutSettings?.[layoutType] || null,
    onSettingsChange: onLayoutSettingsChange
  };

  if (layoutType == 'Grid') return <Grid {...layoutProps} />;
  if (layoutType == 'Mosaic') return <Mosaic {...layoutProps} />;
  if (layoutType == 'Scrapbook') return <Scrapbook {...layoutProps} />;
  if (layoutType == 'Slideshow') return <Slideshow {...layoutProps} />;
  return null;
}