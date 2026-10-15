import React from 'react';

export default function SkillsMatrix({ results }) {
  if (!results) return null;

  const { skill_comparison, jd_keywords, resume_keywords } = results;
  const matched = skill_comparison?.matched_skills || [];
  const missing = skill_comparison?.missing_skills || [];
  const bonus = skill_comparison?.bonus_skills || [];

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Matched Skills */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: '0.8rem' }}>
            ✅ Matched Skills ({matched.length})
          </div>
          {matched.length > 0 ? (
            <div>
              {matched.map((s) => (
                <span key={s} className="badge badge-matched">
                  ✓ {s}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No direct skill matches detected.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger-text)', marginBottom: '0.8rem' }}>
            ❌ Missing Skill Gaps ({missing.length})
          </div>
          {missing.length > 0 ? (
            <div>
              {missing.map((s) => (
                <span key={s} className="badge badge-missing">
                  ✗ {s}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--success-text)', fontSize: '0.88rem', fontWeight: 600 }}>
              🎉 All required skills present on resume!
            </p>
          )}
        </div>

        {/* Bonus Skills */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--info-text)', marginBottom: '0.8rem' }}>
            🌟 Bonus Candidate Skills ({bonus.length})
          </div>
          {bonus.length > 0 ? (
            <div>
              {bonus.slice(0, 18).map((s) => (
                <span key={s} className="badge badge-bonus">
                  ★ {s}
                </span>
              ))}
              {bonus.length > 18 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                  +{bonus.length - 18} more
                </span>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No extra bonus skills detected.</p>
          )}
        </div>
      </div>

      {/* Salient TF-IDF Keywords */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🔑 Top TF-IDF Domain Keywords
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Job Description Salience
            </h4>
            {jd_keywords && jd_keywords.length > 0 ? (
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {jd_keywords.slice(0, 8).map(([kw, score]) => (
                  <li key={kw} style={{ marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{kw}</strong> (score: {score.toFixed(3)})
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No keywords extracted.</p>
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Resume Salience
            </h4>
            {resume_keywords && resume_keywords.length > 0 ? (
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {resume_keywords.slice(0, 8).map(([kw, score]) => (
                  <li key={kw} style={{ marginBottom: 4 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{kw}</strong> (score: {score.toFixed(3)})
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No keywords extracted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
