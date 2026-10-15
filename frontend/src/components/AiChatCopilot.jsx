import React, { useRef, useEffect, useState } from 'react';

export default function AiChatCopilot({
  messages,
  onSendMessage,
  loading,
  results,
}) {
  const [input, setInput] = useState('');
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

  const quickPrompts = [
    { label: '🎯 Missing skills', text: 'What are my missing skills and how should I incorporate them into my resume?' },
    { label: '✍️ Rewrite top bullet point', text: 'Rewrite my primary experience bullet point using the STAR method with high impact.' },
    { label: '📊 Explain my match score', text: 'Why did I receive this match score and how can I raise it?' },
    { label: '🎤 3 Interview Questions', text: 'Give me 3 technical interview questions for this position and how to address my skill gaps.' },
  ];

  return (
    <div className="chat-window">
      {/* Chat Messages History */}
      <div className="chat-history">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-msg ${m.role}`}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: 4, opacity: 0.8 }}>
              {m.role === 'user' ? 'You' : 'HireLens AI Copilot'}
            </div>
            <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              HireLens AI is thinking and formulating recommendations...
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
          placeholder="Ask HireLens AI anything about your resume, bullet rewrites, or interview prep..."
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
