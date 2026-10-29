// Hardcoded production backend URL to eliminate any routing or localhost errors on Vercel
const API_BASE_URL = 'https://aevum2-0-ybbj.vercel.app/api';

// ==========================================
// COMMON API REQUEST HANDLER
// ==========================================

async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    console.error('API connection failed:', error);
    throw new Error('Cannot connect to Aevum backend. Check CORS or deployment.');
  }

  const contentType = response.headers.get('content-type') || '';
  let result;

  if (contentType.includes('application/json')) {
    try {
      result = await response.json();
    } catch {
      throw new Error('The backend returned invalid JSON.');
    }
  } else {
    const text = await response.text();
    result = {
      success: false,
      error: text || `Unexpected server response (${response.status}).`
    };
  }

  if (!response.ok) {
    throw new Error(
      result.error ||
      result.message ||
      `Request failed with status ${response.status}.`
    );
  }

  return result;
}

// ==========================================
// AUTHENTICATION (Untouched & Fully Working)
// ==========================================

export async function sendOtp(email, password) {
  return apiRequest('/auth/login-signup', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function verifyOtp(email, otp) {
  return apiRequest('/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
}

// ==========================================
// AEGIS — IMAGE PROTECTION (Optimized Payload)
// ==========================================

export async function protectAegisImage(payload) {
  return apiRequest('/ml/aegis-protect', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveAegisPhoto(payload) {
  return apiRequest('/save/aegis', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ==========================================
// ORIGIN — IMAGE ANALYSIS
// ==========================================

export async function analyzeOriginImage(payload) {
  return apiRequest('/ml/origin-analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function saveOriginReport(payload) {
  return apiRequest('/save/origin', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ==========================================
// HISTORY
// ==========================================

export async function getUserHistory(email) {
  if (!email) {
    throw new Error('Email is required to load history.');
  }
  return apiRequest(`/history/${encodeURIComponent(email)}`);
}

export { API_BASE_URL };