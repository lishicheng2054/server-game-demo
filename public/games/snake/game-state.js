(function exposeGameState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.GameState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createGameStateApi() {
  const BOARD_SIZE = 20;
  const START_TICK_MS = 150;
  const MIN_TICK_MS = 70;
  const SPEED_STEP_MS = 15;
  const POINTS_PER_SPEED_STEP = 5;
  const MAX_DIRECTION_QUEUE = 2;
  const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  const INITIAL_FOOD = { x: 14, y: 10 };
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const OPPOSITE_DIRECTIONS = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };

  function cloneCells(cells) {
    return cells.map((cell) => ({ ...cell }));
  }

  function createInitialState(bestScore = 0) {
    return {
      status: "idle",
      direction: "right",
      nextDirection: "right",
      directionQueue: [],
      snake: cloneCells(INITIAL_SNAKE),
      food: { ...INITIAL_FOOD },
      score: 0,
      bestScore,
    };
  }

  function startGame(state) {
    return {
      ...createInitialState(state.bestScore),
      status: "playing",
    };
  }

  function prepareGame(state) {
    return {
      ...createInitialState(state.bestScore),
      status: "countdown",
    };
  }

  function resetGame(state) {
    return createInitialState(state.bestScore);
  }

  function changeDirection(state, direction) {
    if (!DIRECTIONS[direction]) {
      return { ...state };
    }

    const directionQueue = state.directionQueue || [];
    const lastQueuedDirection =
      directionQueue.length > 0 ? directionQueue[directionQueue.length - 1] : state.direction;

    if (
      directionQueue.length >= MAX_DIRECTION_QUEUE ||
      lastQueuedDirection === direction ||
      OPPOSITE_DIRECTIONS[lastQueuedDirection] === direction
    ) {
      return { ...state };
    }

    const nextQueue = [...directionQueue, direction];

    return {
      ...state,
      nextDirection: nextQueue[0],
      directionQueue: nextQueue,
    };
  }

  function isSameCell(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  function isOutsideBoard(cell) {
    return cell.x < 0 || cell.x >= BOARD_SIZE || cell.y < 0 || cell.y >= BOARD_SIZE;
  }

  function isOnSnake(cell, snake) {
    return snake.some((segment) => isSameCell(segment, cell));
  }

  function createRandomFood(blockedCells) {
    const openCells = [];

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        const candidate = { x, y };

        if (!isOnSnake(candidate, blockedCells)) {
          openCells.push(candidate);
        }
      }
    }

    if (openCells.length === 0) {
      return { x: 0, y: 0 };
    }

    return openCells[Math.floor(Math.random() * openCells.length)];
  }

  function finishGame(state) {
    return {
      ...state,
      status: "finished",
      bestScore: Math.max(state.bestScore, state.score),
    };
  }

  function getTickMs(score) {
    const speedSteps = Math.floor(score / POINTS_PER_SPEED_STEP);
    return Math.max(MIN_TICK_MS, START_TICK_MS - speedSteps * SPEED_STEP_MS);
  }

  function advanceSnake(state, createFood = createRandomFood) {
    if (state.status !== "playing") {
      return {
        ...state,
        snake: cloneCells(state.snake),
        food: { ...state.food },
        directionQueue: [...(state.directionQueue || [])],
      };
    }

    const directionQueue = state.directionQueue || [];
    const direction = directionQueue[0] || state.nextDirection;
    const remainingDirectionQueue = directionQueue.slice(1);
    const movement = DIRECTIONS[direction];
    const head = state.snake[0];
    const nextHead = {
      x: head.x + movement.x,
      y: head.y + movement.y,
    };
    const ateFood = isSameCell(nextHead, state.food);
    const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);

    if (isOutsideBoard(nextHead) || isOnSnake(nextHead, bodyToCheck)) {
      return finishGame({
        ...state,
        direction,
        directionQueue: [],
      });
    }

    const nextSnake = ateFood
      ? [nextHead, ...cloneCells(state.snake)]
      : [nextHead, ...cloneCells(state.snake.slice(0, -1))];
    const nextScore = ateFood ? state.score + 1 : state.score;

    return {
      ...state,
      status: "playing",
      direction,
      nextDirection: remainingDirectionQueue[0] || direction,
      directionQueue: remainingDirectionQueue,
      snake: nextSnake,
      food: ateFood ? createFood(nextSnake) : { ...state.food },
      score: nextScore,
      bestScore: Math.max(state.bestScore, nextScore),
    };
  }

  return {
    BOARD_SIZE,
    createInitialState,
    prepareGame,
    startGame,
    resetGame,
    changeDirection,
    advanceSnake,
    getTickMs,
    finishGame,
  };
});
