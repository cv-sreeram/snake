export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Point = {
  row: number;
  col: number;
};

export type GameStatus = 'idle' | 'running' | 'paused' | 'game-over';

export type GameState = {
  snake: Point[];
  food: Point;
  direction: Direction;
  status: GameStatus;
  score: number;
  tick: number;
};

export type PerformanceSettings = {
  useTopLeftMovement: boolean;
  forceLayoutThrashing: boolean;
  useRequestAnimationFrame: boolean;
  disableMemo: boolean;
};
