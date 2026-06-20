import React, { useState } from 'react';

interface TreeViewProps {
  data: any;
}

export const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  return (
    <div className="tree-container">
      <TreeNode value={data} isLast={true} depth={0} />
    </div>
  );
};

interface TreeNodeProps {
  nodeKey?: string;
  value: any;
  isLast: boolean;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ nodeKey, value, isLast, depth }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < 2); // Expand top levels by default

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderKey = () => {
    if (nodeKey === undefined) return null;
    return (
      <>
        <span className="tree-node-key">"{nodeKey}"</span>
        <span className="tree-node-colon">:</span>
      </>
    );
  };

  // 1. Null Value
  if (value === null) {
    return (
      <div className="tree-primitive">
        {renderKey()}
        <span className="val-null">null</span>
        {!isLast && <span className="hl-punct">,</span>}
      </div>
    );
  }

  // 2. Arrays
  if (Array.isArray(value)) {
    const isEmpty = value.length === 0;

    if (isEmpty) {
      return (
        <div className="tree-primitive">
          {renderKey()}
          <span className="tree-node-bracket">[]</span>
          {!isLast && <span className="hl-punct">,</span>}
        </div>
      );
    }

    return (
      <div className="tree-node">
        <div className="tree-node-header" onClick={toggleExpand}>
          <span className={`tree-node-arrow ${isExpanded ? 'expanded' : ''}`}></span>
          {renderKey()}
          <span className="tree-node-bracket">{isExpanded ? '[' : '[...]'}</span>
          {!isExpanded && (
            <span className="tree-node-summary">
              {`// Array(${value.length})`}
            </span>
          )}
          {!isExpanded && !isLast && <span className="hl-punct">,</span>}
        </div>
        
        {isExpanded && (
          <>
            <div className="tree-node-children">
              {value.map((item, idx) => (
                <TreeNode
                  key={idx}
                  value={item}
                  isLast={idx === value.length - 1}
                  depth={depth + 1}
                />
              ))}
            </div>
            <div className="tree-node-footer">
              <span className="tree-node-bracket">]</span>
              {!isLast && <span className="hl-punct">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // 3. Objects
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;

    if (isEmpty) {
      return (
        <div className="tree-primitive">
          {renderKey()}
          <span className="tree-node-bracket">{"{}"}</span>
          {!isLast && <span className="hl-punct">,</span>}
        </div>
      );
    }

    return (
      <div className="tree-node">
        <div className="tree-node-header" onClick={toggleExpand}>
          <span className={`tree-node-arrow ${isExpanded ? 'expanded' : ''}`}></span>
          {renderKey()}
          <span className="tree-node-bracket">{isExpanded ? '{' : '{...}'}</span>
          {!isExpanded && (
            <span className="tree-node-summary">
              {`// { ${keys.length} keys }`}
            </span>
          )}
          {!isExpanded && !isLast && <span className="hl-punct">,</span>}
        </div>

        {isExpanded && (
          <>
            <div className="tree-node-children">
              {keys.map((k, idx) => (
                <TreeNode
                  key={k}
                  nodeKey={k}
                  value={value[k]}
                  isLast={idx === keys.length - 1}
                  depth={depth + 1}
                />
              ))}
            </div>
            <div className="tree-node-footer">
              <span className="tree-node-bracket">{"}"}</span>
              {!isLast && <span className="hl-punct">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // 4. Primitive values (Strings, Numbers, Booleans)
  let valueClass = '';
  let formattedValue = '';

  if (typeof value === 'string') {
    valueClass = 'val-string';
    formattedValue = `"${value}"`;
  } else if (typeof value === 'number') {
    valueClass = 'val-number';
    formattedValue = String(value);
  } else if (typeof value === 'boolean') {
    valueClass = 'val-boolean';
    formattedValue = String(value);
  }

  return (
    <div className="tree-primitive">
      {renderKey()}
      <span className={valueClass}>{formattedValue}</span>
      {!isLast && <span className="hl-punct">,</span>}
    </div>
  );
};
