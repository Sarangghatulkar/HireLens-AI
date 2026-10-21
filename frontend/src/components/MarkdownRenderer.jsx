import React, { useState } from 'react';

/**
 * Parses inline markdown (bold, italic, code).
 */
function renderInline(text) {
  if (!text) return null;

  // Split by inline code first
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={pIdx} className="md-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Split by bold (**text**)
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={`${pIdx}-${bIdx}`} className="md-bold">
            {bPart.slice(2, -2)}
          </strong>
        );
      }

      // Split by italic (*text*)
      const italicParts = bPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, iIdx) => {
        if (iPart.startsWith('*') && iPart.endsWith('*')) {
          return (
            <em key={`${pIdx}-${bIdx}-${iIdx}`} className="md-italic">
              {iPart.slice(1, -1)}
            </em>
          );
        }
        return iPart;
      });
    });
  });
}

/**
 * Rich, fast Markdown renderer for AI Copilot chat messages.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = null;
  let currentListType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (currentList && currentList.length > 0) {
      if (currentListType === 'ol') {
        elements.push(
          <ol key={`list-${elements.length}`} className="md-ol">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="md-ul">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = null;
      currentListType = null;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${idx}`} className="md-h4">
          {renderInline(line.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h2-${idx}`} className="md-h3">
          {renderInline(line.replace(/^##\s+/, ''))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`quote-${idx}`} className="md-quote">
          {renderInline(line.replace(/^>\s+/, ''))}
        </blockquote>
      );
      return;
    }

    // Unordered List (- or *)
    if (/^[\-\*•]\s+/.test(line)) {
      const itemText = line.replace(/^[\-\*•]\s+/, '');
      if (currentListType && currentListType !== 'ul') flushList();
      currentListType = 'ul';
      if (!currentList) currentList = [];
      currentList.push(itemText);
      return;
    }

    // Ordered List (1. 2. etc.)
    if (/^\d+\.\s+/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, '');
      if (currentListType && currentListType !== 'ol') flushList();
      currentListType = 'ol';
      if (!currentList) currentList = [];
      currentList.push(itemText);
      return;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="md-p">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className="markdown-content">{elements}</div>;
}

/**
 * Copy to clipboard button component with feedback animation.
 */
export function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`copy-msg-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      title="Copy message to clipboard"
    >
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}
