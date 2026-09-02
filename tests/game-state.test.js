const assert = require("assert");
const {
  BOARD_SIZE,
  createInitialState,
  prepareGame,
  startGame,
  changeDirection,
  advanceSnake,
  getTickMs,
  resetGame,
} = require("../public/games/snake/game-state");

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

function stateWith(overrides) {
  return {
    status: "playing",
    direction: "right",
    nextDirection: "right",
    snake: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ],
    food: { x: 8, y: 5 },
    score: 0,
    bestScore: 0,
    ...overrides,
  };
}

test("creates an idle snake game state", () => {
  const state = createInitialState();

  assert.strictEqual(BOARD_SIZE, 20);
  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.direction, "right");
  assert.strictEqual(state.nextDirection, "right");
  assert.deepStrictEqual(state.directionQueue, []);
  assert.deepStrictEqual(state.snake, [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  assert.deepStrictEqual(state.food, { x: 14, y: 10 });
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 0);
});

test("prepares a countdown state while preserving best score", () => {
  const state = prepareGame({
    ...createInitialState(18),
    status: "finished",
    score: 7,
  });

  assert.strictEqual(state.status, "countdown");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 18);
  assert.deepStrictEqual(state.directionQueue, []);
});

test("starts a new game while preserving best score", () => {
  const state = startGame({
    ...createInitialState(18),
    status: "finished",
    score: 7,
  });

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 18);
  assert.deepStrictEqual(state.snake[0], { x: 10, y: 10 });
  assert.deepStrictEqual(state.directionQueue, []);
});

test("changes direction but rejects direct reversal", () => {
  const state = stateWith({ direction: "right", nextDirection: "right" });
  const upState = changeDirection(state, "up");
  const reversedState = changeDirection(state, "left");

  assert.strictEqual(upState.nextDirection, "up");
  assert.deepStrictEqual(upState.directionQueue, ["up"]);
  assert.strictEqual(reversedState.nextDirection, "right");
});

test("queues quick direction changes and consumes one per move", () => {
  const queuedState = changeDirection(changeDirection(stateWith(), "up"), "left");
  const firstMove = advanceSnake(queuedState);
  const secondMove = advanceSnake(firstMove);

  assert.deepStrictEqual(queuedState.directionQueue, ["up", "left"]);
  assert.strictEqual(firstMove.direction, "up");
  assert.deepStrictEqual(firstMove.directionQueue, ["left"]);
  assert.deepStrictEqual(firstMove.snake[0], { x: 5, y: 4 });
  assert.strictEqual(secondMove.direction, "left");
  assert.deepStrictEqual(secondMove.directionQueue, []);
  assert.deepStrictEqual(secondMove.snake[0], { x: 4, y: 4 });
});

test("limits queued directions to avoid stale input", () => {
  const queuedState = changeDirection(
    changeDirection(changeDirection(stateWith(), "up"), "left"),
    "down"
  );

  assert.deepStrictEqual(queuedState.directionQueue, ["up", "left"]);
});

test("moves forward without growing when no food is eaten", () => {
  const state = advanceSnake(stateWith({ food: { x: 8, y: 8 } }));

  assert.deepStrictEqual(state.snake, [
    { x: 6, y: 5 },
    { x: 5, y: 5 },
    { x: 4, y: 5 },
  ]);
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.status, "playing");
});

test("grows and scores when food is eaten", () => {
  const state = advanceSnake(
    stateWith({
      food: { x: 6, y: 5 },
    }),
    () => ({ x: 2, y: 2 })
  );

  assert.strictEqual(state.snake.length, 4);
  assert.deepStrictEqual(state.snake[0], { x: 6, y: 5 });
  assert.strictEqual(state.score, 1);
  assert.deepStrictEqual(state.food, { x: 2, y: 2 });
});

test("places new food away from the snake", () => {
  const state = advanceSnake(
    stateWith({
      food: { x: 6, y: 5 },
    }),
    (blockedCells) => {
      assert.ok(blockedCells.some((cell) => cell.x === 6 && cell.y === 5));
      return { x: 0, y: 0 };
    }
  );

  assert.deepStrictEqual(state.food, { x: 0, y: 0 });
});

test("finishes when snake hits the wall", () => {
  const state = advanceSnake(
    stateWith({
      snake: [
        { x: BOARD_SIZE - 1, y: 4 },
        { x: BOARD_SIZE - 2, y: 4 },
      ],
      food: { x: 1, y: 1 },
      score: 5,
      bestScore: 3,
    })
  );

  assert.strictEqual(state.status, "finished");
  assert.strictEqual(state.bestScore, 5);
});

test("finishes when snake hits itself", () => {
  const state = advanceSnake(
    stateWith({
      direction: "up",
      nextDirection: "up",
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
      ],
      food: { x: 1, y: 1 },
    })
  );

  assert.strictEqual(state.status, "finished");
});

test("reset clears current score but keeps the best score", () => {
  const state = resetGame({
    ...createInitialState(12),
    status: "finished",
    score: 9,
  });

  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 12);
});

test("speeds up as score increases but keeps a playable minimum", () => {
  assert.strictEqual(getTickMs(0), 150);
  assert.strictEqual(getTickMs(5), 135);
  assert.strictEqual(getTickMs(20), 90);
  assert.strictEqual(getTickMs(100), 70);
});
