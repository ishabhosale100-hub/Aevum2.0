import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, LifeBuoy, FileText, LogOut } from 'lucide-react';
import { useApp } from '../App';

const CARDS = [
  { id: 'aegis', title: 'AEGIS', desc: 'Protect photos before misuse via watermarking & adversarial noise.', icon: Shield, path: '/feature/aegis' },
  { id: 'origin', title: 'ORIGIN', desc: 'Detect tampering and visual inconsistencies between images.', icon: Search, path: '/feature/origin' },
  { id: 'fastkit', title: 'FASTKIT', desc: 'Situational guidance & secure response scripts.', icon: LifeBuoy, path: '/feature/fastkit' },
  { id: 'legal', title: 'LEGAL', desc: 'Generate structured, reference-ID tracked incident reports.', icon: FileText, path: '/feature/legal' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { setAuth } = useApp();

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 justify-center">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AEVUM Command</h1>
          <p className="text-xs text-slate-400">Select a module to open full-screen workspace.</p>
        </div>
        <button
          onClick={() => { setAuth({ isAuthenticated: false, token: null }); navigate('/'); }}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all text-xs flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              className="p-6 rounded-2xl bg-aevum-card/60 border border-slate-800 hover:border-sky-500/40 hover:bg-aevum-card transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-wide">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
              <div className="mt-6 text-xs font-medium text-sky-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Workspace →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}