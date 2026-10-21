import React, { useRef, useEffect, useState } from 'react';
import MarkdownRenderer, { CopyButton } from './MarkdownRenderer';

export default function AiChatCopilot({
  messages,
  onSendMessage,
  loading,
  results,
  apiKey,
  onApiKeyChange,
}) {
  const [input, setInput] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey || '');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;
    onSendMessage(query);
    setInput('');
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (onApiKeyChange) {
      onApiKeyChange(localKey.trim());
    }
    setShowKeyConfig(false);
  };

  const quickPrompts = [
    { label: '🎯 Missing skills', text: 'What are my missing skills and how should I incorporate them into my resume?' },
    { label: '✍️ Rewrite top bullet point', text: 'Rewrite my primary experience bullet point using the STAR method with high impact.' },
    { label: '📄 Draft Cover Letter', text: 'Draft a tailored cover letter for this role highlighting my matched strengths.' },
    { label: '🎤 4 Interview Questions', text: 'Give me high-probability technical and behavioral interview questions for this position and how to address my skill gaps.' },
    { label: '💰 Salary Negotiation', text: 'What salary and compensation strategy should I target based on my profile?' },
    { label: '🤝 Questions for Interviewer', text: 'What questions should I ask the interviewer at the end of the interview?' },
    { label: '📊 Explain match score', text: 'Why did I receive this match score and how can I raise it?' },
  ];

  return (
    <div className="chat-window">
      {/* Tab Chat Header Bar with Engine Status & Optional Key */}
      <div className="tab-chat-header">
        <div className="tab-chat-header-title">
          <img
            src="/logo.png"
            alt="HireLens AI"
            className="copilot-avatar-img"
            style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }}
          />
          <div>
            <strong>HireLens AI Copilot</strong>
            <span className="copilot-sub">Interactive Technical Career Coach & Resume Architect</span>
          </div>
        </div>

        <button
          type="button"
          className="api-config-toggle-btn"
          onClick={() => setShowKeyConfig(!showKeyConfig)}
        >
          ⚙️ {apiKey ? 'Custom Gemini Key Active' : 'API Key Settings'}
        </button>
      </div>

      {showKeyConfig && (
        <form className="chatbot-key-drawer" onSubmit={handleSaveKey} style={{ margin: '0 0 1rem 0' }}>
          <div className="drawer-title">
            🔑 <strong>Gemini Cloud API Key (Optional)</strong>
          </div>
          <p className="drawer-desc">
            HireLens runs 100% locally with high-precision NLP when no key is entered.
            To use live cloud Gemini LLM generation, provide your key below:
          </p>
          <div className="drawer-input-row">
            <input
              type="password"
              className="drawer-key-input"
              placeholder="AIzaSy..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
            <button type="submit" className="drawer-save-btn">
              Save Key
            </button>
          </div>
        </form>
      )}

      {/* Chat Messages History */}
      <div className="chat-history">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';
          const isGemini = m.source === 'gemini';

          return (
            <div key={idx} className={`chat-msg ${m.role}`}>
              <div className="msg-header-row">
                <span className="msg-author">
                  {isAssistant ? 'HireLens AI Copilot' : 'You'}
                </span>
                {isAssistant && (
                  <div className="msg-badges">
                    <span className={`engine-badge ${isGemini ? 'badge-gemini' : 'badge-local'}`}>
                      {isGemini ? '⚡ Gemini' : '🛡️ Local NLP'}
                    </span>
                    <CopyButton textToCopy={m.content} />
                  </div>
                )}
              </div>

              <div className="msg-body">
                {isAssistant ? (
                  <MarkdownRenderer content={m.content} />
                ) : (
                  <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="chat-msg assistant">
            <div className="msg-author" style={{ marginBottom: 6 }}>HireLens AI Copilot</div>
            <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Formulating tailored career coaching recommendations...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="chat-quick-prompts">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-pill"
            onClick={() => handleSend(p.text)}
            disabled={loading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="chat-input"
          placeholder="Ask HireLens AI anything about your resume, bullet rewrites, cover letters, or interview prep..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
