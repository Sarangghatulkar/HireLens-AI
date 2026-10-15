import React from 'react';

export default function Inspector({ resumeText, jdText, enablePii }) {
  // Simple client-side PII masking preview for demonstration
  const maskPiiText = (text) => {
    if (!text) return '';
    let masked = text.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[PROTECTED_EMAIL]'
    );
    masked = masked.replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
      '[PROTECTED_PHONE]'
    );
    return masked;
  };

  const displayResume = enablePii ? maskPiiText(resumeText) : resumeText;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Parsed Resume Text
          </h4>
          {enablePii && (
            <span style={{ fontSize: '0.78rem', color: 'var(--success-text)', fontWeight: 600 }}>
              🔒 PII Masking Active
            </span>
          )}
        </div>
        <textarea
          className="text-area"
          value={displayResume}
          readOnly
          style={{ height: '380px', background: 'var(--bg-surface-secondary)' }}
        />
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Target Job Description Text
          </h4>
        </div>
        <textarea
          className="text-area"
          value={jdText}
          readOnly
          style={{ height: '380px', background: 'var(--bg-surface-secondary)' }}
        />
      </div>
    </div>
  );
}
