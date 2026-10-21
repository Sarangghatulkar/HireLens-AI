import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Workspace from './components/Workspace';
import SpotlightRightWrong from './components/SpotlightRightWrong';
import ScoreOverview from './components/ScoreOverview';
import StrengthsWeaknessesDetail from './components/StrengthsWeaknessesDetail';
import SkillsMatrix from './components/SkillsMatrix';
import AtsAudit from './components/AtsAudit';
import AiChatCopilot from './components/AiChatCopilot';
import Inspector from './components/Inspector';
import FloatingChatbot from './components/FloatingChatbot';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import {
  analyzeResume,
  clearAuthToken,
  downloadReport,
  getUserProfile,
  sendChatMessage,
  uploadResume,
} from './services/api';

const INITIAL_COPILOT_MESSAGE = {
  role: 'assistant',
  content:
    "👋 **Hello! I'm your HireLens AI Copilot.**\n\nUpload your resume (PDF or TXT) and paste your target job description to start. Ask me anything about resume improvement, STAR bullet rewrites, or technical interview questions!",
};

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [enablePii, setEnablePii] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // User Authentication & History States
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Auto-authenticate on mount if token is stored in localStorage
  useEffect(() => {
    async function initUser() {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setCurrentUser(profile);
        }
      } catch {
        // Guest mode fallback
      }
    }
    initUser();
  }, []);

  // Optional Custom Gemini API Key State
  const [userApiKey, setUserApiKey] = useState(() => {
    try {
      return localStorage.getItem('hirelens_gemini_api_key') || '';
    } catch {
      return '';
    }
  });

  const handleApiKeyChange = (newKey) => {
    setUserApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem('hirelens_gemini_api_key', newKey);
      } else {
        localStorage.removeItem('hirelens_gemini_api_key');
      }
    } catch {
      // Ignore localStorage restrictions
    }
  };

  // Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([INITIAL_COPILOT_MESSAGE]);
  const [chatLoading, setChatLoading] = useState(false);

  // Handle File Upload
  const handleUploadFile = async (file) => {
    setUploading(true);
    try {
      const data = await uploadResume(file);
      if (data.success) {
        setResumeText(data.text);
        setSourceName(data.filename);
        setResults(null);
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle Full Analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      alert('Please provide both resume text and a target job description.');
      return;
    }
    setLoading(true);

    try {
      const data = await analyzeResume({
        resumeText,
        jdText,
        jobTitle,
        apiKey: userApiKey,
      });

      setResults(data);
      setActiveTab('overview');

      if (currentUser) {
        setSaveNotification('✨ Evaluation saved to your profile scan history!');
        setTimeout(() => setSaveNotification(''), 4500);
      }

      // Update chat initial message with tailored findings
      const overall = data.score_data?.overall_score || 0;
      const topMiss = (data.skill_comparison?.missing_skills || []).slice(0, 4).join(', ') || 'none';
      setChatMessages([
        {
          role: 'assistant',
          content: `🎯 **Analysis Complete!** Your resume achieved a **${overall}% match score** (${data.score_data?.tier_label}).\n\n- **Matched Skills:** ${data.skill_comparison?.matched_count} detected\n- **Skill Gaps:** ${data.skill_comparison?.missing_count} missing (${topMiss})\n- **ATS Readiness:** ${data.ats_audit?.ats_score}% (${data.ats_audit?.status})\n\nHow would you like to optimize your application? Ask me below or pick one of the quick prompts!`,
        },
      ]);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setSaveNotification('You have been signed out.');
    setTimeout(() => setSaveNotification(''), 3000);
  };

  // Handle Loading Historical Scan into Workspace
  const handleLoadScanIntoWorkspace = (savedResults, targetJobTitle) => {
    setResults(savedResults);
    if (targetJobTitle) setJobTitle(targetJobTitle);
    setActiveTab('overview');
    setSaveNotification(`🚀 Restored evaluation for "${targetJobTitle || 'Target Role'}" into workspace.`);
    setTimeout(() => setSaveNotification(''), 4000);

    const overall = savedResults.score_data?.overall_score || 0;
    const topMiss = (savedResults.skill_comparison?.missing_skills || []).slice(0, 4).join(', ') || 'none';
    setChatMessages([
      {
        role: 'assistant',
        content: `🎯 **Restored Historical Scan: ${savedResults.candidate_name || 'Candidate'}** (${targetJobTitle || 'Target Role'})\n\n- **Overall Score:** ${overall}% (${savedResults.score_data?.tier_label || 'Evaluation'})\n- **Missing Skills:** ${topMiss}\n- **ATS Score:** ${savedResults.ats_audit?.ats_score || 'N/A'}%\n\nYou can now examine strengths/weaknesses, export the PDF report, or ask me for specific bullet point rewrites!`,
      },
    ]);

    setTimeout(() => {
      const el = document.getElementById('results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Handle Chat Message
  const handleSendMessage = async (userText) => {
    const updatedMessages = [...chatMessages, { role: 'user', content: userText }];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const data = await sendChatMessage({
        messages: updatedMessages,
        resumeText,
        jdText,
        analysisResults: results,
        apiKey: userApiKey,
      });

      if (data.response) {
        setChatMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: data.response,
            source: data.source || 'offline_nlp_engine',
            model: data.model,
          },
        ]);
      } else {
        setChatMessages([
          ...updatedMessages,
          { role: 'assistant', content: 'Sorry, I encountered an error formulating a response.' },
        ]);
      }
    } catch (err) {
      setChatMessages([
        ...updatedMessages,
        { role: 'assistant', content: `Network error: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Reset Chat Conversation
  const handleResetChat = () => {
    setChatMessages([INITIAL_COPILOT_MESSAGE]);
  };

  // Handle PDF Report Download
  const handleDownloadPdf = async () => {
    if (!results) return;
    setDownloadingPdf(true);

    try {
      const blob = await downloadReport({
        candidateName: enablePii ? 'Candidate (Masked)' : results.candidate_name,
        jobTitle: jobTitle || 'Target Role',
        scoreData: results.score_data,
        skillData: results.skill_comparison,
        atsData: results.ats_audit,
        recommendations: results.rule_recs,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (results.candidate_name || 'candidate').toLowerCase().replace(/\s+/g, '_');
      a.download = `hirelens_ai_report_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`PDF download error: ${err.message}`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header
        isChatbotOpen={isChatbotOpen}
        onToggleChatbot={() => setIsChatbotOpen(!isChatbotOpen)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Floating Save/Status Notification Toast */}
      {saveNotification && (
        <div className="save-toast-banner" role="status">
          <span>{saveNotification}</span>
        </div>
      )}

      <main className="main-content">
        {/* Hero Section */}
        <Hero
          onStartClick={() => {
            const el = document.getElementById('workspace-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Workspace: Upload Resume & Job Description */}
        <Workspace
          resumeText={resumeText}
          setResumeText={setResumeText}
          jdText={jdText}
          setJdText={setJdText}
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          onAnalyze={handleAnalyze}
          loading={loading}
          uploading={uploading}
          onUploadFile={handleUploadFile}
          sourceName={sourceName}
        />

        {/* Results Section */}
        {results && (
          <div id="results-section">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.2rem' }}>
              📊 Analysis Diagnosis & Evaluation
            </h2>

            {/* Spotlight: What's Right vs What's Wrong */}
            <SpotlightRightWrong results={results} />

            {/* Tabs Navigation */}
            <div className="tabs-header">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Match Overview
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'strengths' ? 'active' : ''}`}
                onClick={() => setActiveTab('strengths')}
              >
                ⚖️ Strengths & Weaknesses
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                🎯 Skills & Keywords
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'ats' ? 'active' : ''}`}
                onClick={() => setActiveTab('ats')}
              >
                📋 ATS & Formatting
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 Talk with AI Copilot
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
                onClick={() => setActiveTab('inspector')}
              >
                🔍 Text & Privacy Inspector
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'overview' && (
              <ScoreOverview
                results={results}
                onDownloadPdf={handleDownloadPdf}
                downloadingPdf={downloadingPdf}
              />
            )}
            {activeTab === 'strengths' && <StrengthsWeaknessesDetail results={results} />}
            {activeTab === 'skills' && <SkillsMatrix results={results} />}
            {activeTab === 'ats' && <AtsAudit results={results} />}
            {activeTab === 'chat' && (
              <AiChatCopilot
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                loading={chatLoading}
                results={results}
                apiKey={userApiKey}
                onApiKeyChange={handleApiKeyChange}
              />
            )}
            {activeTab === 'inspector' && (
              <Inspector resumeText={resumeText} jdText={jdText} enablePii={enablePii} />
            )}
          </div>
        )}
      </main>

      {/* Persistent Floating AI Career Copilot Chatbot */}
      <FloatingChatbot
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        loading={chatLoading}
        results={results}
        resumeText={resumeText}
        jdText={jdText}
        onResetChat={handleResetChat}
        apiKey={userApiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      {/* User Authentication Modal (Login & Registration) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setSaveNotification(`👋 Welcome, ${user.full_name || user.email}!`);
          setTimeout(() => setSaveNotification(''), 4000);
        }}
      />

      {/* Scan History & Score Progression Analytics Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLoadScanIntoWorkspace={handleLoadScanIntoWorkspace}
      />
    </div>
  );
}
