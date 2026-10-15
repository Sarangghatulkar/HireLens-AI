import React from 'react';

export default function Hero({ onStartClick }) {
  return (
    <div className="hero-section">
      <div className="hero-pill">
        <span>✨</span> AI-Powered Resume Matcher & ATS Intelligence
      </div>
      <h1 className="hero-heading">
        HireLens <span>AI</span>
      </h1>
      <p className="hero-subhead">
        Intelligent Resume Analyzer, Job Match Engine & Real-Time AI Career Copilot
      </p>
      <p className="hero-desc">
        Upload your resume, paste a target job description, uncover exact skill gaps,
        diagnose what's right vs. what's wrong, and talk directly with AI to tailor your application.
      </p>
      <div>
        <button
          type="button"
          className="start-btn"
          onClick={() => {
            const el = document.getElementById('workspace-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            if (onStartClick) onStartClick();
          }}
        >
          <span>🚀</span> Start Here — Analyze Your Resume
        </button>
      </div>
    </div>
  );
}
