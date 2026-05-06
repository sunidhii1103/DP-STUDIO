import React from 'react';

export const MainLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--color-bg-primary)',
    }}>
      {children}
    </div>
  );
};
