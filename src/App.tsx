import { useCallback, useEffect, useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { PerformancePanel } from './components/PerformancePanel';
import { DetailedStatsPanel } from './components/DetailedStatsPanel';
import { useSnakeGame } from './hooks/useSnakeGame';

export default function App() {
  const {
    gameState,
    performanceSettings,
    metrics,
    recordLayoutCost,
    startGame,
    pauseGame,
    resetGame,
    changeDirection,
    toggleTopLeftMovement,
    toggleLayoutThrashing,
    toggleScheduler,
    toggleMemo,
  } = useSnakeGame();

  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [isPerfPanelOpen, setIsPerfPanelOpen] = useState(false);

  const handleBoardTap = useCallback(() => {
    if (gameState.status === 'running') {
      pauseGame();
    } else {
      startGame();
    }
  }, [gameState.status, pauseGame, startGame]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setIsStatsPanelOpen((prev) => !prev);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const className = 'mobile-perf-open';

    if (isPerfPanelOpen) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [isPerfPanelOpen]);

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Classic Nokia Game</p>
        <h1>Snake</h1>
        <p>
          A classic Nokia-style Snake game with performance toggles for React
          and browser rendering demos.
        </p>
        <p className="hero__highlight">
          The main intention of the app is to project the impact of various
          performance decisions on overall app performance.
        </p>
      </section>

      <section className="layout">
        <div className="game-section">
          <GameBoard
            gameState={gameState}
            performanceSettings={performanceSettings}
            metrics={metrics}
            recordLayoutCost={recordLayoutCost}
            onBoardTap={handleBoardTap}
            onDirectionChange={changeDirection}
          />

          <button
            type="button"
            className="mobile-perf-toggle"
            aria-expanded={isPerfPanelOpen}
            aria-controls="mobile-perf-panel"
            aria-label="Open performance settings"
            onClick={() => setIsPerfPanelOpen((prev) => !prev)}
          >
            <span className="mobile-perf-toggle__icon" />
          </button>

          <p className="game-hint">
            <span className="game-hint__desktop">
              <strong>Space</strong> to play/pause • <strong>Arrows</strong> to move • <strong>P</strong> for stats
            </span>
            <span className="game-hint__mobile">
              Tap the board to play/pause or restart on game over • swipe to move the snake
            </span>
          </p>
        </div>

        <div className="right-panel">
          <PerformancePanel
            settings={performanceSettings}
            onToggleTopLeftMovement={toggleTopLeftMovement}
            onToggleLayoutThrashing={toggleLayoutThrashing}
            onToggleScheduler={toggleScheduler}
            onToggleMemo={toggleMemo}
          />
        </div>
      </section>

      {isPerfPanelOpen && (
        <div className="mobile-perf-sheet" role="dialog" aria-modal="true" id="mobile-perf-panel">
          <div
            className="mobile-perf-sheet__backdrop"
            onClick={() => setIsPerfPanelOpen(false)}
          />
          <div className="mobile-perf-sheet__content">
            <button
              type="button"
              className="mobile-perf-sheet__close"
              onClick={() => setIsPerfPanelOpen(false)}
              aria-label="Close performance settings"
            >
              ×
            </button>
            <PerformancePanel
              settings={performanceSettings}
              onToggleTopLeftMovement={toggleTopLeftMovement}
              onToggleLayoutThrashing={toggleLayoutThrashing}
              onToggleScheduler={toggleScheduler}
              onToggleMemo={toggleMemo}
            />
          </div>
        </div>
      )}

      <DetailedStatsPanel
        metrics={metrics}
        isOpen={isStatsPanelOpen}
        onClose={() => setIsStatsPanelOpen(false)}
      />
    </main>
  );
}
