import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/authority/dashboard'); // Go to dashboard on success
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password to register.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Optional: Set a display name for the hackathon
      await updateProfile(userCredential.user, { displayName: "Demo Authority" });
      navigate('/authority/dashboard'); 
    } catch (err) {
      setError(err.message || "Failed to register.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#17324A] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Authority Login</h2>
          <p className="text-gray-500 mt-2">Sign in to access the Command Center</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#17324A] focus:border-[#17324A] outline-none text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="authority@crisismesh.gov"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#17324A] focus:border-[#17324A] outline-none text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-3">
            <button 
              type="submit" 
              className="w-full bg-[#E67E22] hover:bg-[#D35400] text-white font-bold py-3 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <button 
              type="button" 
              onClick={handleRegister}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-colors"
            >
              Register New Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
