const assert = require("assert");
const {
  GRID_SIZE,
  createEmptyState,
  startGame,
  moveBoard,
  moveGame,
  canMove,
  resetGame,
} = require("../public/games/2048/game-state");

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

function board(rows) {
  return rows.map((row) => [...row]);
}

function sequenceTiles(tiles) {
  let index = 0;

  return () => {
    const tile = tiles[index];
    index += 1;
    return tile;
  };
}

test("creates an idle empty 2048 state", () => {
  const state = createEmptyState(64);

  assert.strictEqual(GRID_SIZE, 4);
  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 64);
  assert.strictEqual(state.won, false);
  assert.deepStrictEqual(state.board, board([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]));
});

test("starts a game with two generated tiles", () => {
  const state = startGame(
    createEmptyState(12),
    sequenceTiles([
      { x: 0, y: 0, value: 2 },
      { x: 3, y: 3, value: 4 },
    ])
  );

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.bestScore, 12);
  assert.deepStrictEqual(state.board, board([
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 4],
  ]));
});

test("merges each tile only once when moving left", () => {
  const result = moveBoard(
    board([
      [2, 2, 2, 2],
      [4, 4, 8, 0],
      [0, 0, 0, 0],
      [2, 0, 2, 4],
    ]),
    "left"
  );

  assert.strictEqual(result.moved, true);
  assert.strictEqual(result.scoreDelta, 20);
  assert.deepStrictEqual(result.board, board([
    [4, 4, 0, 0],
    [8, 8, 0, 0],
    [0, 0, 0, 0],
    [4, 4, 0, 0],
  ]));
});

test("moves upward and scores merged tiles", () => {
  const result = moveBoard(
    board([
      [2, 0, 2, 4],
      [2, 4, 2, 4],
      [0, 4, 0, 8],
      [2, 0, 0, 8],
    ]),
    "up"
  );

  assert.strictEqual(result.scoreDelta, 40);
  assert.deepStrictEqual(result.board, board([
    [4, 8, 4, 8],
    [2, 0, 0, 16],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]));
});

test("does not add a tile when a move changes nothing", () => {
  const state = {
    ...createEmptyState(),
    status: "playing",
    board: board([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64],
    ]),
  };
  const nextState = moveGame(state, "left", () => {
    throw new Error("should not create a tile");
  });

  assert.strictEqual(nextState.status, "finished");
  assert.strictEqual(nextState.score, 0);
  assert.deepStrictEqual(nextState.board, state.board);
});

test("adds one tile after a valid game move", () => {
  const state = {
    ...createEmptyState(),
    status: "playing",
    board: board([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]),
  };
  const nextState = moveGame(state, "left", sequenceTiles([{ x: 3, y: 3, value: 2 }]));

  assert.strictEqual(nextState.score, 4);
  assert.strictEqual(nextState.bestScore, 4);
  assert.strictEqual(nextState.status, "playing");
  assert.deepStrictEqual(nextState.board, board([
    [4, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 2],
  ]));
});

test("marks the game as won when a move creates 2048", () => {
  const state = {
    ...createEmptyState(),
    status: "playing",
    board: board([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]),
  };
  const nextState = moveGame(state, "left", sequenceTiles([{ x: 2, y: 0, value: 2 }]));

  assert.strictEqual(nextState.won, true);
  assert.strictEqual(nextState.status, "won");
});

test("detects when no moves remain", () => {
  assert.strictEqual(
    canMove(
      board([
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ])
    ),
    false
  );
  assert.strictEqual(
    canMove(
      board([
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 0],
      ])
    ),
    true
  );
});

test("reset clears the board and preserves best score", () => {
  const state = resetGame({
    ...createEmptyState(20),
    status: "finished",
    score: 12,
  });

  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 20);
});
