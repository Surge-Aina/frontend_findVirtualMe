import { useState, useEffect } from 'react';

export default function AdminDriveConnection({ onDriveConnected, currentFolderId, compact = false, endpoint }) {
  const getStorageKey = () => `adminDriveFolderId_${endpoint}`;
  
  const [folderId, setFolderId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Load from server first, fallback to localStorage for instant UI
  useEffect(() => {
    if (!endpoint) return;

    // Instant load from cache
    if (typeof window !== 'undefined') {
      const cachedFolderId = localStorage.getItem(getStorageKey());
      if (cachedFolderId) {
        setFolderId(cachedFolderId);
        if (!currentFolderId && onDriveConnected) {
          onDriveConnected(cachedFolderId);
        }
      }
    }

    // Fetch from server for latest data
    fetch(`http://localhost:5000/settings/${endpoint}DriveFolderId`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.value) {
          setFolderId(data.value);
          localStorage.setItem(getStorageKey(), data.value);
          if (!currentFolderId && onDriveConnected) {
            onDriveConnected(data.value);
          }
        }
      })
      .catch(err => console.error('Failed to load Drive folder ID from server', err));
  }, [endpoint, currentFolderId, onDriveConnected]);

    // Update local state when currentFolderId changes
    useEffect(() => {
      if (currentFolderId !== undefined) {
        setFolderId(currentFolderId || '');
      }
    }, [currentFolderId]);

    const handleConnect = async () => {
    if (!folderId.trim()) {
      setConnectionStatus('Please enter a folder ID');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Connecting to Google Drive...');
    setTestResults(null);

    try {
      const testResponse = await fetch(`http://localhost:5000/drive/test/${folderId.trim()}`);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        setTestResults(testData);
        setConnectionStatus('Connection successful!');

        // Save to server
        await fetch(`http://localhost:5000/settings/${endpoint}DriveFolderId`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: folderId.trim() }),
        });

        // Save to cache
        localStorage.setItem(getStorageKey(), folderId.trim());

        // Notify parent
        if (onDriveConnected) {
          onDriveConnected(folderId.trim());
        }
      } else {
        const errorData = await testResponse.json();
        const errorMessage = errorData.error || 'Unknown error';
        const errorDetails = errorData.details ? ` (${errorData.details})` : '';
        setConnectionStatus(`Connection failed: ${errorMessage}${errorDetails}`);
        setTestResults(null);

        if (onDriveConnected) {
          onDriveConnected(null);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('Connection failed: Network error.');
      setTestResults(null);

      if (onDriveConnected) {
        onDriveConnected(null);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    // Clear server value
    await fetch(`http://localhost:5000/settings/${endpoint}DriveFolderId`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: null }),
    });

    // Clear cache
    localStorage.removeItem(getStorageKey());
    setFolderId('');
    setConnectionStatus('');
    setTestResults(null);

    if (onDriveConnected) {
      onDriveConnected(null);
    }
  };

  const handleClearStatus = () => {
    setConnectionStatus('');
    setTestResults(null);
  };

  return (
    <div className={`group bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-2xl hover:border-gray-200 transition-all duration-700 backdrop-blur-sm ${
      compact ? 'p-6' : 'p-12'
    }`}>
      {!compact && (
        <>
          <h3 className="text-3xl font-extralight text-gray-900 mb-8 text-center tracking-wider">Google Drive Connection</h3>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-900 to-transparent mx-auto mb-8 group-hover:w-32 transition-all duration-500"></div>
          
          <p className="text-gray-600 font-light mb-10 text-center text-lg leading-relaxed max-w-sm mx-auto">
            Connect to any Google Drive folder to display photos from that location
          </p>
        </>
      )}

      {/* Gallery Identifier */}
      {endpoint && compact && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-700 capitalize">Gallery: {endpoint}</p>
        </div>
      )}

      {/* Current Connection Status */}
      {currentFolderId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Currently Connected</p>
              <p className="text-xs text-blue-700 mt-1">Folder ID: {currentFolderId}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Folder ID Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="folderId" className="block text-sm font-medium text-gray-700">
              Google Drive Folder ID
            </label>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {showHelp ? 'Hide Help' : 'How to find Folder ID?'}
            </button>
          </div>
          <input
            type="text"
            id="folderId"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            placeholder="Enter Google Drive folder ID..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isConnecting}
          />
          
          {/* Help Section */}
          {showHelp && (
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
              <h4 className="font-medium mb-2">How to find your Google Drive Folder ID:</h4>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Open Google Drive in your browser</li>
                <li>Navigate to the folder you want to connect</li>
                <li>Click on the folder to open it</li>
                <li>Look at the URL in your browser's address bar</li>
                <li>The folder ID is the long string after <code className="bg-gray-200 px-1 rounded">/folders/</code></li>
                <li>Example: <code className="bg-gray-200 px-1 rounded">https://drive.google.com/drive/folders/123456789</code></li>
                <li>Copy the ID: <code className="bg-gray-200 px-1 rounded">123456789</code></li>
              </ol>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <strong>Note:</strong> Make sure the folder contains image files and you have permission to access it.
              </div>
            </div>
          )}
        </div>

        {/* Connection Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleConnect}
            disabled={isConnecting || !folderId.trim()}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
          
          {currentFolderId && (
            <button
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Disconnect
            </button>
            )}
        </div>

        {/* Status Messages */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg ${
            connectionStatus.includes('successful') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : connectionStatus.includes('failed') 
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <div className="flex justify-between items-start">
              <p className="text-sm">{connectionStatus}</p>
              <button
                onClick={handleClearStatus}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Connection Test Results</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Folder Name: {testResults.folderName || 'Unknown'}</p>
              <p>• Images Found: {testResults.imageCount || 0}</p>
              <p>• Folder ID: {testResults.folderId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}