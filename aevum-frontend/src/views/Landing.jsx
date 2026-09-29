import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium mb-6">
        <Lock className="w-3.5 h-3.5" /> End-to-End Encrypted & Secure
      </div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
        AEVUM
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-8 leading-relaxed">
        Advanced digital armor and crisis navigation tools protecting you from photo misuse and manipulation.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
      >
        <ShieldCheck className="w-5 h-5" /> Get Started
      </button>
    </div>
  );
}