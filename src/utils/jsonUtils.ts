export interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
}

/**
 * Validates JSON string and extracts approximate error line
 */
export function validateJSON(text: string): ValidationResult {
  if (!text || text.trim() === '') {
    return { valid: false, error: 'Empty JSON' };
  }

  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e: any) {
    const message = e.message || 'Invalid JSON';
    let line: number | undefined = undefined;

    // 1. Try to extract explicit line numbers from the error message (e.g. Firefox, Safari)
    // Example: "JSON.parse: unexpected non-whitespace character after JSON data at line 2 column 5"
    // Example: "Expected ... at line 12"
    const lineRegex = /line\s+(\d+)/i;
    const lineMatch = message.match(lineRegex);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    } else {
      // 2. Try to extract the character position (standard in Chrome / V8)
      // Example: "Unexpected token } in JSON at position 29"
      // Example: "Expected double-quoted property name in JSON at position 5"
      const posRegex = /position\s+(\d+)/i;
      const posMatch = message.match(posRegex);
      if (posMatch) {
        const position = parseInt(posMatch[1], 10);
        // Find line number by counting newlines up to that position
        let currentLine = 1;
        for (let i = 0; i < Math.min(position, text.length); i++) {
          if (text[i] === '\n') {
            currentLine++;
          }
        }
        line = currentLine;
      }
    }

    // Default to line 1 if we couldn't parse it but there is text
    if (line === undefined) {
      line = 1;
    }

    return {
      valid: false,
      error: message,
      line
    };
  }
}

/**
 * Recursively sort keys of an object alphabetically
 */
export function sortJSONKeys(value: any): any {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sortJSONKeys);
  }

  const sortedObj: { [key: string]: any } = {};
  const keys = Object.keys(value).sort();
  for (const key of keys) {
    sortedObj[key] = sortJSONKeys(value[key]);
  }
  return sortedObj;
}

/**
 * Formats a JSON string with options
 */
export function formatJSON(text: string, indent: string, sortKeys: boolean): string {
  if (!text || text.trim() === '') return '';
  
  const parsed = JSON.parse(text);
  const processed = sortKeys ? sortJSONKeys(parsed) : parsed;
  
  let indentVal: string | number = 2;
  if (indent === '4') indentVal = 4;
  if (indent === 'tab') indentVal = '\t';
  
  return JSON.stringify(processed, null, indentVal);
}

/**
 * Minifies a JSON string with options
 */
export function minifyJSON(text: string, sortKeys: boolean): string {
  if (!text || text.trim() === '') return '';
  
  const parsed = JSON.parse(text);
  const processed = sortKeys ? sortJSONKeys(parsed) : parsed;
  
  return JSON.stringify(processed);
}

/**
 * Custom syntax highlighting function using Regex.
 * Escapes HTML characters and returns HTML string with styling spans.
 */
export function highlightJSON(formattedJsonString: string): string {
  if (!formattedJsonString) return '';

  // Escape HTML tags to prevent custom injected HTML/XSS and syntax conflicts
  const escaped = formattedJsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Pure regex highlighting rules
  // Group 1: strings (potential keys and values)
  // Group 2: quotes/escaped chars
  // Group 3: colon mapping for keys
  // Group 4: numbers
  // Group 5: booleans
  // Group 6: null
  // Group 7: brackets & punctuation
  const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|(-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],])/g;

  return escaped.replace(jsonRegex, (match, p1, _p2, p3, p4, p5, p6, p7) => {
    if (p1) {
      if (p3) {
        // It's a JSON key
        return `<span class="hl-key">${p1}</span>${p3}`;
      } else {
        // It's a string value
        return `<span class="hl-string">${p1}</span>`;
      }
    } else if (p4) {
      // Number value
      return `<span class="hl-number">${match}</span>`;
    } else if (p5) {
      // Boolean value
      return `<span class="hl-boolean">${match}</span>`;
    } else if (p6) {
      // Null value
      return `<span class="hl-null">${match}</span>`;
    } else if (p7) {
      // Brackets, braces, comma
      if (/[{}[\]]/.test(match)) {
        return `<span class="hl-bracket">${match}</span>`;
      } else {
        return `<span class="hl-punct">${match}</span>`;
      }
    }
    return match;
  });
}
