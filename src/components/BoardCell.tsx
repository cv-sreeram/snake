import { memo, useLayoutEffect } from 'react';

type BoardCellProps = {
  row: number;
  col: number;
  onRender?: (cost: number) => void;
};

function performHeavyRenderWork(row: number, col: number) {
  let result = row * 31 + col * 17;
  for (let i = 0; i < 900; i += 1) {
    result += Math.sqrt(result + i * 0.618) * Math.sin(result + i * 0.377);
    result = (result % 1000) + Math.log1p(Math.abs(result));

    if (i % 50 === 0) {
      result += Math.cos(result + i * 0.523) * Math.sqrt(Math.abs(result + i));
      result = (result % 1000) + Math.log1p(Math.abs(result));
    }
  }
  return result;
}

function BoardCellBase({ row, col, onRender }: BoardCellProps) {
  const renderStart = performance.now();
  const renderCostHint = onRender ? performHeavyRenderWork(row, col) : 0;

  useLayoutEffect(() => {
    const renderEnd = performance.now();
    const cost = Math.max(0, renderEnd - renderStart);
    if (onRender) onRender(cost);
  }, [onRender]);

  return (
    <div
      className="board-cell"
      data-row={row}
      data-col={col}
      data-cost={renderCostHint.toFixed(2)}
      aria-hidden="true"
    />
  );
}

export const BoardCell = BoardCellBase;

export const MemoBoardCell = memo(BoardCellBase);
