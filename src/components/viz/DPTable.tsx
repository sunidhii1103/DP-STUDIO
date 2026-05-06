import React from 'react';
import type { TableSnapshot, ActiveIndices, CellState } from '../../types/step.types';

interface DPTableProps {
  snapshot: TableSnapshot;
  activeIndices?: ActiveIndices;
}

const renderCell = (cell: CellState, indexKey: string, isActiveIndex: boolean) => {
  const displayValue = cell.value !== null ? cell.value : '-';
  
  let className = 'dp-cell';
  if (cell.state !== 'idle') {
    className += ` ${cell.state}`;
  }
  if (isActiveIndex && cell.state !== 'active') {
    className += ' target-index';
  }
  
  // Apply 'updated' class for computed and result states to trigger animation
  if (cell.state === 'computed' || cell.state === 'result') {
    className += ' updated';
  }

  return (
    <div
      key={indexKey}
      className={className}
    >
      {displayValue}
    </div>
  );
};

export const DPTable: React.FC<DPTableProps> = ({ snapshot, activeIndices }) => {
  if (snapshot.dimensions === 1) {
    return (
      <div className="dp-table" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
        {snapshot.cells.map((cell, index) => {
          const isActiveIndex = activeIndices && activeIndices.i === index && activeIndices.j === undefined;
          return renderCell(cell, `1d-${index}`, !!isActiveIndex);
        })}
      </div>
    );
  }

  // 2D rendering
  return (
    <div className="dp-table" style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
      {snapshot.colLabels && (
        <div className="dp-table" style={{ display: 'flex', paddingLeft: snapshot.rowLabels ? '60px' : '0' }}>
          {snapshot.colLabels.map((lbl, j) => (
            <div key={`col-${j}`} className="dp-label" style={{ width: '50px', textAlign: 'center', flexShrink: 0 }}>
              {lbl}
            </div>
          ))}
        </div>
      )}
      {snapshot.cells.map((row, i) => (
        <div key={`row-${i}`} className="dp-table" style={{ display: 'flex', alignItems: 'center' }}>
          {snapshot.rowLabels && (
            <div className="dp-label" style={{ width: '50px', textAlign: 'right', paddingRight: '8px', flexShrink: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {snapshot.rowLabels[i]}
            </div>
          )}
          {row.map((cell, j) => {
            const isActiveIndex = activeIndices && activeIndices.i === i && activeIndices.j === j;
            return renderCell(cell, `2d-${i}-${j}`, !!isActiveIndex);
          })}
        </div>
      ))}
    </div>
  );
};
