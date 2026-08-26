import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MapPin, AlertTriangle, CheckCircle2, Square, Play, SquarePlay } from 'lucide-react';
import { saveReportOffline } from '../services/db';

const TAGS = [
  { id: 'flood', label: 'Flood', icon: '🌊' },
  { id: 'injury', label: 'Injury', icon: '🤕' },
  { id: 'trapped', label: 'Trapped', icon: '🆘' },
  { id: 'food_water', label: 'Food/Water', icon: '🥫' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'road_blocked', label: 'Road Blocked', icon: '🚧' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const API_URL = 'http://localhost:5000/api/reports';

export default function ReportForm({ isOnline, onSaveOffline }) {
  const [tag, setTag] = useState('');
  const [text, setText] = useState('');
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [files, setFiles] = useState([]); // Array of { blob, name, type, preview }
  
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'offline-saved'
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = () => {
    setLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
    }
  };

  const handleSOS = async () => {
    const reportData = {
      tag: 'other',
      isEmergency: true,
      text: 'SOS - I Need Help Now!',
      location,
      locationText,
      source: 'app',
    };
    await submitForm(reportData, []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reportData = {
      tag: tag || 'other',
      isEmergency: false,
      text,
      location,
      locationText,
      source: 'app',
    };
    await submitForm(reportData, files);
  };

  const submitForm = async (reportData, filesToUpload) => {
    setSubmitting(true);
    
    if (isOnline) {
      try {
        const formData = new FormData();
        Object.keys(reportData).forEach(key => {
          if (reportData[key] !== null && reportData[key] !== undefined) {
             if (typeof reportData[key] === 'object') {
                 formData.append(key, JSON.stringify(reportData[key]));
             } else {
                 formData.append(key, reportData[key]);
             }
          }
        });

        filesToUpload.forEach(f => {
          formData.append('media', f.blob, f.name);
        });

        const res = await fetch(API_URL, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          setSubmitStatus('success');
          resetForm();
        } else {
          throw new Error("Server error");
        }
      } catch (err) {
        console.error("Submission failed, saving offline.", err);
        await saveOffline(reportData, filesToUpload);
      }
    } else {
      await saveOffline(reportData, filesToUpload);
    }
    setSubmitting(false);
  };

  const saveOffline = async (reportData, filesToUpload) => {
    await saveReportOffline(reportData, filesToUpload);
    if (onSaveOffline) onSaveOffline();
    setSubmitStatus('offline-saved');
    resetForm();
  };

  const resetForm = () => {
    setTag('');
    setText('');
    setFiles([]);
    setTimeout(() => setSubmitStatus(null), 5000); 
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile = {
        blob: file,
        name: file.name,
        type: file.type,
        preview: URL.createObjectURL(file)
      };
      setFiles([...files, newFile]);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorder.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const newFile = {
            blob,
            name: `voice_note_${Date.now()}.webm`,
            type: 'audio/webm',
            preview: URL.createObjectURL(blob)
          };
          setFiles(prev => [...prev, newFile]);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
      } catch (err) {
        console.error("Could not start recording", err);
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* SOS Button */}
      <button 
        onClick={handleSOS}
        disabled={submitting}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-4 flex flex-col items-center justify-center transition-colors disabled:opacity-50"
      >
        <AlertTriangle size={48} className="mb-2" />
        <span className="text-2xl uppercase tracking-wider">SOS - I Need Help Now</span>
        <span className="text-sm font-normal opacity-90 mt-1">Tap to immediately send location</span>
      </button>

      <div className="p-5 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Standard Report</h2>
        
        {submitStatus === 'success' && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-lg flex items-center border border-green-200">
            <CheckCircle2 className="mr-2" size={20} />
            Report sent successfully! Help is on the way.
          </div>
        )}

        {submitStatus === 'offline-saved' && (
          <div className="mb-4 bg-orange-50 text-orange-700 p-3 rounded-lg flex items-center border border-orange-200">
            <AlertTriangle className="mr-2" size={20} />
            Saved — will send when you're back online.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tag Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What is the emergency?</label>
            <div className="grid grid-cols-3 gap-2">
              {TAGS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTag(t.id)}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-colors ${
                    tag === t.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl mb-1">{t.icon}</span>
                  <span className="text-xs font-medium leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-800 focus:border-blue-500 focus:ring-0 outline-none"
              rows="3"
              placeholder="e.g. Water is rising fast, 3 people trapped..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>

          {/* Location */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <MapPin size={16} className="mr-1 text-blue-500" /> Location
              </label>
              <button 
                type="button" 
                onClick={captureLocation}
                disabled={loadingLocation}
                className="text-xs text-blue-600 font-medium"
              >
                {loadingLocation ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>
            
            {location ? (
              <div className="text-sm text-green-600 mb-2 font-medium flex items-center">
                <CheckCircle2 size={14} className="mr-1" /> GPS captured
              </div>
            ) : (
              <div className="text-sm text-orange-500 mb-2">GPS unavailable</div>
            )}
            
            <input
              type="text"
              placeholder="Manual location (e.g. Near Big Banyan Tree)"
              className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm text-gray-800 focus:border-blue-500 outline-none"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Photo/Video or Voice Note</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 rounded-lg py-3 flex flex-col items-center text-gray-700 transition-colors"
              >
                <Camera size={24} className="mb-1" />
                <span className="text-xs font-medium">Camera</span>
              </button>
              
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex-1 border-2 rounded-lg py-3 flex flex-col items-center transition-colors ${
                  recording 
                    ? 'bg-red-100 border-red-500 text-red-600 animate-pulse' 
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                }`}
              >
                {recording ? <Square size={24} className="mb-1" /> : <Mic size={24} className="mb-1" />}
                <span className="text-xs font-medium">{recording ? 'Stop' : 'Voice Note'}</span>
              </button>
              
              <input 
                type="file" 
                accept="image/*,video/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            
            {/* File Previews */}
            {files.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {files.map((f, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 border border-gray-300 overflow-hidden flex items-center justify-center">
                    {f.type.startsWith('image/') ? (
                      <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                    ) : f.type.startsWith('audio/') ? (
                      <SquarePlay size={24} className="text-blue-500" />
                    ) : (
                      <Camera size={24} className="text-gray-500" />
                    )}
                    <button 
                      type="button"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs z-10"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || (!tag && !text && !locationText && files.length === 0 && !location)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
