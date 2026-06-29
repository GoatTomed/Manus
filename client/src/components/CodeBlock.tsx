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

  return (
    <div className="code-card-manus">
      <div className="code-card-header">
        <span className="code-lang">{language || 'code'}</span>
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
