import React from 'react';

export default function StrengthsWeaknessesDetail({ results }) {
  if (!results) return null;

  const { skill_comparison, ats_audit, rule_recs } = results;
  const matched = skill_comparison?.matched_skills || [];
  const missing = skill_comparison?.missing_skills || [];
  const bonus = skill_comparison?.bonus_skills || [];
  const powerVerbs = ats_audit?.action_verbs_found || [];
  const weakPhrases = ats_audit?.weak_phrases_found || [];
  const metricsFound = ats_audit?.metrics_found || [];
  const starExamples = rule_recs?.star_examples || [];

  return (
    <div>
      {/* Side-by-side granular breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Strengths Column */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ color: 'var(--success-text)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            🟢 Verified Strengths & Highlights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <strong>🎯 Relevancy Alignment ({matched.length} Skills):</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Matches target technologies: <em>{matched.slice(0, 8).join(', ') || 'General domain match'}</em>.
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <strong>🚀 Assertive Leadership ({powerVerbs.length} Power Verbs):</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Identified proactive verbs: <em>{powerVerbs.slice(0, 6).join(', ') || 'Standard active verbs'}</em>.
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <strong>📈 Verified Business Impact ({metricsFound.length} Metrics):</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Quantified achievements: <em>{metricsFound.slice(0, 4).join(', ') || 'Results oriented'}</em>.
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#F0FDF4', borderRadius: 'var(--radius-md)' }}>
              <strong>🌟 Bonus Value ({bonus.length} Extra Skills):</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Additional competencies not required by JD: <em>{bonus.slice(0, 5).join(', ')}</em>.
              </div>
            </div>
          </div>
        </div>

        {/* Weaknesses Column */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ color: 'var(--danger-text)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            🔴 Critical Gaps & Areas for Improvement
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
              <strong>⚠️ Missing Technical Prerequisites ({missing.length} Gaps):</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Demanded by hiring team: <em>{missing.slice(0, 6).join(', ') || 'None identified'}</em>.
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
              <strong>🔍 Duty Phrasing & Passive Language:</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {weakPhrases.length > 0 ? (
                  <span>Passive phrases detected: <em>{weakPhrases.join(', ')}</em>.</span>
                ) : (
                  <span>No weak phrases detected.</span>
                )}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
              <strong>📊 Metric Sparsity Check:</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {metricsFound.length < 3
                  ? `Only ${metricsFound.length} metric(s) found. Quantify project outcomes with % and $ to increase callback rate.`
                  : 'Good quantified coverage.'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: '#FEF2F2', borderRadius: 'var(--radius-md)' }}>
              <strong>📋 Executive Summary Check:</strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {!ats_audit?.sections_check?.['Summary / Objective']
                  ? 'Missing tailored summary header. Add a 2-line executive summary at the top.'
                  : 'Professional summary header detected.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAR Method Transformation Examples */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          ✍️ STAR Method Transformation Guide (Before vs. After)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {starExamples.map((ex, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
              }}
            >
              <div style={{ color: 'var(--danger-text)', fontSize: '0.88rem', marginBottom: 4 }}>
                <strong>❌ Weak / Duty:</strong> {ex.weak}
              </div>
              <div style={{ color: 'var(--success-text)', fontSize: '0.9rem', fontWeight: 500 }}>
                <strong>✅ High-Impact (STAR):</strong> {ex.strong}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prioritized Action Plan */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🚀 Prioritized Action Plan (Step-by-Step Fixes)
        </h4>

        {rule_recs?.critical_fixes?.map((rec, idx) => (
          <div key={`crit-${idx}`} className="rec-box critical">
            <strong style={{ color: 'var(--danger-text)' }}>[CRITICAL] {rec.title}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0' }}>{rec.desc}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--danger-text)', fontStyle: 'italic' }}>
              Impact: {rec.impact}
            </span>
          </div>
        ))}

        {rule_recs?.skill_enhancements?.map((rec, idx) => (
          <div key={`skill-${idx}`} className="rec-box skill">
            <strong style={{ color: 'var(--warning-text)' }}>[SKILL GAP] {rec.title}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0' }}>{rec.desc}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--warning-text)', fontStyle: 'italic' }}>
              Impact: {rec.impact}
            </span>
          </div>
        ))}

        {rule_recs?.polish_tips?.map((rec, idx) => (
          <div key={`pol-${idx}`} className="rec-box polish">
            <strong style={{ color: 'var(--success-text)' }}>[POLISH] {rec.title}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0' }}>{rec.desc}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--success-text)', fontStyle: 'italic' }}>
              Impact: {rec.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
