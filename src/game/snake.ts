import { BOARD_SIZE, INITIAL_FOOD, INITIAL_SNAKE } from './constants';
import type { Direction, GameState, Point } from './types';

export function createInitialGameState(): GameState {
  return {
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT',
    status: 'idle',
    score: 0,
    tick: 0,
  };
}

export function getPointKey(point: Point): string {
  return `${point.row}-${point.col}`;
}

export function isOppositeDirection(
  current: Direction,
  next: Direction
): boolean {
  return (
    (current === 'UP' && next === 'DOWN') ||
    (current === 'DOWN' && next === 'UP') ||
    (current === 'LEFT' && next === 'RIGHT') ||
    (current === 'RIGHT' && next === 'LEFT')
  );
}

function getNextHead(head: Point, direction: Direction): Point {
  switch (direction) {
    case 'UP':
      return { row: head.row - 1, col: head.col };

    case 'DOWN':
      return { row: head.row + 1, col: head.col };

    case 'LEFT':
      return { row: head.row, col: head.col - 1 };

    case 'RIGHT':
      return { row: head.row, col: head.col + 1 };
  }
}

function isWallCollision(point: Point): boolean {
  return (
    point.row < 0 ||
    point.row >= BOARD_SIZE ||
    point.col < 0 ||
    point.col >= BOARD_SIZE
  );
}

function isSamePoint(a: Point, b: Point): boolean {
  return a.row === b.row && a.col === b.col;
}

function createRandomFood(snake: Point[]): Point {
  const snakeKeys = new Set(snake.map(getPointKey));

  while (true) {
    const food = {
      row: Math.floor(Math.random() * BOARD_SIZE),
      col: Math.floor(Math.random() * BOARD_SIZE),
    };

    if (!snakeKeys.has(getPointKey(food))) {
      return food;
    }
  }
}

export function getNextGameState(state: GameState): GameState {
  if (state.status !== 'running') {
    return state;
  }

  const head = state.snake[0];
  const nextHead = getNextHead(head, state.direction);

  if (isWallCollision(nextHead)) {
    return {
      ...state,
      status: 'game-over',
    };
  }

  const hasEatenFood = isSamePoint(nextHead, state.food);

  const nextSnake = hasEatenFood
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)];

  const bodyToCheck = hasEatenFood ? state.snake : state.snake.slice(0, -1);

  const hasSelfCollision = bodyToCheck.some((part) =>
    isSamePoint(part, nextHead)
  );

  if (hasSelfCollision) {
    return {
      ...state,
      status: 'game-over',
    };
  }

  return {
    ...state,
    snake: nextSnake,
    food: hasEatenFood ? createRandomFood(nextSnake) : state.food,
    score: hasEatenFood ? state.score + 10 : state.score,
    tick: state.tick + 1,
  };
}
