/**
 * HireLens AI - Centralized REST API Client Service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Uploads a resume (PDF or TXT) to the backend for in-memory text extraction.
 */
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
    method: 'POST',
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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Content-Type': 'application/json',
    },
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
