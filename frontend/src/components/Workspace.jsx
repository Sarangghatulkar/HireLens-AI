import React, { useRef, useState } from 'react';

export default function Workspace({
  resumeText,
  setResumeText,
  jdText,
  setJdText,
  jobTitle,
  setJobTitle,
  onAnalyze,
  loading,
  uploading,
  onUploadFile,
  sourceName,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resumeWords = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;
  const jdWords = jdText.trim() ? jdText.trim().split(/\s+/).length : 0;

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearAll = () => {
    setResumeText('');
    setJdText('');
    setJobTitle('');
  };

  return (
    <div className="workspace-card" id="workspace-section">
      {/* Workspace Quick Actions Bar */}
      <div className="workspace-toolbar">
        <div className="workspace-toolbar-left">
          <span className="workspace-pill-tag">✨ Evaluation Workspace</span>
          <span className="workspace-sub-note">Paste inputs or upload PDF for instant ATS match</span>
        </div>
        <div className="workspace-toolbar-right">
          {(resumeText.trim() || jdText.trim() || jobTitle.trim()) && (
            <button
              type="button"
              className="workspace-clear-btn"
              onClick={handleClearAll}
              title="Clear all fields"
            >
              Clear Workspace
            </button>
          )}
        </div>
      </div>

      <div className="workspace-grid">
        {/* Left Column: Candidate Resume */}
        <div className="workspace-col">
          <div className="input-block-header">
            <span className="input-title">
              <span className="input-step-badge">1</span>
              <span>Candidate Resume</span>
            </span>
            <div className="input-actions-right">
              {resumeText.trim() && (
                <button
                  type="button"
                  className="input-clear-link"
                  onClick={() => setResumeText('')}
                >
                  Clear
                </button>
              )}
              <span className={`input-counter ${resumeWords > 0 ? 'active' : ''}`}>
                {resumeWords} words {sourceName ? `• ${sourceName}` : ''}
              </span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".pdf,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadFile(e.target.files[0]);
              }
            }}
          />

          {/* Drag & Drop Zone */}
          <div
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload resume file"
          >
            <div className="dropzone-icon">📄</div>
            <div className="dropzone-text">
              {uploading ? (
                <span className="dropzone-loading">
                  <span className="spinner-sm" /> Extracting resume text in-memory...
                </span>
              ) : (
                'Drop PDF or TXT resume here, or click to browse'
              )}
            </div>
            <div className="dropzone-sub">
              Secure in-memory OCR & parsing • Zero third-party telemetry
            </div>
          </div>

          <textarea
            className="text-area"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Parsed resume text appears here automatically, or you can paste your raw resume text directly..."
            rows={12}
            id="workspace-resume-input"
          />
        </div>

        {/* Right Column: Target Job Description */}
        <div className="workspace-col">
          <div className="input-block-header">
            <span className="input-title">
              <span className="input-step-badge">2</span>
              <span>Target Job Description</span>
            </span>
            <div className="input-actions-right">
              {jdText.trim() && (
                <button
                  type="button"
                  className="input-clear-link"
                  onClick={() => setJdText('')}
                >
                  Clear
                </button>
              )}
              <span className={`input-counter ${jdWords > 0 ? 'active' : ''}`}>
                {jdWords} words
              </span>
            </div>
          </div>

          <div className="job-title-input-wrapper">
            <span className="job-title-icon">💼</span>
            <input
              type="text"
              className="text-input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Target Role / Job Title (e.g. Senior Machine Learning Engineer)"
              id="workspace-job-title-input"
            />
          </div>

          <textarea
            className="text-area"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the target job description here (responsibilities, required tech stack, qualifications)..."
            rows={15}
            id="workspace-jd-input"
          />
        </div>
      </div>

      {/* Main Analysis CTA */}
      <div className="analyze-btn-container">
        <button
          type="button"
          className="analyze-main-btn"
          onClick={onAnalyze}
          disabled={loading || uploading || !resumeText.trim() || !jdText.trim()}
          id="run-analysis-btn"
        >
          {loading ? (
            <>
              <span className="spinner-sm" />
              <span>Running Semantic Analysis & ATS Simulation...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">⚡</span>
              <span>Evaluate Match & Uncover Gaps</span>
            </>
          )}
        </button>
        <span className="analyze-hint">
          {!resumeText.trim() || !jdText.trim()
            ? 'Provide both resume and job description to enable analysis'
            : 'Multi-layer TF-IDF, Semantic Cosine Vectors, and ATS rules ready'}
        </span>
      </div>
    </div>
  );
}
