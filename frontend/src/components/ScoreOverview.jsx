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
    <div>
      {/* Top Chart Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Gauge Chart Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.8rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            HireLens Match Score
          </div>

          {/* SVG Gauge */}
          <div style={{ position: 'relative', width: '200px', height: '110px', margin: '0.5rem auto 0 auto' }}>
            <svg width="200" height="110" viewBox="0 0 200 110">
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
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: 0,
                right: 0,
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              {overall}%
            </div>
          </div>

          <div
            style={{
              display: 'inline-block',
              marginTop: '0.4rem',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              background: `${tierColor}15`,
              color: tierColor,
              fontWeight: 700,
              fontSize: '0.9rem',
              border: `1px solid ${tierColor}40`,
            }}
          >
            {tierLabel}
          </div>

          <p style={{ marginTop: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.45 }}>
            {tierDesc}
          </p>
        </div>

        {/* Radar / 4-Pillar Visual Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.8rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Multi-Pillar Alignment
          </div>

          {/* Clean Progress Bars for 4 Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: 4 }}>
                <span>🎯 Skills Overlap (40% Weight)</span>
                <span style={{ color: 'var(--primary-600)' }}>{sub.skill_score}%</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${sub.skill_score}%`, height: '100%', background: '#6366F1', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: 4 }}>
                <span>🧠 Semantic Vector Alignment (30% Weight)</span>
                <span style={{ color: 'var(--primary-600)' }}>{sub.semantic_score}%</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${sub.semantic_score}%`, height: '100%', background: '#8B5CF6', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: 4 }}>
                <span>🔑 TF-IDF Keyword Match (15% Weight)</span>
                <span style={{ color: 'var(--primary-600)' }}>{sub.keyword_score}%</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${sub.keyword_score}%`, height: '100%', background: '#0284C7', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600, marginBottom: 4 }}>
                <span>📋 ATS Compliance & Health (15% Weight)</span>
                <span style={{ color: 'var(--primary-600)' }}>{ats_audit?.ats_score}%</span>
              </div>
              <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${ats_audit?.ats_score}%`, height: '100%', background: '#10B981', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metrics Boxes */}
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
          <div className="metric-box-sub">Contextual similarity embeddings</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">Keyword Match (15%)</div>
          <div className="metric-box-val">{sub.keyword_score}%</div>
          <div className="metric-box-sub">TF-IDF domain terminology</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">ATS Compliance (15%)</div>
          <div className="metric-box-val">{ats_audit?.ats_score}%</div>
          <div className="metric-box-sub">Status: {ats_audit?.status}</div>
        </div>
      </div>

      {/* Download PDF Button */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="start-btn"
          style={{ background: '#0F172A', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)' }}
        >
          <span>📥</span> {downloadingPdf ? 'Generating PDF...' : 'Download Executive PDF Analysis Report'}
        </button>
      </div>
    </div>
  );
}
