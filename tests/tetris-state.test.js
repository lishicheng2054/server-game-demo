const assert = require("assert");
const {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  createInitialState,
  startGame,
  movePiece,
  rotatePiece,
  tick,
  hardDrop,
  resetGame,
} = require("../public/games/tetris/game-state");

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

function pieceSequence(types) {
  let index = 0;

  return () => {
    const type = types[index] || types[types.length - 1];
    index += 1;
    return type;
  };
}

function filledRow(value = "O") {
  return Array(BOARD_WIDTH).fill(value);
}

test("creates an idle empty tetris state", () => {
  const state = createInitialState(120);

  assert.strictEqual(BOARD_WIDTH, 10);
  assert.strictEqual(BOARD_HEIGHT, 20);
  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.lines, 0);
  assert.strictEqual(state.bestScore, 120);
  assert.strictEqual(state.activePiece, null);
  assert.strictEqual(state.board.length, BOARD_HEIGHT);
  assert.ok(state.board.every((row) => row.every((cell) => cell === "")));
});

test("starts with a deterministic active piece", () => {
  const state = startGame(createInitialState(30), pieceSequence(["I"]));

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.bestScore, 30);
  assert.strictEqual(state.activePiece.type, "I");
  assert.strictEqual(state.activePiece.x, 3);
  assert.strictEqual(state.activePiece.y, 0);
});

test("moves the active piece left and right inside the board", () => {
  const state = startGame(createInitialState(), pieceSequence(["O"]));
  const left = movePiece(state, -1, 0);
  const right = movePiece(left, 1, 0);

  assert.strictEqual(left.activePiece.x, state.activePiece.x - 1);
  assert.strictEqual(right.activePiece.x, state.activePiece.x);
});

test("blocks movement through the board wall", () => {
  let state = startGame(createInitialState(), pieceSequence(["O"]));

  for (let index = 0; index < 20; index += 1) {
    state = movePiece(state, -1, 0);
  }

  assert.strictEqual(state.activePiece.x, 0);
});

test("rotates a piece when space is available", () => {
  const state = startGame(createInitialState(), pieceSequence(["L"]));
  const rotated = rotatePiece(state);

  assert.strictEqual(rotated.activePiece.rotation, 1);
});

test("tick moves a piece down by one row", () => {
  const state = startGame(createInitialState(), pieceSequence(["O"]));
  const nextState = tick(state, pieceSequence(["I"]));

  assert.strictEqual(nextState.activePiece.y, state.activePiece.y + 1);
});

test("tick is ignored before a game starts", () => {
  const state = createInitialState(80);
  const nextState = tick(state, pieceSequence(["I"]));

  assert.strictEqual(nextState.status, "idle");
  assert.strictEqual(nextState.activePiece, null);
  assert.strictEqual(nextState.bestScore, 80);
});

test("hard drop locks a piece and spawns the next one", () => {
  const state = startGame(createInitialState(), pieceSequence(["O"]));
  const nextState = hardDrop(state, pieceSequence(["I"]));
  const lockedCells = nextState.board.flat().filter(Boolean);

  assert.strictEqual(lockedCells.length, 4);
  assert.strictEqual(nextState.activePiece.type, "I");
});

test("clears full lines and scores", () => {
  const state = startGame(createInitialState(), pieceSequence(["O"]));
  const board = state.board.map((row) => [...row]);
  board[BOARD_HEIGHT - 1] = filledRow();
  board[BOARD_HEIGHT - 2] = ["", "", ...Array(8).fill("T")];
  const nextState = hardDrop(
    {
      ...state,
      board,
      activePiece: { type: "O", x: 0, y: BOARD_HEIGHT - 4, rotation: 0 },
    },
    pieceSequence(["I"])
  );

  assert.strictEqual(nextState.lines, 2);
  assert.strictEqual(nextState.score, 200);
  assert.strictEqual(nextState.bestScore, 200);
});

test("finishes when a new piece cannot spawn", () => {
  const state = createInitialState();
  const board = state.board.map((row) => [...row]);
  board[0] = filledRow("T");
  const nextState = startGame({ ...state, board }, pieceSequence(["O"]));

  assert.strictEqual(nextState.status, "finished");
});

test("reset clears current game but keeps best score", () => {
  const state = resetGame({
    ...createInitialState(500),
    status: "finished",
    score: 200,
  });

  assert.strictEqual(state.status, "idle");
  assert.strictEqual(state.score, 0);
  assert.strictEqual(state.bestScore, 500);
});
