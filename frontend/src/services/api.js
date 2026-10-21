/**
 * HireLens AI - Centralized REST API Client Service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Authentication Token Storage Helpers
 */
export function getAuthToken() {
  try {
    return localStorage.getItem('hirelens_auth_token') || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('hirelens_auth_token', token);
    } else {
      localStorage.removeItem('hirelens_auth_token');
    }
  } catch {
    // Ignore storage restrictions
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem('hirelens_auth_token');
  } catch {
    // Ignore storage restrictions
  }
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * User Authentication Endpoints
 */
export async function registerUser({ email, password, fullName }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName || '',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed. Please check your credentials.');
  }
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Login failed. Invalid email or password.');
  }
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function loginWithGoogle({ credential, email, name, google_id }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, email, name, google_id }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Google sign-in failed. Please try again.');
  }
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Password reset request failed.');
  }
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Password reset failed. Invalid or expired token.');
  }
  return data;
}

export async function getUserProfile() {
  const token = getAuthToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    clearAuthToken();
    return null;
  }
  return response.json();
}

/**
 * Scan History & Progression Analytics Endpoints
 */
export async function getUserScanHistory() {
  const response = await fetch(`${API_BASE_URL}/api/history/scans`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch scan history.');
  }
  return data;
}

export async function getScanDetail(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/history/scans/${scanId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to load historical scan.');
  }
  return data;
}

export async function deleteScanRecord(scanId) {
  const response = await fetch(`${API_BASE_URL}/api/history/scans/${scanId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete scan record.');
  }
  return true;
}

/**
 * Uploads a resume (PDF or TXT) to the backend for in-memory text extraction.
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to extract text from resume file.');
  }
  return data;
}

/**
 * Triggers multi-layer resume matching, skill taxonomy extraction, and ATS compliance audit.
 */
export async function analyzeResume({ resumeText, jdText, jobTitle, apiKey }) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      resume_text: resumeText,
      jd_text: jdText,
      job_title: jobTitle || '',
      api_key: apiKey ? apiKey.trim() : null,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to analyze resume.');
  }
  return data;
}

/**
 * Sends a message to the AI Career Copilot (offline NLP context engine or Gemini API).
 */
export async function sendChatMessage({
  messages,
  resumeText,
  jdText,
  analysisResults,
  apiKey,
}) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      messages,
      resume_text: resumeText || '',
      jd_text: jdText || '',
      analysis_results: analysisResults || null,
      api_key: apiKey ? apiKey.trim() : null,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || 'Copilot assistant was unable to respond.');
  }
  return data;
}

/**
 * Generates and downloads the executive PDF evaluation report.
 */
export async function downloadReport({
  candidateName,
  jobTitle,
  scoreData,
  skillData,
  atsData,
  recommendations,
}) {
  const response = await fetch(`${API_BASE_URL}/api/download-report`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      candidate_name: candidateName || 'Candidate',
      job_title: jobTitle || 'Target Role',
      score_data: scoreData,
      skill_data: skillData,
      ats_data: atsData,
      recommendations: recommendations,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate executive PDF report.');
  }
  return response.blob();
}

/**
 * Health check endpoint for checking backend connection.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}
