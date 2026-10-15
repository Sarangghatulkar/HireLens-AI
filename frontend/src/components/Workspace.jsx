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

  return (
    <div className="workspace-card" id="workspace-section">
      <div className="workspace-grid">
        {/* Left Column: Candidate Resume */}
        <div>
          <div className="input-block-header">
            <span className="input-title">
              <span>📄</span> 1. Candidate Resume
            </span>
            <span className="input-counter">
              {resumeWords} words {sourceName ? `• ${sourceName}` : ''}
            </span>
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

          {/* Dropzone */}
          <div
            className={`dropzone ${isDragOver ? 'dragover' : ''}`}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>📥</div>
            <div className="dropzone-text">
              {uploading
                ? 'Extracting text from resume...'
                : 'Click to upload or drag & drop PDF / TXT resume'}
            </div>
            <div className="dropzone-sub">In-memory processing • Never permanently stored</div>
          </div>

          <textarea
            className="text-area"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Parsed resume text appears here, or you can paste your resume directly..."
          />
        </div>

        {/* Right Column: Target Job Description */}
        <div>
          <div className="input-block-header">
            <span className="input-title">
              <span>💼</span> 2. Target Job Description
            </span>
            <span className="input-counter">{jdWords} words</span>
          </div>

          <input
            type="text"
            className="text-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job Title / Role (e.g. Senior Machine Learning Engineer)"
          />

          <textarea
            className="text-area"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste target job responsibilities, qualifications, and tech requirements here..."
            style={{ height: '310px' }}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="analyze-btn-container">
        <button
          type="button"
          className="analyze-main-btn"
          onClick={onAnalyze}
          disabled={loading || uploading || !resumeText.trim() || !jdText.trim()}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span> Analyzing Embeddings & ATS...
            </>
          ) : (
            <>
              <span>⚡</span> Analyze Resume & Match Job
            </>
          )}
        </button>
      </div>
    </div>
  );
}
