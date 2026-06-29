import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const getLangColor = (lang: string): string => {
    const colors: { [key: string]: string } = {
      lua: '#51a0cf',
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      bash: '#4eaa25',
      json: '#f5f5f5',
      html: '#e34c26',
      css: '#563d7c',
    };
    return colors[lang.toLowerCase()] || '#888';
  };

  return (
    <div className="code-card-manus">
      <div className="code-card-header">
        <div className="code-lang-badge">
          <span 
            className="code-lang-dot" 
            style={{ backgroundColor: getLangColor(language) }}
          ></span>
          <span className="code-lang">{language || 'code'}</span>
        </div>
        <button className="copy-btn-manus" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check size={14} /> <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} /> <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-card-body">
        <pre className={`language-${language}`}>
          <code className={`language-${language}`}>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
