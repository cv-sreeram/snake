import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { BOARD_SIZE, CELL_SIZE } from '../game/constants';
import type { GameState, PerformanceSettings, Point } from '../game/types';
import type { PerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { BoardCell, MemoBoardCell } from './BoardCell';
import { PerformanceIndicator } from './PerformanceIndicator';

type GameBoardProps = {
  gameState: GameState;
  performanceSettings: PerformanceSettings;
  metrics: PerformanceMetrics;
  recordLayoutCost?: (cost: number) => void;
};

function getMovementStyle(
  point: Point,
  useTopLeftMovement: boolean
): CSSProperties {
  const x = point.col * CELL_SIZE;
  const y = point.row * CELL_SIZE;

  if (useTopLeftMovement) {
    return {
      top: y,
      left: x,
    };
  }

  return {
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };
}

export function GameBoard({ gameState, performanceSettings, metrics, recordLayoutCost }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const boardCells = useMemo(() => {
    const cells = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        cells.push({ row, col, key: `${row}-${col}` });
      }
    }

    return cells;
  }, []);

  const CellComponent = performanceSettings.disableMemo
    ? BoardCell
    : MemoBoardCell;

  useLayoutEffect(() => {
    if (!performanceSettings.forceLayoutThrashing) {
      return;
    }

    const board = boardRef.current;

    if (!board) {
      return;
    }

    // Reduced from 8 passes to 2 passes, and only query board cells (not moving parts)
    // This still causes significant layout thrashing but won't crash the app
    const cells = Array.from(board.querySelectorAll<HTMLElement>('.board-cell'));

    for (let pass = 0; pass < 2; pass += 1) {
      for (const element of cells) {
        element.style.borderWidth = pass % 2 === 0 ? '1px' : '2px';
        const forcedLayoutRead = element.offsetHeight; // Forces layout recalculation

        if (forcedLayoutRead < 0) {
          element.style.opacity = '0.99';
        }
      }
    }
  }, [gameState.tick, performanceSettings.forceLayoutThrashing]);

  const boardPixelSize = BOARD_SIZE * CELL_SIZE;

  return (
    <section className="device" aria-label="Classic Nokia Snake game">
      <div className="device__speaker" />

      <div className="device__brand">NOKIA</div>

      <div className="screen">
        <div className="screen__header">
          <span>SNAKE</span>
          <div className="screen__stats">
            <span>SCORE {gameState.score}</span>
            <PerformanceIndicator metrics={metrics} />
          </div>
        </div>

        <div
          ref={boardRef}
          className="board"
          style={
            {
              '--board-size': `${boardPixelSize}px`,
              '--cell-size': `${CELL_SIZE}px`,
            } as CSSProperties
          }
        >
          <div className="board-grid" aria-hidden="true">
            {boardCells.map((cell) => (
              <CellComponent
                key={cell.key}
                row={cell.row}
                col={cell.col}
                onRender={performanceSettings.disableMemo
                  ? (cost: number) => { if (recordLayoutCost) recordLayoutCost(cost); }
                  : undefined}
              />
            ))}
          </div>

          <div
            className={[
              'food',
              performanceSettings.useTopLeftMovement
                ? 'movement-top-left'
                : 'movement-transform',
            ].join(' ')}
            style={getMovementStyle(
              gameState.food,
              performanceSettings.useTopLeftMovement
            )}
            aria-label="food"
          />

          {gameState.snake.map((part, index) => {
            const isHead = index === 0;

            return (
              <div
                key={`${index}-${part.row}-${part.col}`}
                className={[
                  'snake-part',
                  isHead ? 'snake-part--head' : 'snake-part--body',
                  performanceSettings.useTopLeftMovement
                    ? 'movement-top-left'
                    : 'movement-transform',
                ].join(' ')}
                style={getMovementStyle(
                  part,
                  performanceSettings.useTopLeftMovement
                )}
                aria-label={isHead ? 'snake head' : 'snake body'}
              />
            );
          })}
        </div>

        <div className="screen__footer">
          {gameState.status === 'idle' && (
            <>
              <span className="footer-mobile">PRESS START</span>
              <span className="footer-desktop">PRESS SPACE</span>
            </>
          )}
          {gameState.status === 'running' && 'RUNNING'}
          {gameState.status === 'paused' && 'PAUSED'}
          {gameState.status === 'game-over' && 'GAME OVER'}
        </div>
      </div>
    </section>
  );
}
