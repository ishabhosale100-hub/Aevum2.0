import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function LanguageSelect() {
  const { setLanguage } = useApp();
  const navigate = useNavigate();

  const handleSelect = (code) => {
    setLanguage(code);
    navigate('/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-aevum-card/80 border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-sky-400" />
          <h2 className="text-2xl font-bold">Preferred Language</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">Select your primary interface language. You can change this later.</p>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 transition-all text-left flex flex-col gap-1 group"
            >
              <span className="font-semibold text-sm group-hover:text-sky-400">{lang.native}</span>
              <span className="text-xs text-slate-500">{lang.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-6 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}