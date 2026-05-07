import React from 'react';
import type { MCMTabulationFrame } from './mcmCompareData';

interface TabulationPanelProps {
  frame: MCMTabulationFrame;
}

const displayCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  const text = String(value);
  return text.includes('|') ? text.split('|')[0]?.trim() ?? '-' : text;
};

const splitLabel = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const text = String(value);
  const split = text.match(/k=(\d+)/);
  return split ? `k=${split[1]}` : null;
};

export const TabulationPanel: React.FC<TabulationPanelProps> = ({ frame }) => {
  const snapshot = frame.step?.tableSnapshot;
  const matrixCount = snapshot?.dimensions === 2 ? snapshot.cells.length : 0;
  const activeDiagonal = React.useMemo(() => new Set(frame.activeDiagonalKeys), [frame.activeDiagonalKeys]);
  const completedDiagonal = React.useMemo(() => new Set(frame.completedDiagonalKeys), [frame.completedDiagonalKeys]);
  const dependencies = React.useMemo(() => new Set(frame.dependencyKeys), [frame.dependencyKeys]);

  return (
    <section className="mcm-compare-panel mcm-compare-panel--tab">
      <div className="mcm-compare-panel-header">
        <div>
          <span className="mcm-compare-kicker">Bottom Up</span>
          <h3>Diagonal Tabulation</h3>
        </div>
        <span className="mcm-compare-complexity mcm-compare-complexity--bright">O(n^3)</span>
      </div>

      <div className="mcm-traversal-label">
        <span>{frame.traversalLabel}</span>
        <strong>Expanding chain size</strong>
      </div>

      <div className="mcm-tab-stage">
        {snapshot?.dimensions === 2 ? (
          <div className="mcm-diagonal-table" style={{ ['--mcm-size' as string]: matrixCount }}>
            <div className="mcm-diagonal-corner" />
            {snapshot.colLabels?.map((label) => (
              <div className="mcm-diagonal-label" key={`col-${label}`}>{label}</div>
            ))}
            {snapshot.cells.map((row, i) => (
              <React.Fragment key={`row-${i}`}>
                <div className="mcm-diagonal-label mcm-diagonal-label--row">{snapshot.rowLabels?.[i] ?? `i=${i + 1}`}</div>
                {row.map((cell, j) => {
                  const key = `${i},${j}`;
                  const isInvalid = i > j;
                  const isActiveDiagonal = activeDiagonal.has(key);
                  const isCompletedDiagonal = completedDiagonal.has(key);
                  const isCurrent = frame.activeCellKey === key;
                  const isDependency = dependencies.has(key);
                  const split = splitLabel(cell.value);

                  return (
                    <div
                      key={key}
                      className={[
                        'mcm-diagonal-cell',
                        isInvalid ? 'mcm-diagonal-cell--invalid' : '',
                        !isInvalid && cell.value !== null ? 'mcm-diagonal-cell--filled' : '',
                        isCompletedDiagonal ? 'mcm-diagonal-cell--completed' : '',
                        isActiveDiagonal ? 'mcm-diagonal-cell--active-wave' : '',
                        isDependency ? 'mcm-diagonal-cell--dependency' : '',
                        isCurrent ? 'mcm-diagonal-cell--current' : '',
                      ].filter(Boolean).join(' ')}
                      style={{ ['--mcm-cell-stagger' as string]: i * 90 }}
                    >
                      {!isInvalid && (
                        <>
                          <span>{displayCellValue(cell.value)}</span>
                          {split && <small>{split}</small>}
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="mcm-compare-empty">Tabulation table is waiting for valid steps.</p>
        )}
      </div>

      <div className="mcm-tab-detail-grid">
        <div>
          <span>Interval Length</span>
          <strong>{frame.intervalLength ?? '-'}</strong>
        </div>
        <div>
          <span>Current Chain</span>
          <strong>{frame.interval}</strong>
        </div>
        <div>
          <span>Best Split</span>
          <strong>{frame.bestSplit}</strong>
        </div>
      </div>

      <div className="mcm-formula-box">
        <span>Cost formula</span>
        <code>{frame.formula}</code>
      </div>

      <div className="mcm-compare-message">{frame.message}</div>

      <div className="mcm-compare-teaching-card">
        Bottom-up order guarantees dependencies are solved first, then longer intervals choose their best split.
      </div>
    </section>
  );
};
