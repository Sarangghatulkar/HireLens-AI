import React from 'react';

export default function Header({
  onToggleChatbot,
  isChatbotOpen,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenHistory,
}) {
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'HL';
  };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="nav-brand">
          <img
            src="/logo.png"
            alt="HireLens AI"
            className="brand-logo-img"
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px' }}
          />
          <div>
            <span className="brand-title">HireLens AI</span>
          </div>
        </a>

        <div className="nav-actions">
          {/* Scan History & Progression Button */}
          <button
            type="button"
            className="nav-toggle-btn"
            onClick={onOpenHistory}
            title="View Resume Score Progression & Saved Scans"
            id="nav-history-btn"
          >
            <span>📈</span>
            <span>History & Progression</span>
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

          {/* Authentication Section */}
          {currentUser ? (
            <div className="nav-user-profile">
              <div className="nav-user-avatar" title={currentUser.email}>
                {getInitials(currentUser.full_name, currentUser.email)}
              </div>
              <div className="nav-user-info">
                <span className="nav-user-name">
                  {currentUser.full_name || currentUser.email.split('@')[0]}
                </span>
              </div>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={onLogout}
                title="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary nav-signin-btn"
              onClick={onOpenAuth}
              id="nav-auth-btn"
            >
              <span>👤</span>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

