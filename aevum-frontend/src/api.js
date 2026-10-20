const API_BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://aevum2-0-ozz7.vercel.app/api'
);

export async function sendOtp(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${API_BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return res.json();
}

export async function saveAegisPhoto(payload) {
  const res = await fetch(`${API_BASE_URL}/save/aegis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function saveOriginReport(payload) {
  const res = await fetch(`${API_BASE_URL}/save/origin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function getUserHistory(email) {
  const res = await fetch(`${API_BASE_URL}/history/${email}`);
  return res.json();
}