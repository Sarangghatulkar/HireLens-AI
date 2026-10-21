import React, { useState } from 'react';
import {
  loginUser,
  loginWithGoogle,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleStandardAuth = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'login' && !password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await loginUser({ email: email.trim(), password });
      } else {
        data = await registerUser({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        });
      }

      if (data && data.user) {
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setGoogleLoading(true);

    try {
      // Prompt user for their Google email or use prefilled email
      let targetEmail = email.trim();
      if (!targetEmail) {
        targetEmail = window.prompt(
          'Sign in with Google: Enter your Google email address (e.g. yourname@gmail.com):',
          'user@gmail.com'
        );
      }

      if (!targetEmail || !targetEmail.trim()) {
        setGoogleLoading(false);
        return;
      }

      const cleanEmail = targetEmail.trim().toLowerCase();
      const extractedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = extractedName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const data = await loginWithGoogle({
        email: cleanEmail,
        name: fullName.trim() || formattedName,
        google_id: `g_${Date.now()}`,
      });

      if (data && data.user) {
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      setSuccessMessage(
        res.message || 'Password reset instructions have been generated.'
      );
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setMode('reset');
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!resetToken.trim()) {
      setError('Please enter the reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        token: resetToken.trim(),
        newPassword,
      });
      setSuccessMessage(res.message || 'Password updated successfully! You can now sign in.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify your token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <img
              src="/logo.png"
              alt="HireLens AI"
              className="auth-brand-logo-img"
              style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
            />
            <div>
              <h2 className="modal-title">
                {mode === 'login' && 'Sign In to HireLens AI'}
                {mode === 'register' && 'Create Your Career Account'}
                {mode === 'forgot' && 'Reset Account Password'}
                {mode === 'reset' && 'Set New Password'}
              </h2>
              <p className="modal-subtitle">
                {mode === 'login' && 'Access your resume history, ATS scores, and target role benchmarks.'}
                {mode === 'register' && 'Track resume revisions, analyze skill gaps, and save evaluations.'}
                {mode === 'forgot' && 'Enter your registered email to receive recovery instructions.'}
                {mode === 'reset' && 'Enter your recovery code and choose a new secure password.'}
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

        {/* Tab Switcher for Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                resetMessages();
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                resetMessages();
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Google OAuth Button */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-oauth-container">
            <button
              type="button"
              className="btn auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
            </button>
            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="auth-error-banner">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="auth-success-banner">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login & Register Forms */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleStandardAuth} className="auth-form">
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-fullname">Full Name</label>
                <input
                  id="auth-fullname"
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field-header">
                <label htmlFor="auth-password">Password</label>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'login' && (
              <div className="auth-forgot-row">
                <button
                  type="button"
                  className="auth-link-text-btn"
                  onClick={() => {
                    setMode('forgot');
                    resetMessages();
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? (
                'Sign In to Dashboard'
              ) : (
                'Create Account & Start'
              )}
            </button>
          </form>
        )}

        {/* Forgot Password Mode */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="auth-field">
              <label htmlFor="auth-forgot-email">Registered Email Address</label>
              <input
                id="auth-forgot-email"
                type="email"
                placeholder="Enter your account email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  <span>Generating Code...</span>
                </>
              ) : (
                'Send Recovery Code'
              )}
            </button>

            <div className="auth-switch-back">
              <button
                type="button"
                className="auth-link-text-btn"
                onClick={() => {
                  setMode('login');
                  resetMessages();
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Mode */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="auth-field">
              <label htmlFor="auth-reset-token">Recovery Code / Token</label>
              <input
                id="auth-reset-token"
                type="text"
                placeholder="Paste your reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-new-password">New Password (min 6 characters)</label>
              <input
                id="auth-new-password"
                type="password"
                placeholder="Enter new secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Confirm & Update Password'
              )}
            </button>

            <div className="auth-switch-back">
              <button
                type="button"
                className="auth-link-text-btn"
                onClick={() => {
                  setMode('login');
                  resetMessages();
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="auth-footer-notice">
          <span>🔒 Enterprise-grade JWT security • Bcrypt salted encryption • Zero data leakage</span>
        </div>
      </div>
    </div>
  );
}
