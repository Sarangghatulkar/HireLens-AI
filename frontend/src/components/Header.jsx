import React from 'react';

export default function Header({
  enablePii,
  onTogglePii,
  onToggleChatbot,
  isChatbotOpen,
}) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="nav-brand">
          <div className="brand-icon">HL</div>
          <div>
            <span className="brand-title">HireLens AI</span>
            <span className="brand-badge" style={{ marginLeft: 8 }}>
              SaaS Edition
            </span>
          </div>
        </a>

        <div className="nav-actions">
          {/* PII Toggle */}
          <button
            type="button"
            className={`nav-toggle-btn ${enablePii ? 'active' : ''}`}
            onClick={onTogglePii}
            title="Mask candidate email & phone for privacy"
          >
            <span>{enablePii ? '🔒' : '🔓'}</span>
            <span>{enablePii ? 'PII Masked' : 'Mask PII'}</span>
          </button>

          {/* AI Career Copilot Chatbot Button */}
          <button
            type="button"
            className={`nav-toggle-btn ${isChatbotOpen ? 'active' : ''}`}
            onClick={onToggleChatbot}
            title="Open AI Career Copilot Chatbot"
            id="nav-chatbot-btn"
          >
            <span>💬</span>
            <span>{isChatbotOpen ? 'Close Chat' : 'Chat with AI'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
