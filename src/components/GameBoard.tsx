import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { BOARD_SIZE, CELL_SIZE } from '../game/constants';
import type { Direction, GameState, PerformanceSettings, Point } from '../game/types';
import type { PerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { BoardCell, MemoBoardCell } from './BoardCell';
import { PerformanceIndicator } from './PerformanceIndicator';

type GameBoardProps = {
  gameState: GameState;
  performanceSettings: PerformanceSettings;
  metrics: PerformanceMetrics;
  recordLayoutCost?: (cost: number) => void;
  onBoardTap: () => void;
  onDirectionChange: (direction: Direction) => void;
};

function getMovementStyle(
  point: Point,
  useTopLeftMovement: boolean,
  cellSize: number
): CSSProperties {
  const x = point.col * cellSize;
  const y = point.row * cellSize;

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

export function GameBoard({ gameState, performanceSettings, metrics, recordLayoutCost, onBoardTap, onDirectionChange }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState<number>(CELL_SIZE);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);

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
    const board = boardRef.current;

    if (!board) {
      return;
    }

    const updateCellSize = () => {
      const width = board.clientWidth;
      setCellSize(width / BOARD_SIZE);
    };

    updateCellSize();

    const resizeObserver = new ResizeObserver(updateCellSize);
    resizeObserver.observe(board);

    return () => resizeObserver.disconnect();
  }, []);

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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    pointerIdRef.current = event.pointerId;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointerIdRef.current || !pointerStartRef.current) {
      return;
    }

    const { x: startX, y: startY } = pointerStartRef.current;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const threshold = 30;

    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerIdRef.current = null;
    pointerStartRef.current = null;

    if (Math.abs(deltaX) >= threshold || Math.abs(deltaY) >= threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        onDirectionChange(deltaX > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onDirectionChange(deltaY > 0 ? 'DOWN' : 'UP');
      }
      return;
    }

    onBoardTap();
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointerIdRef.current) {
      return;
    }

    pointerIdRef.current = null;
    pointerStartRef.current = null;
  };

  return (
    <section className="device" aria-label="Classic Nokia Snake game">
      <div className="device__speaker" />

      <div className="device__brand">NOKIA</div>

      <div
        className="screen"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
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
              '--cell-size': `${cellSize}px`,
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
              performanceSettings.useTopLeftMovement,
              cellSize
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
                  performanceSettings.useTopLeftMovement,
                  cellSize
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
