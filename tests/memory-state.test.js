const assert = require("assert");
const {
  PAIR_COUNT,
  createInitialState,
  selectCard,
  resolveMismatch,
  resetGame,
} = require("../public/games/memory/game-state");

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

function identityShuffle(cards) {
  return cards;
}

test("creates a shuffled memory deck", () => {
  const state = createInitialState(identityShuffle, 18);
  const values = state.cards.map((card) => card.value);

  assert.strictEqual(PAIR_COUNT, 8);
  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.cards.length, 16);
  assert.strictEqual(state.moves, 0);
  assert.strictEqual(state.bestMoves, 18);
  assert.deepStrictEqual(values.slice(0, 4), ["A", "A", "B", "B"]);
});

test("selects a first card", () => {
  const state = selectCard(createInitialState(identityShuffle), 0);

  assert.deepStrictEqual(state.selectedIds, [0]);
  assert.strictEqual(state.moves, 0);
  assert.strictEqual(state.cards[0].faceUp, true);
});

test("matches a pair and counts a move", () => {
  const state = selectCard(selectCard(createInitialState(identityShuffle), 0), 1);

  assert.strictEqual(state.moves, 1);
  assert.deepStrictEqual(state.selectedIds, []);
  assert.strictEqual(state.matchedPairs, 1);
  assert.strictEqual(state.cards[0].matched, true);
  assert.strictEqual(state.cards[1].matched, true);
});

test("locks after selecting a mismatched pair", () => {
  const state = selectCard(selectCard(createInitialState(identityShuffle), 0), 2);

  assert.strictEqual(state.moves, 1);
  assert.strictEqual(state.locked, true);
  assert.deepStrictEqual(state.selectedIds, [0, 2]);
  assert.strictEqual(state.cards[0].faceUp, true);
  assert.strictEqual(state.cards[2].faceUp, true);
});

test("resolveMismatch turns unmatched selected cards back down", () => {
  const locked = selectCard(selectCard(createInitialState(identityShuffle), 0), 2);
  const state = resolveMismatch(locked);

  assert.strictEqual(state.locked, false);
  assert.deepStrictEqual(state.selectedIds, []);
  assert.strictEqual(state.cards[0].faceUp, false);
  assert.strictEqual(state.cards[2].faceUp, false);
});

test("ignores selections while locked", () => {
  const locked = selectCard(selectCard(createInitialState(identityShuffle), 0), 2);
  const state = selectCard(locked, 4);

  assert.deepStrictEqual(state.selectedIds, [0, 2]);
  assert.strictEqual(state.cards[4].faceUp, false);
});

test("wins when all pairs are matched", () => {
  let state = createInitialState(identityShuffle);

  for (let index = 0; index < state.cards.length; index += 2) {
    state = selectCard(selectCard(state, index), index + 1);
  }

  assert.strictEqual(state.status, "won");
  assert.strictEqual(state.matchedPairs, PAIR_COUNT);
  assert.strictEqual(state.bestMoves, 8);
});

test("reset starts a new deck and preserves best moves", () => {
  const state = resetGame({
    ...createInitialState(identityShuffle, 12),
    moves: 20,
    status: "won",
  }, identityShuffle);

  assert.strictEqual(state.status, "playing");
  assert.strictEqual(state.moves, 0);
  assert.strictEqual(state.bestMoves, 12);
  assert.strictEqual(state.matchedPairs, 0);
});
