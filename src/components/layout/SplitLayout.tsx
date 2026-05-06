import React, { useState, useEffect } from 'react';

export type ViewMode = 'visual' | 'code' | 'split';

interface SplitLayoutProps {
  visualContent: React.ReactNode;
  codeContent: React.ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ visualContent, codeContent }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
        <button 
          onClick={() => setViewMode('visual')} 
          style={{ 
            padding: '0.5rem 1rem', 
            fontWeight: viewMode === 'visual' ? 'bold' : 'normal', 
            backgroundColor: viewMode === 'visual' ? '#e0e0e0' : 'transparent', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Visual Only
        </button>
        <button 
          onClick={() => setViewMode('split')} 
          style={{ 
            padding: '0.5rem 1rem', 
            fontWeight: viewMode === 'split' ? 'bold' : 'normal', 
            backgroundColor: viewMode === 'split' ? '#e0e0e0' : 'transparent', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Split View
        </button>
        <button 
          onClick={() => setViewMode('code')} 
          style={{ 
            padding: '0.5rem 1rem', 
            fontWeight: viewMode === 'code' ? 'bold' : 'normal', 
            backgroundColor: viewMode === 'code' ? '#e0e0e0' : 'transparent', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Code Only
        </button>
      </div>

      <div className="main-content" style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        flex: 1, 
        gap: '16px', 
        boxSizing: 'border-box',
        minHeight: 0
      }}>
        {viewMode !== 'code' && (
          <div className="visual-panel" style={{ 
            flex: viewMode === 'split' ? 1 : '1 1 100%', 
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            borderRadius: '12px',
            backgroundColor: '#fff',
            paddingRight: '16px'
          }}>
            {visualContent}
          </div>
        )}
        
        {viewMode !== 'visual' && (
          <div className="code-panel" style={{ 
            flex: viewMode === 'split' ? 1 : '1 1 100%', 
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            borderRadius: '12px',
            backgroundColor: '#f8f9fa',
            paddingRight: '16px'
          }}>
            {codeContent}
          </div>
        )}
      </div>
    </div>
  );
};
