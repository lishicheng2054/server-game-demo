(function exposeBreakoutState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.BreakoutState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createBreakoutStateApi() {
  const BOARD_WIDTH = 480;
  const BOARD_HEIGHT = 320;
  const BALL_RADIUS = 7;
  const PADDLE_WIDTH = 86;
  const PADDLE_HEIGHT = 12;
  const PADDLE_Y = 292;
  const BRICK_COLUMNS = 8;
  const BRICK_ROWS = 4;
  const BRICK_WIDTH = 48;
  const BRICK_HEIGHT = 16;
  const BRICK_GAP = 8;
  const BRICK_OFFSET_X = 18;
  const BRICK_OFFSET_Y = 42;
  const BRICK_SCORE = 10;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function createInitialBall() {
    return {
      x: BOARD_WIDTH / 2,
      y: PADDLE_Y - BALL_RADIUS - 4,
      vx: 3,
      vy: -4,
    };
  }

  function createInitialPaddle() {
    return {
      x: (BOARD_WIDTH - PADDLE_WIDTH) / 2,
      y: PADDLE_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    };
  }

  function createBricks() {
    const bricks = [];

    for (let row = 0; row < BRICK_ROWS; row += 1) {
      for (let column = 0; column < BRICK_COLUMNS; column += 1) {
        bricks.push({
          x: BRICK_OFFSET_X + column * (BRICK_WIDTH + BRICK_GAP),
          y: BRICK_OFFSET_Y + row * (BRICK_HEIGHT + BRICK_GAP),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          alive: true,
        });
      }
    }

    return bricks;
  }

  function cloneBricks(bricks) {
    return bricks.map((brick) => ({ ...brick }));
  }

  function createRoundState(bestScore = 0) {
    return {
      status: "idle",
      score: 0,
      bestScore,
      lives: 3,
      ball: createInitialBall(),
      paddle: createInitialPaddle(),
      bricks: createBricks(),
    };
  }

  function createInitialState(bestScore = 0) {
    return createRoundState(bestScore);
  }

  function startGame(state) {
    return {
      ...createRoundState(state.bestScore),
      status: "playing",
    };
  }

  function resetGame(state) {
    return createRoundState(state.bestScore);
  }

  function movePaddle(state, x) {
    return {
      ...state,
      paddle: {
        ...state.paddle,
        x: clamp(x, 0, BOARD_WIDTH - state.paddle.width),
      },
      bricks: cloneBricks(state.bricks),
      ball: { ...state.ball },
    };
  }

  function circleIntersectsRect(circle, rect) {
    const nearestX = clamp(circle.x, rect.x, rect.x + rect.width);
    const nearestY = clamp(circle.y, rect.y, rect.y + rect.height);
    const dx = circle.x - nearestX;
    const dy = circle.y - nearestY;

    return dx * dx + dy * dy <= BALL_RADIUS * BALL_RADIUS;
  }

  function resetAfterMiss(state, nextLives) {
    return {
      ...state,
      lives: nextLives,
      ball: createInitialBall(),
      paddle: createInitialPaddle(),
      bricks: cloneBricks(state.bricks),
      status: nextLives > 0 ? "playing" : "finished",
      bestScore: Math.max(state.bestScore, state.score),
    };
  }

  function advanceGame(state) {
    if (state.status !== "playing") {
      return {
        ...state,
        ball: { ...state.ball },
        paddle: { ...state.paddle },
        bricks: cloneBricks(state.bricks),
      };
    }

    const ball = {
      ...state.ball,
      x: state.ball.x + state.ball.vx,
      y: state.ball.y + state.ball.vy,
    };
    let score = state.score;
    let bricks = cloneBricks(state.bricks);

    if (ball.x - BALL_RADIUS <= 0) {
      ball.x = BALL_RADIUS;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + BALL_RADIUS >= BOARD_WIDTH) {
      ball.x = BOARD_WIDTH - BALL_RADIUS;
      ball.vx = -Math.abs(ball.vx);
    }

    if (ball.y - BALL_RADIUS <= 0) {
      ball.y = BALL_RADIUS;
      ball.vy = Math.abs(ball.vy);
    }

    if (ball.y - BALL_RADIUS > BOARD_HEIGHT) {
      return resetAfterMiss(
        {
          ...state,
          ball,
          bricks,
        },
        state.lives - 1
      );
    }

    if (ball.vy > 0 && circleIntersectsRect(ball, state.paddle)) {
      const paddleCenter = state.paddle.x + state.paddle.width / 2;
      const hitOffset = (ball.x - paddleCenter) / (state.paddle.width / 2);
      ball.y = state.paddle.y - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy);
      ball.vx = clamp(ball.vx + hitOffset * 1.5, -6, 6);
    }

    const hitBrickIndex = bricks.findIndex(
      (brick) => brick.alive && circleIntersectsRect(ball, brick)
    );

    if (hitBrickIndex !== -1) {
      bricks = bricks.map((brick, index) =>
        index === hitBrickIndex ? { ...brick, alive: false } : brick
      );
      score += BRICK_SCORE;
      ball.vy *= -1;
    }

    const bestScore = Math.max(state.bestScore, score);
    const hasAliveBricks = bricks.some((brick) => brick.alive);

    return {
      ...state,
      status: hasAliveBricks ? "playing" : "won",
      score,
      bestScore,
      ball,
      paddle: { ...state.paddle },
      bricks,
    };
  }

  return {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    BALL_RADIUS,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BRICK_COLUMNS,
    BRICK_ROWS,
    createInitialState,
    startGame,
    resetGame,
    movePaddle,
    advanceGame,
  };
});
