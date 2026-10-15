import React from 'react';

export default function AtsAudit({ results }) {
  if (!results) return null;

  const { ats_audit } = results;
  const checklist = ats_audit?.checklist || [];
  const powerVerbs = ats_audit?.action_verbs_found || [];
  const metricsFound = ats_audit?.metrics_found || [];

  return (
    <div>
      {/* 3 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.2rem',
          marginBottom: '1.8rem',
        }}
      >
        <div className="metric-box">
          <div className="metric-box-label">ATS Health Score</div>
          <div className="metric-box-val">{ats_audit?.ats_score}%</div>
          <div style={{ color: 'var(--success-accent)', fontWeight: 600, fontSize: '0.85rem' }}>
            {ats_audit?.status}
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">Power Action Verbs</div>
          <div className="metric-box-val">{ats_audit?.action_verbs_count}</div>
          <div className="metric-box-sub">Target: 6+ distinct verbs</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-label">Quantified Metrics</div>
          <div className="metric-box-val">{ats_audit?.metrics_count}</div>
          <div className="metric-box-sub">Target: 3+ metrics / KPIs</div>
        </div>
      </div>

      {/* Checklist */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.8rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🔍 Detailed ATS Compliance Checklist
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {checklist.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: item.passed ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${item.passed ? '#BBF7D0' : '#FECACA'}`,
                fontSize: '0.88rem',
              }}
            >
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginRight: '12px',
                  color: item.passed ? '#16A34A' : '#DC2626',
                }}
              >
                {item.passed ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1 }}>
                <strong style={{ color: item.passed ? '#15803D' : '#B91C1C' }}>{item.item}</strong>{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  ({item.category} • Weight: {item.weight})
                </span>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 2 }}>
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verbs & Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
            🚀 Power Action Verbs Detected ({powerVerbs.length})
          </div>
          {powerVerbs.length > 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              {powerVerbs.join(', ')}
            </p>
          ) : (
            <p style={{ color: 'var(--danger-text)', fontSize: '0.88rem' }}>
              No power verbs identified. Use assertive verbs like Architected, Spearheaded, Optimized.
            </p>
          )}
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
            📊 Quantified Metrics Detected ({metricsFound.length})
          </div>
          {metricsFound.length > 0 ? (
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {metricsFound.slice(0, 6).map((m, idx) => (
                <li key={idx}><code>{m}</code></li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--danger-text)', fontSize: '0.88rem' }}>
              No quantified metrics detected. Add numbers, percentages, or dollar values to prove impact.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
