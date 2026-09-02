const assert = require("assert");
const {
  BOARD_SIZE,
  MINE_COUNT,
  createInitialState,
  revealCell,
  toggleFlag,
  resetGame,
} = require("../public/games/minesweeper/game-state");

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

function fixedMines() {
  return [0, 10, 80, 72, 8, 4, 40, 44, 76, 12];
}

test("creates a minesweeper board with fixed mines", () => {
  const state = createInitialState(fixedMines);
  const mines = state.cells.filter((cell) => cell.mine);

  assert.strictEqual(BOARD_SIZE, 9);
  assert.strictEqual(MINE_COUNT, 10);
  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.flagsLeft, 10);
  assert.strictEqual(state.cells.length, 81);
  assert.strictEqual(mines.length, 10);
  assert.ok(state.cells.every((cell) => !cell.revealed && !cell.flagged));
});

test("calculates adjacent mine counts", () => {
  const state = createInitialState(() => [0]);

  assert.strictEqual(state.cells[1].neighborMines, 1);
  assert.strictEqual(state.cells[9].neighborMines, 1);
  assert.strictEqual(state.cells[10].neighborMines, 1);
  assert.strictEqual(state.cells[80].neighborMines, 0);
});

test("reveals a numbered safe cell", () => {
  const state = revealCell(createInitialState(() => [0]), 1);

  assert.strictEqual(state.cells[1].revealed, true);
  assert.strictEqual(state.status, "playing");
});

test("does not reveal flagged cells", () => {
  const flagged = toggleFlag(createInitialState(() => [0]), 1);
  const state = revealCell(flagged, 1);

  assert.strictEqual(state.cells[1].flagged, true);
  assert.strictEqual(state.cells[1].revealed, false);
});

test("toggles flags and updates remaining flag count", () => {
  const flagged = toggleFlag(createInitialState(fixedMines), 5);
  const unflagged = toggleFlag(flagged, 5);

  assert.strictEqual(flagged.cells[5].flagged, true);
  assert.strictEqual(flagged.flagsLeft, 9);
  assert.strictEqual(unflagged.cells[5].flagged, false);
  assert.strictEqual(unflagged.flagsLeft, 10);
});

test("loses when revealing a mine", () => {
  const state = revealCell(createInitialState(() => [0]), 0);

  assert.strictEqual(state.status, "lost");
  assert.strictEqual(state.cells[0].revealed, true);
});

test("flood reveals connected empty cells", () => {
  const state = revealCell(createInitialState(() => [0]), 80);

  assert.strictEqual(state.cells[80].revealed, true);
  assert.strictEqual(state.cells[79].revealed, true);
  assert.strictEqual(state.cells[71].revealed, true);
  assert.strictEqual(state.cells[0].revealed, false);
});

test("wins when every non-mine cell is revealed", () => {
  let state = createInitialState(() => [0]);

  state.cells.forEach((cell) => {
    if (!cell.mine) {
      state = revealCell(state, cell.id);
    }
  });

  assert.strictEqual(state.status, "won");
});

test("reset creates a fresh board", () => {
  const lost = revealCell(createInitialState(fixedMines), 0);
  const state = resetGame(lost, () => [1]);

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.cells[1].mine, true);
  assert.strictEqual(state.flagsLeft, 10);
});
