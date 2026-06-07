import { memo } from 'react';

type BoardCellProps = {
  row: number;
  col: number;
};

function BoardCellBase({ row, col }: BoardCellProps) {
  return (
    <div
      className="board-cell"
      data-row={row}
      data-col={col}
      aria-hidden="true"
    />
  );
}

export const BoardCell = BoardCellBase;

export const MemoBoardCell = memo(BoardCellBase);
