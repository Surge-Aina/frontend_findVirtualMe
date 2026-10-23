import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';

export default function PortfolioEditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    type: 'all', // 'all', 'userId', 'portfolioID', 'sessionId'
    value: ''
  });
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/api/portfolios/edit-log?page=${page}&limit=50`;
      
      // Apply filter if provided
      if (filter.type === 'userId' && filter.value) {
        url = `${API_URL}/api/portfolios/edit-log/user/${filter.value}`;
      } else if (filter.type === 'portfolioID' && filter.value) {
        url = `${API_URL}/api/portfolios/edit-log/portfolio/${filter.value}`;
      } else if (filter.type === 'sessionId' && filter.value) {
        url = `${API_URL}/api/portfolios/edit-log/session/${filter.value}`;
      }

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(url, { headers });
      
      if (response.data.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Portfolio Edit Logs</h1>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Type
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value, value: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Logs</option>
                <option value="userId">By User ID</option>
                <option value="portfolioID">By Portfolio ID</option>
                <option value="sessionId">By Session ID</option>
              </select>
            </div>
            
            {filter.type !== 'all' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.type === 'userId' ? 'User ID' : 
                   filter.type === 'portfolioID' ? 'Portfolio ID' : 'Session ID'}
                </label>
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                  placeholder={`Enter ${filter.type}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              onClick={() => {
                setFilter({ type: 'all', value: '' });
                setPage(1);
                fetchLogs();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No logs found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Portfolio Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mouse Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{log.name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{log.email || log.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.portfolioType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                            {log.sessionId || 'N/A'}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.mouseInfo?.length || 0} events
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedLog === log._id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expanded Log Details */}
            {expandedLog && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                {(() => {
                  const log = logs.find(l => l._id === expandedLog);
                  if (!log) return null;
                  return (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Log Details</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Portfolio ID</label>
                          <p className="text-sm text-gray-900">{log.portfolioID || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">User ID</label>
                          <p className="text-sm text-gray-900">{log.userId}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900">{log.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Timestamp</label>
                          <p className="text-sm text-gray-900">{formatDate(log.timestamp)}</p>
                        </div>
                      </div>
                      
                      {log.mouseInfo && log.mouseInfo.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Mouse Events ({log.mouseInfo.length})
                          </label>
                          <div className="max-h-64 overflow-y-auto border rounded p-2">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr>
                                  <th className="px-2 py-1 text-center align-top">Time</th>
                                  <th className="px-2 py-1 text-center align-top">Event</th>
                                  <th className="px-2 py-1 text-center align-top">Position</th>
                                  <th className="px-2 py-1 text-center align-top">Element</th>
                                </tr>
                              </thead>
                              <tbody>
                                {log.mouseInfo.slice(0, 100).map((event, idx) => {
                                  // Get the part before the first dot
                                  const getElementBeforeFirstDot = (element) => {
                                    if (!element) return 'N/A';
                                    const firstDotIndex = element.indexOf('.');
                                    return firstDotIndex !== -1 ? element.substring(0, firstDotIndex) : element;
                                  };
                                  return (
                                    <tr key={idx} className="border-t">
                                      <td className="px-2 py-1 align-top">{formatDate(event.timestamp)}</td>
                                      <td className="px-2 py-1 align-top">{event.event}</td>
                                      <td className="px-2 py-1 align-top">({event.x}, {event.y})</td>
                                      <td className="px-2 py-1 text-gray-600 align-top">{getElementBeforeFirstDot(event.element)}</td>
                                    </tr>
                                  );
                                })}
                                {log.mouseInfo.length > 100 && (
                                  <tr>
                                    <td colSpan="4" className="px-2 py-1 text-center text-gray-500">
                                      ... and {log.mouseInfo.length - 100} more events
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Pagination */}
            {filter.type === 'all' && totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

