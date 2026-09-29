import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BackgroundAnimation from './components/BackgroundAnimation';

// Views
import Landing from './views/Landing';
import Login from './views/Login';
import OtpVerify from './views/OtpVerify';
import LanguageSelect from './views/LanguageSelect';
import Dashboard from './views/Dashboard';
import AegisView from './views/AegisView';
import OriginView from './views/OriginView';
import FastkitView from './views/FastkitView';
import LegalView from './views/LegalView';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function App() {
  const [auth, setAuth] = useState({ isAuthenticated: false, token: null, user: null });
  const [language, setLanguage] = useState('en');

  return (
    <AppContext.Provider value={{ auth, setAuth, language, setLanguage }}>
      <BrowserRouter>
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
          <BackgroundAnimation />
          <div className="relative z-10 flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-otp" element={<OtpVerify />} />
              <Route path="/language" element={<LanguageSelect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Full-Screen Feature Views */}
              <Route path="/feature/aegis" element={<AegisView />} />
              <Route path="/feature/origin" element={<OriginView />} />
              <Route path="/feature/fastkit" element={<FastkitView />} />
              <Route path="/feature/legal" element={<LegalView />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}