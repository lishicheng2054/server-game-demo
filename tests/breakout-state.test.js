const assert = require("assert");
const {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BALL_RADIUS,
  PADDLE_WIDTH,
  BRICK_COLUMNS,
  BRICK_ROWS,
  createInitialState,
  startGame,
  movePaddle,
  advanceGame,
  resetGame,
} = require("../public/games/breakout/game-state");

function test(name, run) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

function playingState(overrides = {}) {
  return {
    ...createInitialState(),
    status: "playing",
    ...overrides,
  };
}

test("creates an idle breakout state with a full brick wall", () => {
  const state = createInitialState(30);

  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 30);
  assert.strictEqual(state.lives, 3);
  assert.strictEqual(state.bricks.length, BRICK_COLUMNS * BRICK_ROWS);
  assert.ok(state.bricks.every((brick) => brick.alive));
  assert.strictEqual(state.paddle.width, PADDLE_WIDTH);
});

test("starts a new game while preserving best score", () => {
  const state = startGame({
    ...createInitialState(80),
    status: "finished",
    score: 40,
  });

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 80);
  assert.strictEqual(state.lives, 3);
});

test("moves the paddle and clamps it inside the board", () => {
  const state = playingState();

  assert.strictEqual(movePaddle(state, -999).paddle.x, 0);
  assert.strictEqual(movePaddle(state, 999).paddle.x, BOARD_WIDTH - PADDLE_WIDTH);
});

test("bounces the ball off side and top walls", () => {
  const sideBounce = advanceGame(
    playingState({
      ball: { x: BALL_RADIUS + 1, y: 100, vx: -5, vy: -2 },
    })
  );
  const topBounce = advanceGame(
    playingState({
      ball: { x: 100, y: BALL_RADIUS + 1, vx: 2, vy: -5 },
    })
  );

  assert.ok(sideBounce.ball.vx > 0);
  assert.ok(topBounce.ball.vy > 0);
});

test("bounces upward when the ball hits the paddle", () => {
  const state = playingState({
    paddle: { x: 190, y: 292, width: PADDLE_WIDTH, height: 12 },
    ball: { x: 230, y: 285, vx: 1, vy: 6 },
  });
  const nextState = advanceGame(state);

  assert.ok(nextState.ball.vy < 0);
  assert.strictEqual(nextState.status, "playing");
});

test("removes a hit brick and adds score", () => {
  const state = playingState();
  const targetBrick = state.bricks[0];
  const nextState = advanceGame({
    ...state,
    ball: {
      x: targetBrick.x + targetBrick.width / 2,
      y: targetBrick.y + targetBrick.height + BALL_RADIUS - 1,
      vx: 0,
      vy: -4,
    },
  });

  assert.strictEqual(nextState.score, 10);
  assert.strictEqual(nextState.bestScore, 10);
  assert.strictEqual(nextState.bricks[0].alive, false);
  assert.ok(nextState.ball.vy > 0);
});

test("loses a life and resets the ball after missing the paddle", () => {
  const state = advanceGame(
    playingState({
      lives: 3,
      ball: { x: 20, y: BOARD_HEIGHT + BALL_RADIUS + 1, vx: 2, vy: 5 },
    })
  );

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.lives, 2);
  assert.ok(state.ball.y < BOARD_HEIGHT);
});

test("finishes after missing the paddle on the last life", () => {
  const state = advanceGame(
    playingState({
      lives: 1,
      score: 50,
      bestScore: 20,
      ball: { x: 20, y: BOARD_HEIGHT + BALL_RADIUS + 1, vx: 2, vy: 5 },
    })
  );

  assert.strictEqual(state.status, "finished");
  assert.strictEqual(state.lives, 0);
  assert.strictEqual(state.bestScore, 50);
});

test("wins when the last brick is removed", () => {
  const baseState = createInitialState();
  const bricks = baseState.bricks.map((brick, index) => ({
    ...brick,
    alive: index === 0,
  }));
  const targetBrick = bricks[0];
  const state = advanceGame(
    playingState({
      bricks,
      ball: {
        x: targetBrick.x + targetBrick.width / 2,
        y: targetBrick.y + targetBrick.height + BALL_RADIUS - 1,
        vx: 0,
        vy: -4,
      },
    })
  );

  assert.strictEqual(state.status, "won");
  assert.strictEqual(state.score, 10);
});

test("reset clears the current game and preserves best score", () => {
  const state = resetGame({
    ...createInitialState(90),
    status: "finished",
    score: 70,
  });

  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 90);
});
