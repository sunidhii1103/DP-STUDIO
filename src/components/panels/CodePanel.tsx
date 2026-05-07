import React from 'react';

interface CodePanelProps {
  code: string[];
  activeLine: number;
}

export const CodePanel: React.FC<CodePanelProps> = ({ code, activeLine }) => {
  return (
    <div className="algorithm-code-panel" style={{
      backgroundColor: '#0d1117', /* Very dark VS Code like bg */
      borderLeft: '1px solid var(--color-border)',
      height: '100%',
      fontFamily: 'var(--font-family-mono)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ 
        padding: '0.75rem 1rem', 
        backgroundColor: '#161b22', 
        borderBottom: '1px solid var(--color-border)',
        color: 'var(--color-text-secondary)',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Algorithm Code
      </div>
      <div className="algorithm-code-scroll" style={{ padding: '1rem 0', overflowY: 'auto', flex: 1 }}>
        {code.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;
          
          return (
            <div 
              key={index} 
              className={`code-line ${isActive ? 'active' : ''}`}
            >
              <span style={{ 
                width: '40px', 
                color: isActive ? 'var(--color-text-primary)' : '#6e7681', 
                userSelect: 'none', 
                textAlign: 'right', 
                paddingRight: '12px',
                fontSize: '0.9rem',
              }}>
                {lineNumber}
              </span>
              <span style={{ 
                whiteSpace: 'pre', 
                color: isActive ? '#c9d1d9' : '#8b949e', 
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
