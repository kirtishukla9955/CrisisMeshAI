import React, { useState, useEffect } from 'react';
import ReportForm from './components/ReportForm';
import { getPendingReports, deleteReport, getPendingCount } from './services/db';
import { AlertCircle, WifiOff, Wifi } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/reports';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineReports();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync attempt if online on load
    if (navigator.onLine) {
      syncOfflineReports();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  };

  const syncOfflineReports = async () => {
    if (syncing) return;
    setSyncing(true);
    
    try {
      const reports = await getPendingReports();
      if (reports.length === 0) {
        setSyncing(false);
        return;
      }

      for (const item of reports) {
        const formData = new FormData();
        
        // Append all report data
        Object.keys(item.reportData).forEach(key => {
          if (item.reportData[key] !== null && item.reportData[key] !== undefined) {
             if (typeof item.reportData[key] === 'object') {
                 formData.append(key, JSON.stringify(item.reportData[key]));
             } else {
                 formData.append(key, item.reportData[key]);
             }
          }
        });

        // Append files
        if (item.files && item.files.length > 0) {
          item.files.forEach(fileObj => {
            formData.append('media', fileObj.blob, fileObj.name || 'offline_media');
          });
        }

        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            await deleteReport(item.offlineId);
          } else {
            console.error('Failed to sync report', item.offlineId);
          }
        } catch (err) {
          console.error('Network error during sync', err);
          // Stop syncing rest if network fails
          break;
        }
      }
      
      await updatePendingCount();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">CrisisMesh AI</h1>
        <div className="flex items-center space-x-3">
          {pendingCount > 0 && (
            <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {pendingCount} to sync
            </span>
          )}
          {isOnline ? (
            <Wifi size={20} className="text-green-500" />
          ) : (
            <WifiOff size={20} className="text-red-500" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md p-4 pb-20">
        <ReportForm 
          isOnline={isOnline} 
          onSaveOffline={updatePendingCount} 
        />
      </main>
    </div>
  );
}

export default App;
