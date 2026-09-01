import React, { useState, useEffect } from 'react';
import { getPendingCount } from './services/db';
import { Globe, Wifi, WifiOff } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import ReportScreen from './components/ReportScreen';

const API_URL = 'http://localhost:5000/api/reports'; // Adjust for prod

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  
  // 'home' | 'report'
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updatePendingCount = async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  };

  const syncOfflineReports = async () => {
    try {
      const { getPendingReports, deleteReport } = await import('./services/db');
      const reports = await getPendingReports();
      if (reports.length === 0) return;

      for (const item of reports) {
        const formData = new FormData();
        Object.keys(item.reportData).forEach(key => {
          if (item.reportData[key] !== null && item.reportData[key] !== undefined) {
             formData.append(key, typeof item.reportData[key] === 'object' ? JSON.stringify(item.reportData[key]) : item.reportData[key]);
          }
        });

        if (item.files) {
          item.files.forEach(f => formData.append('media', f.blob, f.name || "offline_media"));
        }

        try {
          const res = await fetch(API_URL, { method: 'POST', body: formData });
          if (res.ok) await deleteReport(item.offlineId);
        } catch (err) {
          console.error('Sync failed', err);
          break; // Stop syncing on network failure
        }
      }
      await updatePendingCount();
    } catch (err) {
      console.error('Error reading offline queue', err);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncOfflineReports();
    }
  }, [isOnline]);

  const navigateToReport = (tag) => {
    setSelectedTag(tag);
    setCurrentScreen('report');
  };

  const navigateHome = () => {
    setCurrentScreen('home');
    setSelectedTag(null);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center">
      {/* Top Bar */}
      <header className="w-full max-w-md p-4 flex justify-between items-center bg-navy sticky top-0 z-10 border-b border-gray-700/50">
        {currentScreen === 'report' ? (
          <button onClick={navigateHome} className="p-1 -ml-1 text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ) : (
          <Globe className="text-gray-300 w-6 h-6" />
        )}
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-white tracking-wide">CrisisMesh <span className="text-orange">AI</span></h1>
          {pendingCount > 0 && (
            <span className="text-[10px] font-medium text-orange-200 mt-0.5">
              {pendingCount} waiting to sync
            </span>
          )}
        </div>
        {isOnline ? (
          <Wifi className="text-gray-300 w-6 h-6" />
        ) : (
          <WifiOff className="text-red-400 w-6 h-6 animate-pulse" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md flex-1 flex flex-col overflow-y-auto">
        {currentScreen === 'home' ? (
          <HomeScreen 
            isOnline={isOnline} 
            onSelectTag={navigateToReport} 
            onSaveOffline={updatePendingCount}
            apiUrl={API_URL}
          />
        ) : (
          <ReportScreen 
            isOnline={isOnline} 
            tag={selectedTag} 
            onBack={navigateHome}
            onSaveOffline={updatePendingCount}
            apiUrl={API_URL}
          />
        )}
      </main>
    </div>
  );
}

export default App;