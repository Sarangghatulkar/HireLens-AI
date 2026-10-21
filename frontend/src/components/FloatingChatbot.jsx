import React, { useRef, useEffect, useState } from 'react';
import MarkdownRenderer, { CopyButton } from './MarkdownRenderer';

export default function FloatingChatbot({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  loading,
  results,
  resumeText,
  jdText,
  onResetChat,
  apiKey,
  onApiKeyChange,
}) {
  const [input, setInput] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey || '');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

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
    { label: '✍️ STAR bullet rewrite', text: 'Rewrite my primary experience bullet point using the STAR method with high impact.' },
    { label: '📄 Cover Letter', text: 'Can you write a tailored cover letter for this role highlighting my matched strengths?' },
    { label: '🎤 4 Interview questions', text: 'Give me high-probability technical and behavioral interview questions for this position and how to address my skill gaps.' },
    { label: '💰 Salary negotiation', text: 'What salary and compensation strategy should I target based on my profile?' },
    { label: '🤝 Ask interviewer', text: 'What questions should I ask the interviewer at the end of the interview?' },
    { label: '📊 Explain match score', text: 'Why did I receive this match score and how can I raise it?' },
  ];

  const hasContext = Boolean(resumeText.trim() || results);

  return (
    <div className="floating-chatbot-container">
      {/* Floating Trigger Button (when closed) */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-trigger-btn"
          onClick={onToggle}
          title="Open AI Career Copilot Chat"
          id="open-chatbot-btn"
        >
          <span className="trigger-pulse-dot" />
          <span className="trigger-icon">💬</span>
          <span className="trigger-text">AI Career Copilot</span>
        </button>
      )}

      {/* Floating Chat Window (when open) */}
      {isOpen && (
        <div className="chatbot-window" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-brand">
              <div className="chatbot-avatar">
                <img
                  src="/logo.png"
                  alt="HireLens AI"
                  className="chat-avatar-logo"
                  style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }}
                />
                <span className="online-indicator" />
              </div>
              <div>
                <div className="chatbot-title">HireLens AI Copilot</div>
                <div className="chatbot-status">
                  {results ? '⚡ Context Active' : '🟢 Ready to Assist'}
                </div>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className={`chatbot-icon-btn ${showKeyConfig ? 'active-icon-btn' : ''}`}
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                title="Configure Gemini API Key"
              >
                ⚙️
              </button>
              {onResetChat && (
                <button
                  type="button"
                  className="chatbot-icon-btn"
                  onClick={onResetChat}
                  title="Reset Chat"
                >
                  🔄
                </button>
              )}
              <button
                type="button"
                className="chatbot-icon-btn close-btn"
                onClick={onToggle}
                title="Minimize Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showKeyConfig && (
            <form className="chatbot-key-drawer" onSubmit={handleSaveKey}>
              <div className="drawer-title">
                🔑 <strong>Gemini Cloud API Key (Optional)</strong>
              </div>
              <p className="drawer-desc">
                Leave empty to use HireLens Local Dynamic NLP (100% Free & Private).
                Or enter your Google Gemini key for live cloud LLM reasoning:
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
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Context Banner */}
          <div className="chatbot-context-banner">
            {results ? (
              <span>
                🎯 <strong>Context Linked:</strong> {results.score_data?.overall_score}% Match Score ({results.score_data?.tier_label})
              </span>
            ) : hasContext ? (
              <span>
                📄 <strong>Context Linked:</strong> Resume loaded ({resumeText.split(/\s+/).filter(Boolean).length} words)
              </span>
            ) : (
              <span>
                💡 <em>Tip: Upload resume and paste job description above for personalized coaching!</em>
              </span>
            )}
          </div>

          {/* Chat Messages History */}
          <div className="chatbot-history">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              const isGemini = m.source === 'gemini';

              return (
                <div key={idx} className={`chatbot-msg ${m.role}`}>
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
              <div className="chatbot-msg assistant thinking">
                <div className="msg-author">HireLens AI Copilot</div>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="chatbot-quick-prompts">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbot-pill"
                onClick={() => handleSend(p.text)}
                disabled={loading}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            className="chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask anything about resume, skills, STAR bullets, cover letters..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={loading || !input.trim()}
              title="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
