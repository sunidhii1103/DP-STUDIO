import React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({ leftPanel, rightPanel }) => {
  return (
    <Group orientation="horizontal" style={{ height: '100%', width: '100%' }}>
      <Panel defaultSize={60} minSize={30}>
        <div style={{ height: '100%', padding: '1rem', overflowY: 'auto' }}>
          {leftPanel}
        </div>
      </Panel>
      <Separator className="resizer" />
      <Panel defaultSize={40} minSize={20}>
        <div style={{ height: '100%', overflow: 'hidden' }}>
          {rightPanel}
        </div>
      </Panel>
    </Group>
  );
};
