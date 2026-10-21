import React from 'react';

export default function Hero({ onStartClick }) {
  const scrollToWorkspace = () => {
    const el = document.getElementById('workspace-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (onStartClick) onStartClick();
  };

  return (
    <header className="hero-section">
      <div className="hero-badge-row">
        <div className="hero-pill">
          <span className="hero-pulse-dot" />
          <span>Next-Gen Career Intelligence & ATS Simulation Engine</span>
        </div>
      </div>

      <h1 className="hero-heading">
        Land More Interviews With <span className="gradient-text">HireLens AI</span>
      </h1>

      <p className="hero-subhead">
        Enterprise-grade resume scoring, algorithmic skill gap detection, and real-time STAR bullet optimization.
      </p>

      <p className="hero-desc">
        Benchmark your resume against target job requirements, bypass ATS filtration algorithms, and leverage conversational AI to craft high-converting applications.
      </p>

      <div className="hero-actions">
        <button
          type="button"
          className="btn btn-primary start-btn"
          onClick={scrollToWorkspace}
          id="hero-cta-btn"
        >
          <span>⚡</span>
          <span>Start Free Evaluation</span>
        </button>
      </div>

      {/* Trust & Performance Metrics Bar */}
      <div className="hero-metrics-bar">
        <div className="hero-metric-item">
          <span className="hero-metric-val">98.4%</span>
          <span className="hero-metric-lbl">ATS Parsing Accuracy</span>
        </div>
        <div className="hero-metric-divider" />
        <div className="hero-metric-item">
          <span className="hero-metric-val">Zero</span>
          <span className="hero-metric-lbl">Data Storage Leaks</span>
        </div>
        <div className="hero-metric-divider" />
        <div className="hero-metric-item">
          <span className="hero-metric-val">STAR</span>
          <span className="hero-metric-lbl">AI Bullet Enhancement</span>
        </div>
        <div className="hero-metric-divider" />
        <div className="hero-metric-item">
          <span className="hero-metric-val">Instant</span>
          <span className="hero-metric-lbl">PDF Report Export</span>
        </div>
      </div>
    </header>
  );
}
