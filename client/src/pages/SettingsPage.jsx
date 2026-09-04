import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, Shield, Save, LogOut } from 'lucide-react';

export default function SettingsPage({ authority }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  
  // Dummy form state
  const [formData, setFormData] = useState({
    name: authority?.name || 'Demo Authority',
    email: authority?.email || 'admin@crisismesh.com',
    notifications: true,
    soundAlerts: true,
    aiAutoDispatch: false,
    mapDefault: 'satellite'
  });

  const onNavigate = (key) => {
    if (key === 'command-center') navigate('/authority/dashboard');
    else if (key === 'ai-reports') navigate('/authority/reports');
    else navigate(`/authority/${key}`);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setToast({ message: 'Settings saved successfully.', tone: 'success' });
  };

  const handleLogout = () => {
    localStorage.removeItem("dummy_auth_user");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active="settings" onNavigate={onNavigate} authority={authority} />
      <div className="flex-1 min-w-0 bg-[#0f2337] text-white overflow-y-auto">
        <TopBar eventName="System Settings" lastSync={new Date()} />
        <main className="p-6 max-w-4xl mx-auto flex flex-col gap-8 pb-12">
          
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-white/50" /> 
              Platform Configuration
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Manage your profile, notification preferences, and system behavior.
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            {/* Profile Section */}
            <section className="bg-[#17324A] rounded-xl border border-white/10 p-6 shadow-lg">
              <h2 className="text-sm uppercase tracking-wider text-white/50 font-bold flex items-center gap-2 mb-4">
                <User className="h-4 w-4" /> Account Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Full Name</label>
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3498DB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Email Address</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3498DB] transition-colors text-white/50"
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-[#17324A] rounded-xl border border-white/10 p-6 shadow-lg">
              <h2 className="text-sm uppercase tracking-wider text-white/50 font-bold flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4" /> Alerts & Notifications
              </h2>
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Critical Incident Alerts</div>
                    <div className="text-xs text-white/40">Receive immediate notifications for priority 80+ incidents.</div>
                  </div>
                  <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0f2337] appearance-none cursor-pointer transition-transform checked:translate-x-5" style={{ backgroundColor: formData.notifications ? '#2ECC71' : '#ccc' }} />
                  </div>
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">Sound Effects</div>
                    <div className="text-xs text-white/40">Play an audible chime when new reports enter the queue.</div>
                  </div>
                  <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="soundAlerts" checked={formData.soundAlerts} onChange={handleChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0f2337] appearance-none cursor-pointer transition-transform checked:translate-x-5" style={{ backgroundColor: formData.soundAlerts ? '#2ECC71' : '#ccc' }} />
                  </div>
                </label>
              </div>
            </section>

            {/* Advanced Section */}
            <section className="bg-[#17324A] rounded-xl border border-white/10 p-6 shadow-lg">
              <h2 className="text-sm uppercase tracking-wider text-white/50 font-bold flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4" /> System Preferences
              </h2>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">Default Map Layer</label>
                  <select 
                    name="mapDefault" value={formData.mapDefault} onChange={handleChange}
                    className="w-full md:w-1/2 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3498DB] transition-colors appearance-none"
                  >
                    <option value="standard">Standard Street Map</option>
                    <option value="satellite">Satellite Imagery</option>
                    <option value="terrain">Terrain / Topography</option>
                  </select>
                </div>
                
                <label className="flex items-center justify-between p-3 rounded-lg border border-[#e74c3c]/30 bg-[#e74c3c]/5 hover:bg-[#e74c3c]/10 transition-colors cursor-pointer">
                  <div>
                    <div className="font-medium text-sm text-[#e74c3c]">Automated AI Triage (Experimental)</div>
                    <div className="text-xs text-white/40">Allow AI to automatically dispatch available units to critical incidents without human review.</div>
                  </div>
                  <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="aiAutoDispatch" checked={formData.aiAutoDispatch} onChange={handleChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-[#0f2337] appearance-none cursor-pointer transition-transform checked:translate-x-5" style={{ backgroundColor: formData.aiAutoDispatch ? '#e74c3c' : '#ccc' }} />
                  </div>
                </label>
              </div>
            </section>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button 
                type="button" 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              
              <button 
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-[#3498DB] hover:bg-[#2980B9] text-white transition-colors shadow-lg"
              >
                <Save className="h-4 w-4" />
                Save Preferences
              </button>
            </div>

          </form>
        </main>
      </div>
      <Toast message={toast?.message} tone={toast?.tone} onDismiss={() => setToast(null)} />
    </div>
  );
}
