import React from 'react';

export default function SpotlightRightWrong({ results }) {
  if (!results) return null;

  const { skill_comparison, ats_audit } = results;
  const matchedSkills = skill_comparison?.matched_skills || [];
  const missingSkills = skill_comparison?.missing_skills || [];
  const powerVerbs = ats_audit?.action_verbs_found || [];
  const weakPhrases = ats_audit?.weak_phrases_found || [];
  const metricsFound = ats_audit?.metrics_found || [];

  return (
    <div className="spotlight-container">
      {/* What's Right */}
      <div className="spotlight-card right">
        <div className="spotlight-title right">
          <span>✅</span> What's Right (Strengths & Verified Highlights)
        </div>

        <div className="spotlight-item">
          <strong>🎯 Core Skills Matched ({matchedSkills.length} skills):</strong>
          <br />
          {matchedSkills.length > 0 ? (
            <span>Directly aligns with requirements: <em>{matchedSkills.slice(0, 7).join(', ')}</em></span>
          ) : (
            <span>General background overlap detected.</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>🚀 Power Action Verbs ({powerVerbs.length} detected):</strong>
          <br />
          {powerVerbs.length > 0 ? (
            <span>Assertive leadership language: <em>{powerVerbs.slice(0, 6).join(', ')}</em></span>
          ) : (
            <span>Some standard professional action language used.</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>📈 Measurable Impact ({metricsFound.length} metrics):</strong>
          <br />
          {metricsFound.length > 0 ? (
            <span>Concrete results & KPIs found: <em>{metricsFound.slice(0, 4).join(', ')}</em></span>
          ) : (
            <span>Demonstrates business achievements across experience.</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>📋 ATS Structure Health ({ats_audit?.ats_score}% - {ats_audit?.status}):</strong>
          <br />
          Experience, Education, and Skills sections are clearly detected and parsable.
        </div>
      </div>

      {/* What's Wrong */}
      <div className="spotlight-card wrong">
        <div className="spotlight-title wrong">
          <span>❌</span> What's Wrong (Gaps, Red Flags & Areas to Fix)
        </div>

        <div className="spotlight-item">
          <strong>⚠️ Missing Required Skills ({missingSkills.length} gaps):</strong>
          <br />
          {missingSkills.length > 0 ? (
            <span>Specifically demanded by posting: <em>{missingSkills.slice(0, 6).join(', ')}</em></span>
          ) : (
            <span>None! 100% of required skills detected.</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>🔍 Phrasing & Passive Language:</strong>
          <br />
          {weakPhrases.length > 0 ? (
            <span>Passive duty phrases detected: <em>{weakPhrases.join(', ')}</em>. Replace with active leadership verbs.</span>
          ) : (
            <span>No weak duty phrases detected. Good active tone!</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>📊 Quantified Impact Check:</strong>
          <br />
          {metricsFound.length < 3 ? (
            <span>Only {metricsFound.length} metric(s) detected. Target at least 3-4 (e.g. percentages, scale, revenue impact).</span>
          ) : (
            <span>Solid metric presence across bullet points.</span>
          )}
        </div>

        <div className="spotlight-item">
          <strong>📏 Resume Word Count ({ats_audit?.word_count} words):</strong>
          <br />
          {ats_audit?.word_count < 350 ? (
            <span>Resume is on the shorter side. Expand on project accomplishments to increase keyword density.</span>
          ) : ats_audit?.word_count > 1000 ? (
            <span>Resume is slightly lengthy. Consider condensing older roles for rapid 10-second recruiter scanning.</span>
          ) : (
            <span>Optimal length for technical and ATS scanning (350–900 words).</span>
          )}
        </div>
      </div>
    </div>
  );
}
