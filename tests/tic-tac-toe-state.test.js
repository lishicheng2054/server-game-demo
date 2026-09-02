const assert = require("assert");
const {
  BOARD_CELLS,
  createInitialState,
  makeMove,
  resetGame,
} = require("../public/games/tic-tac-toe/game-state");

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

function playMoves(moves) {
  return moves.reduce((state, cell) => makeMove(state, cell), createInitialState());
}

test("creates an empty tic-tac-toe game", () => {
  const state = createInitialState({ x: 2, o: 1, draws: 3 });

  assert.strictEqual(BOARD_CELLS, 9);
  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.currentPlayer, "X");
  assert.strictEqual(state.winner, null);
  assert.deepStrictEqual(state.board, Array(9).fill(null));
  assert.deepStrictEqual(state.scores, { x: 2, o: 1, draws: 3 });
});

test("places a mark and switches turn", () => {
  const state = makeMove(createInitialState(), 0);

  assert.strictEqual(state.board[0], "X");
  assert.strictEqual(state.currentPlayer, "O");
  assert.strictEqual(state.status, "playing");
});

test("rejects moves on occupied cells", () => {
  const first = makeMove(createInitialState(), 0);
  const second = makeMove(first, 0);

  assert.deepStrictEqual(second.board, first.board);
  assert.strictEqual(second.currentPlayer, "O");
});

test("detects an X win", () => {
  const state = playMoves([0, 3, 1, 4, 2]);

  assert.strictEqual(state.status, "finished");
  assert.strictEqual(state.winner, "X");
  assert.deepStrictEqual(state.winLine, [0, 1, 2]);
  assert.strictEqual(state.scores.x, 1);
});

test("detects an O win", () => {
  const state = playMoves([0, 3, 1, 4, 8, 5]);

  assert.strictEqual(state.status, "finished");
  assert.strictEqual(state.winner, "O");
  assert.deepStrictEqual(state.winLine, [3, 4, 5]);
  assert.strictEqual(state.scores.o, 1);
});

test("detects a draw", () => {
  const state = playMoves([0, 1, 2, 4, 3, 5, 7, 6, 8]);

  assert.strictEqual(state.status, "finished");
  assert.strictEqual(state.winner, "draw");
  assert.strictEqual(state.scores.draws, 1);
});

test("does not allow moves after the game finishes", () => {
  const finished = playMoves([0, 3, 1, 4, 2]);
  const state = makeMove(finished, 8);

  assert.deepStrictEqual(state.board, finished.board);
  assert.strictEqual(state.winner, "X");
});

test("reset clears the board and preserves scores", () => {
  const finished = playMoves([0, 3, 1, 4, 2]);
  const state = resetGame(finished);

  assert.strictEqual(state.status, "playing");
  assert.deepStrictEqual(state.board, Array(9).fill(null));
  assert.deepStrictEqual(state.scores, { x: 1, o: 0, draws: 0 });
});
