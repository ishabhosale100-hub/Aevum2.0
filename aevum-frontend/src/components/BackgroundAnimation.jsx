import React from 'react';

export default function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl animate-slow-drift" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sky-900/20 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '-12s' }} />
    </div>
  );
}