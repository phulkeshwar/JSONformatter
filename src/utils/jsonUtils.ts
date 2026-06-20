export interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
}

export interface DiffLine {
  value: string;
  type: 'added' | 'removed' | 'unchanged';
  leftLineNo?: number;
  rightLineNo?: number;
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

    const lineRegex = /line\s+(\d+)/i;
    const lineMatch = message.match(lineRegex);
    if (lineMatch) {
      line = parseInt(lineMatch[1], 10);
    } else {
      const posRegex = /position\s+(\d+)/i;
      const posMatch = message.match(posRegex);
      if (posMatch) {
        const position = parseInt(posMatch[1], 10);
        let currentLine = 1;
        for (let i = 0; i < Math.min(position, text.length); i++) {
          if (text[i] === '\n') {
            currentLine++;
          }
        }
        line = currentLine;
      }
    }

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

  const escaped = formattedJsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const jsonRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|(-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],])/g;

  return escaped.replace(jsonRegex, (match, p1, _p2, p3, p4, p5, p6, p7) => {
    if (p1) {
      if (p3) {
        return `<span class="hl-key">${p1}</span>${p3}`;
      } else {
        return `<span class="hl-string">${p1}</span>`;
      }
    } else if (p4) {
      return `<span class="hl-number">${match}</span>`;
    } else if (p5) {
      return `<span class="hl-boolean">${match}</span>`;
    } else if (p6) {
      return `<span class="hl-null">${match}</span>`;
    } else if (p7) {
      if (/[{}[\]]/.test(match)) {
        return `<span class="hl-bracket">${match}</span>`;
      } else {
        return `<span class="hl-punct">${match}</span>`;
      }
    }
    return match;
  });
}

/**
 * Custom JQ/JSONPath query engine
 */
export function queryJSON(data: any, queryStr: string): any {
  if (!queryStr || queryStr.trim() === '' || queryStr.trim() === '$') {
    return data;
  }
  
  let cleanQuery = queryStr.trim();
  if (cleanQuery.startsWith('$')) {
    cleanQuery = cleanQuery.slice(1);
  }
  if (cleanQuery.startsWith('.')) {
    cleanQuery = cleanQuery.slice(1);
  }
  
  const tokens: string[] = [];
  const parts = cleanQuery.split('.');
  for (const part of parts) {
    if (!part) continue;
    
    const bracketIdx = part.indexOf('[');
    if (bracketIdx !== -1) {
      const key = part.slice(0, bracketIdx);
      if (key) tokens.push(key);
      
      const bracketMatches = part.match(/\[(\d+)\]|\[\*\]/g);
      if (bracketMatches) {
        for (const b of bracketMatches) {
          tokens.push(b);
        }
      }
    } else {
      tokens.push(part);
    }
  }

  let current = data;
  for (const token of tokens) {
    if (current === undefined || current === null) return undefined;
    
    if (token.startsWith('[') && token.endsWith(']')) {
      const inner = token.slice(1, -1);
      if (inner === '*') {
        if (Array.isArray(current)) {
          return current;
        } else if (typeof current === 'object') {
          return Object.values(current);
        }
      } else {
        const idx = parseInt(inner, 10);
        if (Array.isArray(current)) {
          current = current[idx];
        } else {
          return undefined;
        }
      }
    } else {
      if (typeof current === 'object' && token in current) {
        current = current[token];
      } else {
        return undefined;
      }
    }
  }
  
  return current;
}

/**
 * Validate JSON against a basic schema
 */
export function validateJSONSchema(doc: any, schema: any): string[] {
  const errors: string[] = [];
  
  if (!schema || typeof schema !== 'object') {
    return errors;
  }

  // Validate root type
  if (schema.type) {
    const docType = Array.isArray(doc) ? 'array' : doc === null ? 'null' : typeof doc;
    if (schema.type === 'number' && docType === 'number') {
      // Ok
    } else if (schema.type !== docType) {
      errors.push(`Document root type should be "${schema.type}" but is "${docType}"`);
      return errors;
    }
  }

  // Validate required fields
  if (schema.required && Array.isArray(schema.required) && typeof doc === 'object' && doc !== null) {
    for (const reqKey of schema.required) {
      if (!(reqKey in doc)) {
        errors.push(`Required property "${reqKey}" is missing`);
      }
    }
  }

  // Validate property types
  if (schema.properties && typeof schema.properties === 'object' && typeof doc === 'object' && doc !== null) {
    for (const key of Object.keys(schema.properties)) {
      if (key in doc) {
        const propSchema = schema.properties[key];
        const val = doc[key];
        const valType = Array.isArray(val) ? 'array' : val === null ? 'null' : typeof val;
        
        if (propSchema.type) {
          if (propSchema.type === 'number' && valType === 'number') {
            // OK
          } else if (propSchema.type !== valType) {
            errors.push(`Property "${key}" should be "${propSchema.type}" but is "${valType}"`);
          }
        }
      }
    }
  }

  return errors;
}

/**
 * LCS Diffing Algorithm for lines
 */
export function diffLines(left: string[], right: string[]): DiffLine[] {
  const M = left.length;
  const N = right.length;
  
  const dp: number[][] = Array(M + 1).fill(0).map(() => Array(N + 1).fill(0));
  
  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const result: DiffLine[] = [];
  let i = M;
  let j = N;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      result.push({
        value: left[i - 1],
        type: 'unchanged',
        leftLineNo: i,
        rightLineNo: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({
        value: right[j - 1],
        type: 'added',
        rightLineNo: j
      });
      j--;
    } else {
      result.push({
        value: left[i - 1],
        type: 'removed',
        leftLineNo: i
      });
      i--;
    }
  }
  
  return result.reverse();
}
