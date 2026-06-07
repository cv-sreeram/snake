import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_SPEED_MS } from '../game/constants';
import {
  createInitialGameState,
  getNextGameState,
  isOppositeDirection,
} from '../game/snake';
import type { Direction, GameState, PerformanceSettings } from '../game/types';
import { usePerformanceMetrics, type PerformanceMetrics } from './usePerformanceMetrics';

const initialPerformanceSettings: PerformanceSettings = {
  useTopLeftMovement: false,
  forceLayoutThrashing: false,
  useRequestAnimationFrame: true,
  disableMemo: false,
};

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState()
  );

  const [performanceSettings, setPerformanceSettings] =
    useState<PerformanceSettings>(initialPerformanceSettings);

  const directionRef = useRef<Direction>('RIGHT');
  const { metrics, recordFrame, recordLayoutCost, getAndResetLayoutCost } = usePerformanceMetrics();

  const startGame = useCallback(() => {
    setGameState((current) => {
      if (current.status === 'game-over') {
        const fresh = createInitialGameState();
        directionRef.current = fresh.direction;

        return {
          ...fresh,
          status: 'running',
        };
      }

      return {
        ...current,
        status: 'running',
      };
    });
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((current) => ({
      ...current,
      status: current.status === 'running' ? 'paused' : current.status,
    }));
  }, []);

  const resetGame = useCallback(() => {
    const fresh = createInitialGameState();
    directionRef.current = fresh.direction;
    setGameState(fresh);
  }, []);

  const changeDirection = useCallback((nextDirection: Direction) => {
    setGameState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      const currentDirection = directionRef.current;

      if (isOppositeDirection(currentDirection, nextDirection)) {
        return current;
      }

      directionRef.current = nextDirection;

      return {
        ...current,
        direction: nextDirection,
      };
    });
  }, []);

  const toggleTopLeftMovement = useCallback(() => {
    setPerformanceSettings((current) => ({
      ...current,
      useTopLeftMovement: !current.useTopLeftMovement,
    }));
  }, []);

  const toggleLayoutThrashing = useCallback(() => {
    setPerformanceSettings((current) => ({
      ...current,
      forceLayoutThrashing: !current.forceLayoutThrashing,
    }));
  }, []);

  const toggleScheduler = useCallback(() => {
    setPerformanceSettings((current) => ({
      ...current,
      useRequestAnimationFrame: !current.useRequestAnimationFrame,
    }));
  }, []);

  const toggleMemo = useCallback(() => {
    setPerformanceSettings((current) => ({
      ...current,
      disableMemo: !current.disableMemo,
    }));
  }, []);

  const stepGame = useCallback(() => {
    setGameState((current) => getNextGameState(current));
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          changeDirection('UP');
          break;

        case 'ArrowDown':
          event.preventDefault();
          changeDirection('DOWN');
          break;

        case 'ArrowLeft':
          event.preventDefault();
          changeDirection('LEFT');
          break;

        case 'ArrowRight':
          event.preventDefault();
          changeDirection('RIGHT');
          break;

        case ' ':
          event.preventDefault();
          // Reset on game-over, toggle play/pause otherwise
          setGameState((current) => {
            if (current.status === 'game-over') {
              const fresh = createInitialGameState();
              directionRef.current = fresh.direction;
              return { ...fresh, status: 'running' };
            }
            if (current.status === 'idle') {
              return { ...current, status: 'running' };
            }
            if (current.status === 'running') {
              return { ...current, status: 'paused' };
            }
            if (current.status === 'paused') {
              return { ...current, status: 'running' };
            }
            return current;
          });
          break;

        case 'Escape':
          event.preventDefault();
          pauseGame();
          break;

        case 't':
          event.preventDefault();
          toggleTopLeftMovement();
          break;

        case 'l':
          event.preventDefault();
          toggleLayoutThrashing();
          break;

        case 's':
          event.preventDefault();
          toggleScheduler();
          break;

        case 'm':
          event.preventDefault();
          toggleMemo();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    changeDirection,
    pauseGame,
    toggleTopLeftMovement,
    toggleLayoutThrashing,
    toggleScheduler,
    toggleMemo,
  ]);

  useEffect(() => {
    if (gameState.status !== 'running') {
      return;
    }

    if (!performanceSettings.useRequestAnimationFrame) {
      let lastFrameTime = performance.now();

      const intervalId = window.setInterval(() => {
        const now = performance.now();
        const layoutCost = getAndResetLayoutCost();
        recordFrame(now, layoutCost);
        stepGame();
        lastFrameTime = now;
      }, GAME_SPEED_MS);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    let rafId = 0;
    let lastFrameTime = performance.now();
    let accumulatedTime = 0;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps = 0;

    function frame(now: number) {
      frameCount += 1;
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      accumulatedTime += delta;

      // Record frame timing for metrics
      const layoutCost = getAndResetLayoutCost();
      recordFrame(now, layoutCost);

      // Update FPS every 500ms
      if (now - lastFpsTime >= 500) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
        frameCount = 0;
        lastFpsTime = now;

        // Update game state with new FPS
        setGameState((current) => ({
          ...current,
          fps: currentFps,
        }));
      }

      while (accumulatedTime >= GAME_SPEED_MS) {
        stepGame();
        accumulatedTime -= GAME_SPEED_MS;
      }

      rafId = window.requestAnimationFrame(frame);
    }

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [
    gameState.status,
    performanceSettings.useRequestAnimationFrame,
    stepGame,
  ]);

  return {
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
  };
}
