import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_SPEED_MS } from '../game/constants';
import {
  createInitialGameState,
  getNextGameState,
  isOppositeDirection,
} from '../game/snake';
import type { Direction, GameState, PerformanceSettings } from '../game/types';

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
          startGame();
          break;

        case 'Escape':
          event.preventDefault();
          pauseGame();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeDirection, pauseGame, startGame]);

  useEffect(() => {
    if (gameState.status !== 'running') {
      return;
    }

    if (!performanceSettings.useRequestAnimationFrame) {
      const intervalId = window.setInterval(() => {
        stepGame();
      }, GAME_SPEED_MS);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    let rafId = 0;
    let lastFrameTime = performance.now();
    let accumulatedTime = 0;

    function frame(now: number) {
      const delta = now - lastFrameTime;
      lastFrameTime = now;
      accumulatedTime += delta;

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
