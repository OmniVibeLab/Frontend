import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const ServerStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Checking server status...');
  const [lastCheck, setLastCheck] = useState(null);

  const checkServerStatus = async () => {
    setStatus('checking');
    setMessage('Checking server status...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://localhost:5000/api/test', {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setStatus('online');
        setMessage(`Server is running! ${data.message}`);
      } else {
        setStatus('error');
        setMessage(`Server responded with error: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus('offline');
        setMessage('Server connection timeout - Server is likely not running');
      } else if (error.message.includes('fetch')) {
        setStatus('offline');
        setMessage('Cannot connect to server - Server is not running on localhost:5000');
      } else {
        setStatus('error');
        setMessage(`Connection error: ${error.message}`);
      }
    }
    
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkServerStatus();
    // Check every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'offline':
        return <XCircle className="text-red-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'checking':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'offline':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'error':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium">Backend Server Status</h3>
            <p className="text-sm">{message}</p>
            {lastCheck && (
              <p className="text-xs opacity-75">Last checked: {lastCheck}</p>
            )}
          </div>
        </div>
        <button
          onClick={checkServerStatus}
          className="px-3 py-1 bg-white bg-opacity-50 rounded text-sm hover:bg-opacity-75 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {status === 'offline' && (
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded text-sm">
          <h4 className="font-medium mb-2">To start the server:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open a terminal/command prompt</li>
            <li>Navigate to: <code className="bg-black bg-opacity-20 px-1 rounded">d:\web apps\omnivibe\server</code></li>
            <li>Run: <code className="bg-black bg-opacity-20 px-1 rounded">npm run dev</code></li>
          </ol>
          <p className="mt-2 text-xs">Or double-click: <code>start-server.bat</code> in the server folder</p>
        </div>
      )}
    </div>
  );
};

export default ServerStatus;