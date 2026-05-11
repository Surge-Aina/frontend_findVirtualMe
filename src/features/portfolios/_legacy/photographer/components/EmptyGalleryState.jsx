export default function EmptyGalleryState({ 
  currentFolderId, 
  error, 
  hasInitialized, 
  isLoading, 
  isAdmin = false,
  title = "No Photos Found",
  subtitle = "No photos available to display."
}) {
  if (isLoading || !hasInitialized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!hasInitialized ? "Loading photos..." : "Connecting to Google Drive..."}
          </p>
        </div>
      </div>
    );
  }

  if (error && hasInitialized) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Issue</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {isAdmin && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {currentFolderId 
                    ? "Try disconnecting and reconnecting to the Google Drive folder."
                    : "Use the Google Drive Connection above to connect to a folder."
                  }
                </p>
                {!currentFolderId && (
                  <p className="text-xs text-gray-400">
                    Make sure your Google Drive API credentials are properly configured.
                  </p>
                )}
              </div>
              {!currentFolderId && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Retry Connection
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">
          {currentFolderId 
            ? "No images found in the connected Google Drive folder. Make sure the folder contains image files."
            : subtitle
          }
        </p>
        {isAdmin && !currentFolderId && (
          <p className="text-sm text-gray-500">Use the Google Drive Connection above to connect to a folder.</p>
        )}
      </div>
    </div>
  );
}
