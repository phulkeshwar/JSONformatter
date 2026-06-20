import React, { useState, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { ViewerPanel } from './components/ViewerPanel';
import { 
  validateJSON, 
  formatJSON, 
  minifyJSON, 
  queryJSON, 
  validateJSONSchema, 
  diffLines, 
  DiffLine 
} from './utils/jsonUtils';
import './App.css';

const SAMPLE_JSON = `{
  "tool": "JSON Formatter",
  "built_by": "Phulkeshwar Mahto",
  "email": "phulkeshwar.e@gmail.com",
  "features": [
    "format",
    "minify",
    "validate",
    "tree-view",
    "jsonpath-query",
    "diff-check"
  ],
  "version": 1.0,
  "free": true,
  "built_for": "Digital Heroes"
}`;

const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["tool", "email", "version"],
  "properties": {
    "tool": { "type": "string" },
    "built_by": { "type": "string" },
    "email": { "type": "string" },
    "version": { "type": "number" },
    "free": { "type": "boolean" }
  }
}`;

const SAMPLE_DIFF_LEFT = `{
  "name": "Phulkeshwar Mahto",
  "role": "Developer Intern",
  "location": "Ranchi",
  "projects": ["WebRTC", "MERN"]
}`;

const SAMPLE_DIFF_RIGHT = `{
  "name": "Phulkeshwar Mahto",
  "role": "Full Stack Lead",
  "location": "Ranchi, Jharkhand",
  "projects": ["WebRTC", "MERN", "SaaS"]
}`;

type TabType = 'formatter' | 'diff' | 'schema';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('formatter');

  // Shared Configs
  const [indentOption, setIndentOption] = useState<string>('2');
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [isTreeView, setIsTreeView] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ Active Accordion
  const [faqActive, setFaqActive] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setFaqActive(faqActive === index ? null : index);
  };

  // Dynamic FAQ JSON-LD Injection for deep SEO
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a JSON Formatter and Validator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A JSON formatter parses a raw JSON string and prints it with clean indentation and indentation spacing to make it human-readable. A validator analyzes the syntax of the JSON string against RFC 8259 standards to ensure there are no trailing commas, missing braces, or invalid quotes."
          }
        },
        {
          "@type": "Question",
          "name": "Is my JSON data secure on this website?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. All parsing, validation, and formatting computations are executed locally inside your browser sandbox. None of your data is sent to external servers."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between JSONPath and JQ filters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "JSONPath is a query language used to select and extract specific nodes from a JSON structure (e.g. $.store.book[*].author). JQ is a more advanced CLI tool and query syntax that allows filtering, restructuring, and modifying JSON elements."
          }
        },
        {
          "@type": "Question",
          "name": "How does the side-by-side JSON Diff check work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Diff checker reformats both left and right JSON structures to a standard layout, sorts them if required, and then compares them line by line. It highlights additions, deletions, and updates side by side."
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld';
    script.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // 1. FORMATTER STATE
  const [rawJson, setRawJson] = useState<string>(SAMPLE_JSON);
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  
  // URL fetching
  const [urlInput, setUrlInput] = useState<string>(CleanURLPlaceholder());
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // JQ/JSONPath query state
  const [queryStr, setQueryStr] = useState<string>('');

  // 2. DIFF STATE
  const [diffLeft, setDiffLeft] = useState<string>(SAMPLE_DIFF_LEFT);
  const [diffRight, setDiffRight] = useState<string>(SAMPLE_DIFF_RIGHT);

  // 3. SCHEMA STATE
  const [schemaStr, setSchemaStr] = useState<string>(SAMPLE_SCHEMA);
  const [docStr, setDocStr] = useState<string>(SAMPLE_JSON);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);

  function CleanURLPlaceholder() {
    return '';
  }

  // Trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Real-time Formatting Calculations
  useEffect(() => {
    if (!rawJson.trim()) {
      setIsValid(false);
      setErrorMsg(undefined);
      setErrorLine(undefined);
      setFormattedJson('');
      setParsedJson(null);
      return;
    }

    const res = validateJSON(rawJson);
    setIsValid(res.valid);
    setErrorMsg(res.error);
    setErrorLine(res.line);

    if (res.valid) {
      try {
        const parsed = JSON.parse(rawJson);
        setParsedJson(parsed);
        const formatted = formatJSON(rawJson, indentOption, sortKeys);
        setFormattedJson(formatted);
      } catch (err) {
        // Fallback
      }
    }
  }, [rawJson, indentOption, sortKeys]);

  // Real-time Schema Validation Calculations
  useEffect(() => {
    if (!schemaStr.trim() || !docStr.trim()) {
      setSchemaErrors([]);
      return;
    }
    const schemaVal = validateJSON(schemaStr);
    const docVal = validateJSON(docStr);
    
    if (schemaVal.valid && docVal.valid) {
      try {
        const parsedSchema = JSON.parse(schemaStr);
        const parsedDoc = JSON.parse(docStr);
        const errors = validateJSONSchema(parsedDoc, parsedSchema);
        setSchemaErrors(errors);
      } catch (err) {
        setSchemaErrors(['Failed to execute schema matching.']);
      }
    } else {
      const errs: string[] = [];
      if (!schemaVal.valid) errs.push(`Schema Error: ${schemaVal.error} (Line ${schemaVal.line})`);
      if (!docVal.valid) errs.push(`Document Error: ${docVal.error} (Line ${docVal.line})`);
      setSchemaErrors(errs);
    }
  }, [schemaStr, docStr]);

  // Format Action
  const handleFormat = () => {
    if (!rawJson.trim()) return;
    const res = validateJSON(rawJson);
    if (res.valid) {
      try {
        const formatted = formatJSON(rawJson, indentOption, sortKeys);
        setRawJson(formatted);
        triggerToast('JSON formatted successfully!');
      } catch (err: any) {
        setIsValid(false);
        setErrorMsg(err.message || 'Formatting error');
      }
    } else {
      triggerToast('Cannot format: JSON is invalid.');
    }
  };

  // Minify Action
  const handleMinify = () => {
    if (!rawJson.trim()) return;
    const res = validateJSON(rawJson);
    if (res.valid) {
      try {
        const minified = minifyJSON(rawJson, sortKeys);
        setRawJson(minified);
        triggerToast('JSON minified successfully!');
      } catch (err: any) {
        setIsValid(false);
        setErrorMsg(err.message || 'Minification error');
      }
    } else {
      triggerToast('Cannot minify: JSON is invalid.');
    }
  };

  // Manual Validation Action
  const handleValidate = () => {
    if (!rawJson.trim()) {
      triggerToast('Input is empty.');
      return;
    }
    const res = validateJSON(rawJson);
    if (res.valid) {
      triggerToast('Validation passed! JSON is valid.');
    } else {
      triggerToast(`Validation failed on Line ${res.line}`);
    }
  };

  const handleClear = () => {
    setRawJson('');
    setFormattedJson('');
    setParsedJson(null);
    setIsValid(false);
    setErrorMsg(undefined);
    setErrorLine(undefined);
    setQueryStr('');
    triggerToast('Cleared workspace.');
  };

  // URL Fetching
  const handleUrlFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsFetching(true);
    triggerToast('Fetching JSON URL...');
    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dataText = await response.text();
      setRawJson(dataText);
      setUrlInput('');
      triggerToast('URL JSON loaded successfully!');
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        triggerToast('CORS block - paste JSON manually');
        setErrorMsg('CORS blocked - paste JSON manually');
      } else {
        triggerToast(`Fetch failed: ${err.message}`);
        setErrorMsg(`Fetch failed: ${err.message}`);
      }
      setIsValid(false);
      setErrorLine(1);
    } finally {
      setIsFetching(false);
    }
  };

  // Calculate Diff lines
  const getDiffLines = (): DiffLine[] => {
    let leftLines: string[] = [];
    let rightLines: string[] = [];

    try {
      if (diffLeft.trim()) {
        leftLines = formatJSON(diffLeft, '2', false).split('\n');
      }
    } catch (e) {
      leftLines = diffLeft.split('\n');
    }

    try {
      if (diffRight.trim()) {
        rightLines = formatJSON(diffRight, '2', false).split('\n');
      }
    } catch (e) {
      rightLines = diffRight.split('\n');
    }

    return diffLines(leftLines, rightLines);
  };

  // Compute final display outputs for formatter tab
  let displayValue = formattedJson;
  let displayParsed = parsedJson;
  
  if (queryStr.trim() && isValid && parsedJson) {
    try {
      const queried = queryJSON(parsedJson, queryStr);
      displayParsed = queried;
      displayValue = JSON.stringify(queried, null, indentOption === 'tab' ? '\t' : parseInt(indentOption, 10)) || '';
    } catch (err) {
      displayValue = '// Query execution failed';
    }
  }

  const rawCharCount = rawJson.length;
  const rawLineCount = rawJson ? rawJson.split('\n').length : 0;
  
  const outputCharCount = isTreeView 
    ? (displayParsed ? JSON.stringify(displayParsed, null, 2).length : 0)
    : displayValue.length;
    
  const outputLineCount = isTreeView 
    ? 0 
    : (displayValue ? displayValue.split('\n').length : 0);

  return (
    <div id="root">
      {/* HEADER */}
      <header className="header-bar">
        <div className="logo-section">
          <img src="/favicon-96x96.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>JSON Master</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--accent-purple)', color: '#141416', borderRadius: '4px', fontWeight: 'bold' }}>PRO</span>
          </h1>

          {/* GitHub Link */}
          <a href="https://github.com/phulkeshwar/JSONformatter" target="_blank" rel="noopener noreferrer" className="github-btn" style={{ marginLeft: '12px' }}>
            <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            <span>GitHub</span>
          </a>
        </div>

        {activeTab === 'formatter' && (
          <div className="controls-section">
            <div className="toolbar-group">
              <button className="tool-btn primary" onClick={handleFormat} disabled={!rawJson.trim()}>
                Format
              </button>
              <button className="tool-btn" onClick={handleMinify} disabled={!rawJson.trim()}>
                Minify
              </button>
              <button className="tool-btn" onClick={handleValidate} disabled={!rawJson.trim()}>
                Validate
              </button>
              <button className="tool-btn" onClick={handleClear} disabled={!rawJson.trim()}>
                Clear
              </button>
            </div>

            <div className="toolbar-group">
              <select 
                className="select-control" 
                value={indentOption} 
                onChange={(e) => setIndentOption(e.target.value)}
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tab Indent</option>
              </select>

              <button 
                className={`tool-btn ${sortKeys ? 'active' : ''}`} 
                onClick={() => setSortKeys(!sortKeys)}
              >
                Sort Keys
              </button>

              <button 
                className={`tool-btn ${isTreeView ? 'active' : ''}`} 
                onClick={() => setIsTreeView(!isTreeView)}
                disabled={!isValid}
              >
                Tree View
              </button>
            </div>

            <form className="url-loader" onSubmit={handleUrlFetch}>
              <input 
                type="url" 
                placeholder="JSON URL..." 
                className="url-input" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <button type="submit" className="tool-btn" disabled={isFetching}>
                Fetch
              </button>
            </form>

            <div className={`status-badge ${!rawJson.trim() ? 'empty' : isValid ? 'valid' : 'invalid'}`}>
              <span className="status-dot"></span>
              <span>{!rawJson.trim() ? 'Empty' : isValid ? 'Valid JSON' : 'Invalid JSON'}</span>
            </div>
          </div>
        )}

        {activeTab !== 'formatter' && (
          <div className="controls-section">
            <div className={`status-badge valid`}>
              <span className="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        )}
      </header>

      {/* Tabs selector */}
      <nav className="app-tabs">
        <button 
          className={`tab-link ${activeTab === 'formatter' ? 'active' : ''}`}
          onClick={() => setActiveTab('formatter')}
        >
          Formatter &amp; Query
        </button>
        <button 
          className={`tab-link ${activeTab === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveTab('diff')}
        >
          JSON Diff Check
        </button>
        <button 
          className={`tab-link ${activeTab === 'schema' ? 'active' : ''}`}
          onClick={() => setActiveTab('schema')}
        >
          Schema Validator
        </button>
      </nav>

      {/* WORKSPACE AREA */}
      {activeTab === 'formatter' && (
        <main className="workspace-container">
          <EditorPanel 
            value={rawJson}
            onChange={setRawJson}
            errorLine={errorLine}
            charCount={rawCharCount}
            lineCount={rawLineCount}
          />
          
          <div className="divider"></div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* JQ / JSONPath query input */}
            <div className="query-bar">
              <label htmlFor="jqQuery">Filter Path</label>
              <input
                id="jqQuery"
                type="text"
                className="query-input"
                placeholder="e.g. $.features[0] or $.email"
                value={queryStr}
                onChange={(e) => setQueryStr(e.target.value)}
              />
              {queryStr && (
                <button 
                  className="tool-btn" 
                  style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                  onClick={() => setQueryStr('')}
                >
                  Clear
                </button>
              )}
            </div>

            <ViewerPanel 
              rawValue={rawJson}
              formattedValue={displayValue}
              parsedValue={displayParsed}
              isValid={isValid}
              isTreeView={isTreeView}
              lineCount={outputLineCount}
              charCount={outputCharCount}
            />
          </div>
        </main>
      )}

      {activeTab === 'diff' && (
        <main className="diff-container">
          <div className="diff-split">
            <EditorPanel
              value={diffLeft}
              onChange={setDiffLeft}
              errorLine={undefined}
              charCount={diffLeft.length}
              lineCount={diffLeft ? diffLeft.split('\n').length : 0}
            />
            <EditorPanel
              value={diffRight}
              onChange={setDiffRight}
              errorLine={undefined}
              charCount={diffRight.length}
              lineCount={diffRight ? diffRight.split('\n').length : 0}
            />
          </div>
          
          <div className="diff-output-panel">
            <div className="panel-header">
              <span className="panel-title">Line comparison (diff)</span>
            </div>
            <div className="diff-lines-list">
              {getDiffLines().map((line, idx) => (
                <div 
                  key={idx} 
                  className={`diff-line-row ${line.type}`}
                >
                  <span className="diff-sign">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span>{line.value}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {activeTab === 'schema' && (
        <main className="workspace-container" style={{ gridTemplateRows: '1fr auto', gridTemplateColumns: '1fr' }}>
          <div className="diff-split">
            <EditorPanel
              value={schemaStr}
              onChange={setSchemaStr}
              errorLine={undefined}
              charCount={schemaStr.length}
              lineCount={schemaStr ? schemaStr.split('\n').length : 0}
            />
            <EditorPanel
              value={docStr}
              onChange={setDocStr}
              errorLine={undefined}
              charCount={docStr.length}
              lineCount={docStr ? docStr.split('\n').length : 0}
            />
          </div>

          <div className="schema-validation-panel">
            <div className="schema-result-header">Schema Audit Report</div>
            {schemaErrors.length === 0 ? (
              <div style={{ color: 'var(--status-green)', fontSize: '0.85rem', fontWeight: 600 }}>
                ✓ Schema matching successful! The JSON document is fully compliant with schema rules.
              </div>
            ) : (
              <div>
                {schemaErrors.map((err, idx) => (
                  <div key={idx} className="schema-error-item">
                    <span>✗</span>
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ERROR BANNER FOR FORMATTER */}
      {activeTab === 'formatter' && !isValid && errorMsg && (
        <div className="error-banner">
          <span className="error-banner-icon">⚠</span>
          <span className="error-banner-text">
            <strong>Error line {errorLine}:</strong> {errorMsg}
          </span>
        </div>
      )}

      {/* TOAST POPUPS */}
      {toastMessage && (
        <div className="toast-msg">
          {toastMessage}
        </div>
      )}

      {/* FAQ SECTION */}
      <div className="faq-section-container">
        <div className="card faq-card">
          <div className="card-title">❓ Frequently Asked Questions (FAQ)</div>
          <div className="faq-list">
            {[
              {
                q: "What is a JSON Formatter and Validator?",
                a: "A JSON formatter parses a raw JSON string and prints it with clean indentation and indentation spacing to make it human-readable. A validator analyzes the syntax of the JSON string against RFC 8259 standards to ensure there are no trailing commas, missing braces, or invalid quotes."
              },
              {
                q: "Is my JSON data secure on this website?",
                a: "Yes. All parsing, validation, and formatting computations are executed locally inside your browser sandbox. None of your data is sent to external servers."
              },
              {
                q: "What is the difference between JSONPath and JQ filters?",
                a: "JSONPath is a query language used to select and extract specific nodes from a JSON structure (e.g. $.store.book[*].author). JQ is a more advanced CLI tool and query syntax that allows filtering, restructuring, and modifying JSON elements."
              },
              {
                q: "How does the side-by-side JSON Diff check work?",
                a: "The Diff checker reformats both left and right JSON structures to a standard layout, sorts them if required, and then compares them line by line. It highlights additions, deletions, and updates side by side."
              }
            ].map((item, index) => (
              <div key={index} className={`faq-item ${faqActive === index ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={faqActive === index}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">{faqActive === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer-bar">
        <div className="author-info">
          <span>Developed by: <strong>Phulkeshwar Mahto</strong></span>
          <span>•</span>
          <a href="mailto:phulkeshwar.e@gmail.com">phulkeshwar.e@gmail.com</a>
          <span>•</span>
          <span>B.Tech CSE · NIAMT Ranchi</span>
        </div>
        <a 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hero-link-btn"
        >
          Built for Digital Heroes
        </a>
      </footer>
    </div>
  );
}
