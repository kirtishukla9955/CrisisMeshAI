import React, { useState } from 'react';
import { Hand, Droplets, Bandage, Lock, Utensils, HeartPulse, CheckCircle2, AlertTriangle } from 'lucide-react';
import { saveReportOffline } from '../services/db';

const TAGS = [
  { id: 'flood', label: 'Flood', icon: Droplets, color: 'bg-tag-flood', border: 'border-blue-400/30' },
  { id: 'injury', label: 'Injury', icon: Bandage, color: 'bg-tag-injury', border: 'border-yellow-400/30' },
  { id: 'trapped', label: 'Trapped', icon: Lock, color: 'bg-tag-trapped', border: 'border-orange-400/30' },
  { id: 'food_water', label: 'Food or water\nneeded', icon: Utensils, color: 'bg-tag-food', border: 'border-green-400/30' },
  { id: 'medical', label: 'Medical\nemergency', icon: HeartPulse, color: 'bg-tag-medical', border: 'border-red-400/30' },
];

export default function HomeScreen({ isOnline, onSelectTag, onSaveOffline, apiUrl }) {
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'offline', text: '' }

  const handleSOS = async () => {
    setSubmitting(true);
    setStatusMsg(null);
    
    // Quick capture location
    let location = null;
    try {
      location = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          err => resolve(null), // Fail silently for SOS, still submit
          { timeout: 5000, maximumAge: 0 }
        );
      });
    } catch (e) {}

    const reportData = {
      tag: 'other',
      isEmergency: true,
      text: null,
      location,
      locationText: null,
      source: 'app',
    };

    if (isOnline) {
      try {
        const formData = new FormData();
        Object.keys(reportData).forEach(key => {
          if (reportData[key] !== null) {
            formData.append(key, typeof reportData[key] === 'object' ? JSON.stringify(reportData[key]) : reportData[key]);
          }
        });
        const res = await fetch(apiUrl, { method: 'POST', body: formData });
        if (res.ok) {
          setStatusMsg({ type: 'success', text: 'SOS Sent!' });
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        await saveOffline(reportData);
      }
    } else {
      await saveOffline(reportData);
    }
    
    setSubmitting(false);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const saveOffline = async (data) => {
    await saveReportOffline(data, []);
    if (onSaveOffline) onSaveOffline();
    setStatusMsg({ type: 'offline', text: 'Saved — will send when online' });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full relative">
      
      {/* Status Messages */}
      {statusMsg && (
        <div className={`absolute top-4 left-4 right-4 p-3 rounded-lg flex items-center shadow-lg border ${
          statusMsg.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-orange-900/90 border-orange-500 text-orange-100'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      {/* SOS Button Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full mb-8 mt-4">
        {/* Outer glowing rings */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-gray-500/30 scale-110"></div>
          <div className="absolute inset-4 rounded-full border border-gray-400/40"></div>
          
          <button 
            onClick={handleSOS}
            disabled={submitting}
            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center 
                       bg-gradient-to-b from-red to-orange shadow-[0_0_40px_rgba(230,126,34,0.4)]
                       active:scale-95 transition-transform disabled:opacity-70`}
          >
            <span className="text-4xl font-bold text-white tracking-widest mb-2">SOS</span>
            <Hand className="w-12 h-12 text-white" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Tags Grid */}
      <div className="w-full grid grid-cols-3 gap-3 mb-4">
        {TAGS.slice(0, 3).map(tag => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${tag.border} ${tag.color} 
                        hover:brightness-110 active:scale-95 transition-all h-28`}
          >
            <tag.icon className="w-8 h-8 text-white mb-2" strokeWidth={1.5} />
            <span className="text-xs text-white font-medium text-center whitespace-pre-line">{tag.label}</span>
          </button>
        ))}
      </div>
      
      <div className="w-full grid grid-cols-2 gap-3">
        {TAGS.slice(3, 5).map(tag => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${tag.border} ${tag.color} 
                        hover:brightness-110 active:scale-95 transition-all h-28`}
          >
            <tag.icon className="w-10 h-10 text-white mb-2" strokeWidth={1.5} />
            <span className="text-xs text-white font-medium text-center whitespace-pre-line">{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
