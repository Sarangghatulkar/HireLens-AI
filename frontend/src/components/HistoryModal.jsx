import React, { useEffect, useState } from 'react';
import { deleteScanRecord, getScanDetail, getUserScanHistory } from '../services/api';

export default function HistoryModal({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLoadScanIntoWorkspace,
}) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const data = await getUserScanHistory();
      setHistoryData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchHistory();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleLoadScan = async (scanId) => {
    setActionLoadingId(scanId);
    try {
      const detail = await getScanDetail(scanId);
      if (detail && detail.results) {
        onLoadScanIntoWorkspace(detail.results, detail.job_title);
        onClose();
      }
    } catch (err) {
      alert(`Could not load scan: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteScan = async (scanId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan from your history?')) {
      return;
    }

    try {
      await deleteScanRecord(scanId);
      // Optimistically update list
      setHistoryData((prev) => {
        if (!prev) return prev;
        const updatedScans = prev.scans.filter((s) => s.id !== scanId);
        const scores = updatedScans.map((s) => s.overall_score);
        const total = updatedScans.length;
        const avg = total > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / total) * 10) / 10 : 0;
        const highest = total > 0 ? Math.max(...scores) : 0;
        const improvement = total >= 2 ? Math.round((scores[0] - scores[scores.length - 1]) * 10) / 10 : 0;

        return {
          ...prev,
          scans: updatedScans,
          total_scans: total,
          average_score: avg,
          highest_score: highest,
          score_improvement: improvement,
        };
      });
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="history-brand-icon">📈</div>
            <div>
              <h2 className="modal-title">Resume Progression & Scan History</h2>
              <p className="modal-subtitle">
                Track how your resume match score, ATS compliance, and skill gaps evolve across iterations.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Guest / Unauthenticated State */}
        {!currentUser ? (
          <div className="history-guest-prompt">
            <div className="guest-badge-icon">🔐</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Authentication Required for History Tracking
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
              Sign in or create a free account to automatically save your evaluation scans to PostgreSQL/SQLite, observe score improvements across revisions, and restore past analyses with one click.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
            >
              Sign In / Register Now ⚡
            </button>
          </div>
        ) : loading ? (
          <div className="history-loading-container">
            <span className="spinner-lg" />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Fetching your evaluation history...
            </p>
          </div>
        ) : error ? (
          <div className="auth-error-banner" style={{ margin: '1.5rem 0' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="history-content-scroll">
            {/* Top Metric Cards */}
            <div className="progression-metrics-grid">
              <div className="progression-metric-card">
                <span className="metric-label">Total Evaluations</span>
                <span className="metric-val">{historyData?.total_scans || 0}</span>
                <span className="metric-sub">Stored in database</span>
              </div>

              <div className="progression-metric-card">
                <span className="metric-label">Average Match Score</span>
                <span className="metric-val highlight">
                  {historyData?.average_score ? `${historyData.average_score}%` : '—'}
                </span>
                <span className="metric-sub">Across all submissions</span>
              </div>

              <div className="progression-metric-card">
                <span className="metric-label">Highest Score Achieved</span>
                <span className="metric-val success">
                  {historyData?.highest_score ? `${historyData.highest_score}%` : '—'}
                </span>
                <span className="metric-sub">Peak benchmark</span>
              </div>

              <div className="progression-metric-card">
                <span className="metric-label">Score Progression</span>
                <span
                  className={`metric-val ${
                    (historyData?.score_improvement || 0) >= 0 ? 'success' : 'danger'
                  }`}
                >
                  {(historyData?.score_improvement || 0) > 0 ? `+${historyData.score_improvement}%` : `${historyData?.score_improvement || 0}%`}
                </span>
                <span className="metric-sub">
                  {(historyData?.score_improvement || 0) > 0
                    ? '📈 Positive trajectory'
                    : 'Iteration delta'}
                </span>
              </div>
            </div>

            {/* List of past scans */}
            <div className="history-scans-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Evaluation Timeline ({historyData?.scans?.length || 0})
                </h3>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={fetchHistory}
                  title="Refresh list"
                >
                  ↻ Refresh
                </button>
              </div>

              {!historyData?.scans || historyData.scans.length === 0 ? (
                <div className="history-empty-state">
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    No evaluations recorded yet
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 1.2rem auto' }}>
                    Run a resume scan in the workspace above. Each evaluation will automatically be saved and tracked here.
                  </p>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Go to Workspace
                  </button>
                </div>
              ) : (
                <div className="history-scans-list">
                  {historyData.scans.map((scan) => {
                    const isHigh = scan.overall_score >= 80;
                    const isMed = scan.overall_score >= 65 && scan.overall_score < 80;
                    const scoreClass = isHigh ? 'score-high' : isMed ? 'score-med' : 'score-low';

                    return (
                      <div key={scan.id} className="history-card-item">
                        <div className="history-card-header">
                          <div className="history-role-group">
                            <span className="history-job-title">{scan.job_title || 'Target Role'}</span>
                            <span className="history-candidate-name">• {scan.candidate_name || 'Candidate'}</span>
                          </div>
                          <div className="history-timestamp">{formatDate(scan.created_at)}</div>
                        </div>

                        <div className="history-card-body">
                          {/* Score Pill */}
                          <div className={`history-score-pill ${scoreClass}`}>
                            <span className="history-score-number">{scan.overall_score}%</span>
                            <span className="history-score-tier">{scan.tier_label}</span>
                          </div>

                          {/* Sub metrics */}
                          <div className="history-submetrics">
                            <span className="history-sub-tag">
                              ATS: <strong>{scan.ats_score}%</strong>
                            </span>
                            <span className="history-sub-tag">
                              Skills: <strong>{scan.skill_score}%</strong>
                            </span>
                          </div>

                          {/* Matched & Missing Skill Preview */}
                          <div className="history-skills-preview">
                            {scan.matched_skills && scan.matched_skills.length > 0 && (
                              <div className="history-skill-row">
                                <span className="history-skill-label">Matched:</span>
                                {scan.matched_skills.slice(0, 3).map((sk) => (
                                  <span key={sk} className="history-matched-chip">
                                    {sk}
                                  </span>
                                ))}
                                {scan.matched_skills.length > 3 && (
                                  <span className="history-chip-more">+{scan.matched_skills.length - 3}</span>
                                )}
                              </div>
                            )}

                            {scan.missing_skills && scan.missing_skills.length > 0 && (
                              <div className="history-skill-row">
                                <span className="history-skill-label">Gaps:</span>
                                {scan.missing_skills.slice(0, 3).map((sk) => (
                                  <span key={sk} className="history-missing-chip">
                                    {sk}
                                  </span>
                                ))}
                                {scan.missing_skills.length > 3 && (
                                  <span className="history-chip-more">+{scan.missing_skills.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="history-card-actions">
                            <button
                              type="button"
                              className="btn btn-primary history-load-btn"
                              onClick={() => handleLoadScan(scan.id)}
                              disabled={actionLoadingId === scan.id}
                              title="Load this scan's complete analysis into workspace"
                            >
                              {actionLoadingId === scan.id ? (
                                <>
                                  <span className="spinner-sm" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  <span>🚀</span>
                                  <span>Load Scan</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="history-delete-btn"
                              onClick={(e) => handleDeleteScan(scan.id, e)}
                              title="Delete from history"
                              aria-label="Delete scan"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <div className="history-footer-status">
            <span>💾 Persistent storage: PostgreSQL / SQLite with SQLAlchemy ORM</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
