import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MapPin, CheckCircle2, Square, Play, AudioLines, Image as ImageIcon } from 'lucide-react';
import { saveReportOffline } from '../services/db';

export default function ReportScreen({ isOnline, tag, onBack, onSaveOffline, apiUrl }) {
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [files, setFiles] = useState([]); // Array of { blob, name, type, preview }
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    captureLocation();
  }, []);

  const captureLocation = () => {
    setLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoadingLocation(false);
        },
        (err) => {
          console.error("GPS Error:", err);
          setLocation(null);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
    }
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
      setFiles(prev => [...prev, newFile]);
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
        console.error("Recording error", err);
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const reportData = {
      tag: tag || 'other',
      isEmergency: false,
      text: null, // text is optional, not requested in UI spec except as fallback
      location,
      locationText: location ? null : locationText,
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

        files.forEach(f => formData.append('media', f.blob, f.name));

        const res = await fetch(apiUrl, { method: 'POST', body: formData });
        if (res.ok) {
          onBack(); // go home on success
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
  };

  const saveOffline = async (data) => {
    await saveReportOffline(data, files);
    if (onSaveOffline) onSaveOffline();
    onBack(); // back to home
  };

  const canSubmit = location || locationText.trim() !== '' || files.length > 0;

  return (
    <div className="flex-1 flex flex-col relative w-full h-full pb-24 px-6 pt-6">
      
      {/* Media Capture Area */}
      <div className="flex gap-4 mb-8">
        {/* Photo/Video Button */}
        <button 
          onClick={() => fileInputRef.current.click()}
          className="flex-1 aspect-square bg-[#1E3E5B] rounded-2xl border border-gray-600/50 flex flex-col items-center justify-center relative hover:bg-[#254A6D] transition-colors"
        >
          <Camera className="w-12 h-12 text-gray-300 mb-2" strokeWidth={1.5} />
          <div className="absolute top-1/2 left-1/2 ml-4 mt-2 bg-orange text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm border-2 border-[#1E3E5B]">
            +
          </div>
          <span className="text-xs text-gray-400 font-medium">Add Photo</span>
        </button>
        <input 
          type="file" 
          accept="image/*,video/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Voice Note Button */}
        <button 
          onClick={toggleRecording}
          className={`flex-1 aspect-square rounded-2xl border border-gray-600/50 flex flex-col items-center justify-center transition-colors
                     ${recording ? 'bg-red-900/50 border-red-500 animate-pulse' : 'bg-[#1E3E5B] hover:bg-[#254A6D]'}`}
        >
          {recording ? (
            <Square className="w-10 h-10 text-red-400 mb-2" fill="currentColor" />
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-8 h-8 text-gray-300 mb-1" strokeWidth={1.5} />
              <AudioLines className="w-8 h-4 text-gray-400 mb-2" />
            </div>
          )}
          <span className={`text-xs font-medium ${recording ? 'text-red-400' : 'text-gray-400'}`}>
            {recording ? 'Stop' : 'Voice Note'}
          </span>
        </button>
      </div>

      {/* Media Previews (if any) */}
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {files.map((f, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl bg-gray-800 flex-shrink-0 border border-gray-600 overflow-hidden">
              {f.type.startsWith('image/') ? (
                <img src={f.preview} alt="preview" className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#17324A]">
                  <Play className="text-orange w-6 h-6" fill="currentColor" />
                </div>
              )}
              <button 
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                className="absolute top-0 right-0 bg-red-500/90 text-white rounded-bl-lg w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Location Card */}
      <div className="w-full bg-[#1E3E5B] rounded-2xl border border-gray-600/50 p-4 mb-4">
        {loadingLocation ? (
          <div className="flex items-center justify-center h-16 text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-2 animate-bounce" /> Locating...
          </div>
        ) : location ? (
          <div className="flex flex-col items-center">
            <div className="w-full h-24 bg-[#0F2233] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
               {/* Decorative Map Grid Pattern */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <MapPin className="text-orange w-8 h-8 relative z-10" fill="currentColor" />
            </div>
            <div className="flex items-center text-green-400">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span className="text-sm font-semibold">GPS capture</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <label className="text-xs text-orange-300 mb-2 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> GPS unavailable. Please type location:
            </label>
            <input
              type="text"
              value={locationText}
              onChange={e => setLocationText(e.target.value)}
              placeholder="e.g. Near main bridge"
              className="w-full bg-[#0F2233] border border-gray-600 rounded-lg p-3 text-white text-sm outline-none focus:border-orange"
            />
          </div>
        )}
      </div>

      {/* Fixed Send Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleSubmit}
          disabled={submitting || (!canSubmit)}
          className="w-full bg-orange hover:bg-orange-600 text-white font-bold py-4 rounded-full shadow-[0_4px_15px_rgba(230,126,34,0.3)] transition-colors disabled:opacity-50 text-lg"
        >
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </div>

    </div>
  );
}
