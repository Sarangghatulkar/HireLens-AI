import React from 'react';

export default function ScoreOverview({ results, onDownloadPdf, downloadingPdf }) {
  if (!results) return null;

  const { score_data, skill_comparison, ats_audit } = results;
  const overall = score_data?.overall_score || 0;
  const tierLabel = score_data?.tier_label || 'Match Evaluation';
  const tierColor = score_data?.tier_color || '#4F46E5';
  const tierDesc = score_data?.tier_desc || '';
  const sub = score_data?.sub_scores || {};

  // Calculate SVG Gauge stroke dash
  const radius = 70;
  const circumference = Math.PI * radius; // Semi-circle
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className="score-overview-container">
      {/* Top 2-Column Grid */}
      <div className="score-overview-top-grid">
        {/* Gauge Chart Card */}
        <div className="score-gauge-card">
          <div className="score-gauge-tag">Overall Match Score</div>

          <div className="score-gauge-svg-wrap">
            <svg width="200" height="110" viewBox="0 0 200 110" className="gauge-svg">
              {/* Background semi-circle track */}
              <path
                d="M 20 100 A 70 70 0 0 1 180 100"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground progress path */}
              <path
                d="M 20 100 A 70 70 0 0 1 180 100"
                fill="none"
                stroke={tierColor}
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="score-gauge-val">{overall}%</div>
          </div>

          <div
            className="score-tier-badge"
            style={{
              backgroundColor: `${tierColor}15`,
              color: tierColor,
              borderColor: `${tierColor}40`,
            }}
          >
            {tierLabel}
          </div>

          <p className="score-tier-desc">{tierDesc}</p>
        </div>

        {/* 4-Pillar Visual Breakdown Card */}
        <div className="score-radar-card">
          <div className="pillar-card-title">Multi-Pillar Alignment Breakdown</div>

          <div className="pillar-progress-list">
            <div className="pillar-progress-item">
              <div className="pillar-progress-header">
                <span>🎯 Technical Skills Overlap (40% Weight)</span>
                <span className="pillar-score-text">{sub.skill_score}%</span>
              </div>
              <div className="pillar-progress-track">
                <div
                  className="pillar-progress-bar"
                  style={{ width: `${sub.skill_score}%`, backgroundColor: '#6366F1' }}
                />
              </div>
            </div>

            <div className="pillar-progress-item">
              <div className="pillar-progress-header">
                <span>🧠 Semantic Vector Alignment (30% Weight)</span>
                <span className="pillar-score-text">{sub.semantic_score}%</span>
              </div>
              <div className="pillar-progress-track">
                <div
                  className="pillar-progress-bar"
                  style={{ width: `${sub.semantic_score}%`, backgroundColor: '#8B5CF6' }}
                />
              </div>
            </div>

            <div className="pillar-progress-item">
              <div className="pillar-progress-header">
                <span>🔑 TF-IDF Keyword Match (15% Weight)</span>
                <span className="pillar-score-text">{sub.keyword_score}%</span>
              </div>
              <div className="pillar-progress-track">
                <div
                  className="pillar-progress-bar"
                  style={{ width: `${sub.keyword_score}%`, backgroundColor: '#0284C7' }}
                />
              </div>
            </div>

            <div className="pillar-progress-item">
              <div className="pillar-progress-header">
                <span>📋 ATS Compliance & Health (15% Weight)</span>
                <span className="pillar-score-text">{ats_audit?.ats_score}%</span>
              </div>
              <div className="pillar-progress-track">
                <div
                  className="pillar-progress-bar"
                  style={{ width: `${ats_audit?.ats_score}%`, backgroundColor: '#10B981' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillar Stat Cards */}
      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-box-label">Skills Match (40%)</div>
          <div className="metric-box-val">{sub.skill_score}%</div>
          <div className="metric-box-sub">
            {skill_comparison?.matched_count} of {skill_comparison?.total_required} required skills
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">Semantic Depth (30%)</div>
          <div className="metric-box-val">{sub.semantic_score}%</div>
          <div className="metric-box-sub">Contextual similarity vector score</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">Keyword Match (15%)</div>
          <div className="metric-box-val">{sub.keyword_score}%</div>
          <div className="metric-box-sub">Domain-specific TF-IDF match</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">ATS Compliance (15%)</div>
          <div className="metric-box-val">{ats_audit?.ats_score}%</div>
          <div className="metric-box-sub">Status: {ats_audit?.status}</div>
        </div>
      </div>

      {/* Download PDF Action Bar */}
      <div className="pdf-download-row">
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="btn pdf-download-btn"
          id="download-pdf-report-btn"
        >
          {downloadingPdf ? (
            <>
              <span className="spinner-sm" />
              <span>Compiling Executive PDF Report...</span>
            </>
          ) : (
            <>
              <span>📥</span>
              <span>Download Executive PDF Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
