import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Compass } from 'lucide-react';
import { loginAdmin } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('adminpassword123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#F0EEE6] px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E3DFD3] p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#F6C2D3] text-[#1A1C1E] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#1A1C1E]" />
          </div>
          <h1 className="text-xl font-bold text-[#1A1C1E]">Administrator Portal</h1>
          <p className="text-xs text-[#718096]">
            Secure login for Dr. Lankapalli Bullayya College of Engineering campus managers.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center space-x-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1A1C1E] block mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden focus:border-[#EF83B9]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1C1E] block mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F0EEE6] rounded-xl border border-[#E3DFD3] text-[#1A1C1E] focus:outline-hidden focus:border-[#EF83B9]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#EF83B9] hover:bg-[#D9529B] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#E3DFD3] text-[11px] text-[#718096] text-center">
          Default seed account: <strong>admin</strong> / <strong>adminpassword123</strong>
        </div>
      </div>
    </div>
  );
}
