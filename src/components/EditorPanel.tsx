import React, { useRef, useEffect, useState } from 'react';

interface EditorPanelProps {
  value: string;
  onChange: (val: string) => void;
  errorLine: number | undefined;
  charCount: number;
  lineCount: number;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  value,
  onChange,
  errorLine,
  charCount,
  lineCount,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync scroll of the gutter with the textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Sync scroll on layout resize or content update
  useEffect(() => {
    handleScroll();
  }, [value]);

  // Insert space or tab at cursor on Tab key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      // Insert 2 spaces for tab
      const tabSpacing = '  ';
      const newValue = val.substring(0, start) + tabSpacing + val.substring(end);
      
      onChange(newValue);

      // Reset selection range after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpacing.length;
      }, 0);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // File Selector Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Build line numbers array
  const lines = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div 
      className="editor-panel"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="panel-header">
        <span className="panel-title">Raw JSON Input</span>
        <div className="panel-actions">
          <label className="tool-btn" style={{ padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
            Open File
            <input 
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      <div className="panel-body">
        <div className="code-container">
          <div className="line-numbers" ref={gutterRef}>
            {lines.map((num) => (
              <div 
                key={num} 
                className={`line-no ${errorLine === num ? 'error-line' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            placeholder='Paste your raw JSON here, or drag & drop a .json file...'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck="false"
          />
        </div>

        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-message">
              <h3>Import JSON File</h3>
              <p>Drop the file here to load its contents</p>
            </div>
          </div>
        )}
      </div>

      <div className="panel-footer">
        <span>Lines: {lineCount}</span>
        <span>Chars: {charCount}</span>
      </div>
    </div>
  );
};
