import React, { useRef, useEffect, useState } from 'react';
import { TreeView } from './TreeView';
import { highlightJSON } from '../utils/jsonUtils';

interface ViewerPanelProps {
  rawValue: string;
  formattedValue: string;
  parsedValue: any;
  isValid: boolean;
  isTreeView: boolean;
  lineCount: number;
  charCount: number;
}

export const ViewerPanel: React.FC<ViewerPanelProps> = ({
  rawValue,
  formattedValue,
  parsedValue,
  isValid,
  isTreeView,
  lineCount,
  charCount,
}) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync scroll of line numbers with pre
  const handleScroll = () => {
    if (codeRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = codeRef.current.scrollTop;
    }
  };

  // Sync scroll on layout resize or content update
  useEffect(() => {
    handleScroll();
  }, [formattedValue, isTreeView]);

  // Copy output to clipboard
  const handleCopy = () => {
    const textToCopy = isTreeView ? JSON.stringify(parsedValue, null, 2) : (formattedValue || rawValue);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Download output as a JSON file
  const handleDownload = () => {
    const textToDownload = isTreeView ? JSON.stringify(parsedValue, null, 2) : (formattedValue || rawValue);
    if (!textToDownload.trim()) return;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted_output.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Highlighted HTML output for display
  const highlightedHtml = highlightJSON(formattedValue || rawValue);

  // Build line numbers array
  const lines = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div className="viewer-panel">
      <div className="panel-header">
        <span className="panel-title">
          {isTreeView ? 'Interactive Tree View' : 'Formatted Output'}
        </span>
        <div className="panel-actions" style={{ display: 'flex', gap: '6px' }}>
          <button 
            className="tool-btn" 
            onClick={handleCopy}
            disabled={!rawValue.trim()}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button 
            className="tool-btn primary" 
            onClick={handleDownload}
            disabled={!rawValue.trim()}
          >
            Download
          </button>
        </div>
      </div>

      <div className="panel-body">
        {isTreeView && isValid ? (
          <TreeView data={parsedValue} />
        ) : isTreeView && !isValid ? (
          <div className="tree-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <span>Tree view unavailable - JSON is invalid</span>
          </div>
        ) : (
          <div className="code-container">
            <div className="line-numbers" ref={gutterRef}>
              {lines.map((num) => (
                <div key={num} className="line-no">
                  {num}
                </div>
              ))}
            </div>
            <pre
              ref={codeRef}
              className="viewer-pre"
              onScroll={handleScroll}
              dangerouslySetInnerHTML={{ __html: highlightedHtml || '<span style="color: var(--text-muted)">No output to display</span>' }}
            />
          </div>
        )}
      </div>

      <div className="panel-footer">
        <span>Lines: {isTreeView ? '-' : lineCount}</span>
        <span>Chars: {charCount}</span>
      </div>
    </div>
  );
};
