const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  ALLOWED_GAMES,
  createLeaderboardStore,
  normalizeScoreEntry,
} = require("../backend/leaderboard-service");

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

function createTempStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "server-game-leaderboard-"));
  return createLeaderboardStore(path.join(directory, "leaderboard.json"));
}

function createTempDataFile() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "server-game-leaderboard-"));
  return path.join(directory, "leaderboard.json");
}

test("normalizes and validates score entries", () => {
  const entry = normalizeScoreEntry({
    game: "tetris",
    playerName: "  小李  ",
    score: 300,
  });

  assert.strictEqual(entry.game, "tetris");
  assert.strictEqual(entry.playerName, "小李");
  assert.strictEqual(entry.score, 300);
  assert.match(entry.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("rejects invalid leaderboard input", () => {
  assert.throws(() => normalizeScoreEntry({ game: "bad", playerName: "A", score: 1 }), /Unsupported game/);
  assert.throws(() => normalizeScoreEntry({ game: "tetris", playerName: "", score: 1 }), /Player name/);
  assert.throws(() => normalizeScoreEntry({ game: "tetris", playerName: "<script>", score: 1 }), /Player name/);
  assert.throws(() => normalizeScoreEntry({ game: "tetris", playerName: "A", score: -1 }), /Score/);
});

test("stores leaderboard entries sorted by score", () => {
  const store = createTempStore();

  store.addScore({ game: "tetris", playerName: "A", score: 100 });
  store.addScore({ game: "tetris", playerName: "B", score: 300 });
  store.addScore({ game: "tetris", playerName: "C", score: 200 });

  const entries = store.getScores("tetris");

  assert.deepStrictEqual(entries.map((entry) => entry.playerName), ["B", "C", "A"]);
  assert.deepStrictEqual(entries.map((entry) => entry.score), [300, 200, 100]);
});

test("preserves stored creation timestamps", () => {
  const dataFile = createTempDataFile();
  const createdAt = "2026-08-27T00:00:00.000Z";
  fs.writeFileSync(
    dataFile,
    JSON.stringify({
      tetris: [{ game: "tetris", playerName: "A", score: 100, createdAt }],
    }),
    "utf8"
  );

  const store = createLeaderboardStore(dataFile);
  const entries = store.getScores("tetris");

  assert.strictEqual(entries[0].createdAt, createdAt);
});

test("keeps only the top 10 entries for each game", () => {
  const store = createTempStore();

  for (let score = 1; score <= 12; score += 1) {
    store.addScore({ game: "tetris", playerName: `P${score}`, score });
  }

  const entries = store.getScores("tetris");

  assert.strictEqual(entries.length, 10);
  assert.strictEqual(entries[0].score, 12);
  assert.strictEqual(entries[9].score, 3);
});

test("returns empty scores for supported games with no entries", () => {
  const store = createTempStore();

  assert.ok(ALLOWED_GAMES.includes("tetris"));
  assert.deepStrictEqual(store.getScores("snake"), []);
});
