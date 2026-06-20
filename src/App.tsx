import React, { useState, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { ViewerPanel } from './components/ViewerPanel';
import { validateJSON, formatJSON, minifyJSON } from './utils/jsonUtils';
import './App.css';

const SAMPLE_JSON = `{
  "tool": "JSON Formatter",
  "built_by": "Phulkeshwar Mahto",
  "email": "phulkeshwarmahto@gmail.com",
  "features": [
    "format",
    "minify",
    "validate",
    "tree-view"
  ],
  "version": 1.0,
  "free": true,
  "built_for": "Digital Heroes"
}`;

export default function App() {
  const [rawJson, setRawJson] = useState<string>(SAMPLE_JSON);
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  
  // Settings
  const [indentOption, setIndentOption] = useState<string>('2');
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [isTreeView, setIsTreeView] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  
  // Validation States
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  
  // Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Run real-time validation on typing
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
        // Automatically update formatted output in real-time if valid
        const formatted = formatJSON(rawJson, indentOption, sortKeys);
        setFormattedJson(formatted);
      } catch (err) {
        // Fallback safety (should not be hit since validateJSON passed)
      }
    }
  }, [rawJson, indentOption, sortKeys]);

  // Format Action
  const handleFormat = () => {
    if (!rawJson.trim()) return;
    const res = validateJSON(rawJson);
    if (res.valid) {
      try {
        const formatted = formatJSON(rawJson, indentOption, sortKeys);
        setFormattedJson(formatted);
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
        setFormattedJson(minified);
        triggerToast('JSON minified successfully!');
      } catch (err: any) {
        setIsValid(false);
        setErrorMsg(err.message || 'Minification error');
      }
    } else {
      triggerToast('Cannot minify: JSON is invalid.');
    }
  };

  // Explicit Manual Validation Action
  const handleValidate = () => {
    if (!rawJson.trim()) {
      triggerToast('Input is empty.');
      return;
    }
    const res = validateJSON(rawJson);
    if (res.valid) {
      triggerToast('Validation passed! JSON is valid.');
    } else {
      triggerToast(`Validation failed: Line ${res.line}`);
    }
  };

  // Clear Action
  const handleClear = () => {
    setRawJson('');
    setFormattedJson('');
    setParsedJson(null);
    setIsValid(false);
    setErrorMsg(undefined);
    setErrorLine(undefined);
    triggerToast('Cleared input & output.');
  };

  // URL Fetch Action
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
      console.error(err);
      // Clean description of common CORS or net errors
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        triggerToast('CORS blocked — paste the JSON manually instead');
        setErrorMsg('CORS blocked or network error — paste the JSON manually instead');
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

  // Character and line count calculations
  const rawCharCount = rawJson.length;
  const rawLineCount = rawJson ? rawJson.split('\n').length : 0;
  
  const outputCharCount = isTreeView 
    ? (parsedJson ? JSON.stringify(parsedJson, null, 2).length : 0)
    : formattedJson.length;
    
  const outputLineCount = isTreeView 
    ? 0 
    : (formattedJson ? formattedJson.split('\n').length : 0);

  return (
    <div id="root">
      {/* Header bar with controls */}
      <header className="header-bar">
        <div className="logo-section">
          <div className="logo-icon">{"{}"}</div>
          <h1>JSON Formatter + Validator</h1>
        </div>

        <div className="controls-section">
          {/* Main Action Buttons */}
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

          {/* Config options */}
          <div className="toolbar-group">
            <select 
              className="select-control" 
              value={indentOption} 
              onChange={(e) => setIndentOption(e.target.value)}
              title="Indentation spacing"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab Indent</option>
            </select>

            <button 
              className={`tool-btn ${sortKeys ? 'active' : ''}`} 
              onClick={() => setSortKeys(!sortKeys)}
              title="Sort keys alphabetically"
            >
              Sort Keys
            </button>

            <button 
              className={`tool-btn ${isTreeView ? 'active' : ''}`} 
              onClick={() => setIsTreeView(!isTreeView)}
              disabled={!isValid}
              title={isValid ? 'Toggle Tree View' : 'Tree View unavailable for invalid JSON'}
            >
              Tree View
            </button>
          </div>

          {/* URL Import */}
          <form className="url-loader" onSubmit={handleUrlFetch}>
            <input 
              type="url" 
              placeholder="Paste JSON URL..." 
              className="url-input" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
            />
            <button type="submit" className="tool-btn" disabled={isFetching}>
              {isFetching ? 'Fetching...' : 'Fetch'}
            </button>
          </form>

          {/* Real-time Status Badge */}
          <div className={`status-badge ${!rawJson.trim() ? 'empty' : isValid ? 'valid' : 'invalid'}`}>
            <span className="status-dot"></span>
            <span>{!rawJson.trim() ? 'Empty' : isValid ? 'Valid JSON' : 'Invalid JSON'}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Panels Split */}
      <main className="workspace-container">
        <EditorPanel 
          value={rawJson}
          onChange={setRawJson}
          errorLine={errorLine}
          charCount={rawCharCount}
          lineCount={rawLineCount}
        />
        
        <div className="divider"></div>

        <ViewerPanel 
          rawValue={rawJson}
          formattedValue={formattedJson}
          parsedValue={parsedJson}
          isValid={isValid}
          isTreeView={isTreeView}
          lineCount={outputLineCount}
          charCount={outputCharCount}
        />
      </main>

      {/* Inline validation warning message at the bottom if invalid */}
      {!isValid && errorMsg && (
        <div className="error-banner">
          <span className="error-banner-icon">⚠</span>
          <span className="error-banner-text">
            <strong>Error line {errorLine}:</strong> {errorMsg}
          </span>
        </div>
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="toast-msg">
          {toastMessage}
        </div>
      )}

      {/* Footer bar */}
      <footer className="footer-bar">
        <div className="author-info">
          <span>Developed by: <strong>Phulkeshwar Mahto</strong></span>
          <span>•</span>
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
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
