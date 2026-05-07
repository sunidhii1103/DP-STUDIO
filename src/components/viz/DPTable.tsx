import React from 'react';
import type { TableSnapshot, ActiveIndices, CellState } from '../../types/step.types';

interface DPTableProps {
  snapshot: TableSnapshot;
  activeIndices?: ActiveIndices;
}

const renderCell = (cell: CellState, indexKey: string, isActiveIndex: boolean, extraClassName = '', displayOverride?: React.ReactNode) => {
  const displayValue = displayOverride ?? (cell.value !== null ? cell.value : '-');
  
  let className = 'dp-cell';
  if (cell.state !== 'idle') {
    className += ` ${cell.state} dp-cell--${cell.state}`;
  }
  if (extraClassName) className += ` ${extraClassName}`;
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

const getIntervalCellContent = (cell: CellState, split: number | null | undefined): React.ReactNode => {
  if (cell.value === null) return '-';

  const rawValue = String(cell.value);
  const costText = rawValue.includes('|') ? rawValue.split('|')[0]?.trim() : rawValue;
  const safeCost = costText && costText !== 'NaN' && costText !== 'undefined' ? costText : '-';

  if (split === null || split === undefined || !Number.isFinite(split)) {
    return <span className="interval-cell-value">{safeCost}</span>;
  }

  return (
    <span className="interval-cell-content">
      <span className="interval-cell-value">{safeCost}</span>
      <span className="interval-split-pill">k = {split + 1}</span>
    </span>
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

  const metadata = snapshot.metadata ?? {};
  const isIntervalTable = metadata.tableKind === 'interval';
  const splitTable = metadata.splitTable as (number | null)[][] | undefined;
  const boundaryCells = new Set((metadata.boundaryCells as string[] | undefined) ?? []);
  const pathCells = new Set((metadata.pathCells as string[] | undefined) ?? []);
  const splitCells = new Set((metadata.splitCells as string[] | undefined) ?? []);
  const activeChainLength = typeof metadata.activeChainLength === 'number' ? metadata.activeChainLength : null;
  const activeCellKey = typeof metadata.activeCellKey === 'string' ? metadata.activeCellKey : null;
  const isReconstructionPhase = metadata.phase === 'reconstruction';

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
            const isLowerIntervalCell = isIntervalTable && i > j;
            const split = splitTable?.[i]?.[j];
            const intervalLength = j - i + 1;
            const isActiveDiagonal = isIntervalTable && !isLowerIntervalCell && activeChainLength === intervalLength;
            const isPreviousDiagonal = isIntervalTable && !isLowerIntervalCell && activeChainLength !== null && intervalLength < activeChainLength;
            const isTraversalHead = activeCellKey === `${i},${j}`;
            const extraClasses = [
              isIntervalTable ? 'interval-cell' : '',
              isLowerIntervalCell ? 'interval-cell--empty' : '',
              isActiveDiagonal && !isReconstructionPhase ? 'interval-cell--active-diagonal' : '',
              isPreviousDiagonal && !isReconstructionPhase ? 'interval-cell--previous-diagonal' : '',
              isTraversalHead && !isReconstructionPhase ? 'interval-cell--traversal-head' : '',
              boundaryCells.has(`${i},${j}`) ? 'interval-cell--boundary' : '',
              pathCells.has(`${i},${j}`) ? 'interval-cell--reconstruction-path' : '',
              splitCells.has(`${i},${j}`) ? 'interval-cell--chosen-split' : '',
              split !== null && split !== undefined && cell.value !== null ? 'interval-cell--split' : '',
            ].filter(Boolean).join(' ');
            const displayOverride = isLowerIntervalCell ? '' : (isIntervalTable ? getIntervalCellContent(cell, split) : undefined);
            return renderCell(cell, `2d-${i}-${j}`, !!isActiveIndex, extraClasses, displayOverride);
          })}
        </div>
      ))}
    </div>
  );
};
