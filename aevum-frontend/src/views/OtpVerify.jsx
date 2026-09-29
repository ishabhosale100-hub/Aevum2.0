import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../App';

export default function OtpVerify() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const { setAuth } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    setError('');
    setMessage('');

    // Simulate sending code instantly without needing the backend running
    setTimeout(() => {
      setMessage(`Verification code sent to: ${email}`);
      setStep('verify');
      setTimer(30);
      setLoading(false);
    }, 500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      return setError('Please enter the complete 6-digit code.');
    }

    setLoading(true);
    setError('');

    // Bypass backend validation: accept any 6 digits
    setTimeout(() => {
      setAuth({ isAuthenticated: true, token: 'mock-jwt-verified', user: { email } });
      navigate('/language');
      setLoading(false);
    }, 500);
  };

  const handleChangeEmail = () => {
    setStep('email');
    setError('');
    setMessage('');
    setOtp('');
    setTimer(0);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-aevum-card/80 border border-slate-800 backdrop-blur-md shadow-2xl text-center">
        
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          {step === 'email' ? <Mail className="w-6 h-6 text-sky-400"/> : <Lock className="w-6 h-6 text-emerald-400"/>}
          Secure Access
        </h2>
        
        <p className="text-sm text-slate-400 mb-6">
          {step === 'email' 
            ? 'Enter your registered email address to receive a secure verification code.' 
            : `Enter the 6-digit code sent to ${email}.`}
        </p>

        {error && <p className="mb-4 text-sm text-red-400 bg-red-950/50 p-3 rounded-lg border border-red-800 flex items-center gap-2 text-left"><AlertTriangle className="w-5 h-5 shrink-0"/> <span>{error}</span></p>}
        {message && <p className="mb-4 text-sm text-emerald-300 bg-emerald-950/50 p-3 rounded-lg border border-emerald-800 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> {message}</p>}

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-center text-lg px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-sky-500 focus:outline-none text-white"
              placeholder="you@company.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center tracking-[1em] text-2xl font-mono px-4 py-3 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white"
              placeholder="------"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Verifying...' : 'Verify & Proceed'}
              {!loading && <CheckCircle className="w-4 h-4" />}
            </button>
            
            <button 
              type="button" 
              onClick={handleChangeEmail}
              className="text-xs text-slate-500 hover:text-sky-400 transition-colors mt-2 inline-block"
            >
              Change email address?
            </button>
          </form>
        )}

        {step === 'verify' && (
          <div className="mt-6 text-xs text-slate-400 border-t border-slate-800 pt-4">
            {timer > 0 ? (
              <span>Resend code in <strong className="text-sky-400">{timer}s</strong></span>
            ) : (
              <button 
                onClick={handleSendOtp} 
                disabled={loading}
                className="text-sky-400 hover:underline font-medium flex items-center gap-1 mx-auto disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3"/> Resend Code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}