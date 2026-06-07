import { useEffect, useState } from 'react';
import { Controls } from './components/Controls';
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

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Classic Nokia Game</p>
        <h1>Snake</h1>
        <p>
          A classic Nokia-style Snake game with performance toggles for React
          and browser rendering demos.
        </p>
      </section>

      <section className="layout">
        <div className="game-section">
          <GameBoard
            gameState={gameState}
            performanceSettings={performanceSettings}
            metrics={metrics}
            recordLayoutCost={recordLayoutCost}
          />

          <p className="game-hint">
            <strong>Space</strong> to play/pause • <strong>Arrows</strong> to move • <strong>P</strong> for stats
          </p>

          <div className="mobile-controls">
            <Controls
              onStart={startGame}
              onPause={pauseGame}
              onReset={resetGame}
              onDirectionChange={changeDirection}
            />
          </div>
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

      <DetailedStatsPanel
        metrics={metrics}
        isOpen={isStatsPanelOpen}
        onClose={() => setIsStatsPanelOpen(false)}
      />
    </main>
  );
}
