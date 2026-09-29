import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setAuth({ isAuthenticated: false, token: null, user: { email } });
    navigate('/verify-otp');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-aevum-card/80 border border-slate-800 backdrop-blur-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-sm text-slate-400 mb-6">Enter your credentials to access your account securely.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-sky-500 focus:outline-none text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-sky-500 focus:outline-none text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all mt-2 text-sm"
          >
            Continue to Verification
          </button>
        </form>
      </div>
    </div>
  );
}