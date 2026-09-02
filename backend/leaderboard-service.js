const fs = require("fs");
const path = require("path");

const ALLOWED_GAMES = ["snake", "2048", "breakout", "tic-tac-toe", "memory", "minesweeper", "tetris"];
const MAX_ENTRIES_PER_GAME = 10;
const MAX_PLAYER_NAME_LENGTH = 16;
const MAX_SCORE = 999999;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function createValidationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function normalizePlayerName(value) {
  if (typeof value !== "string") {
    throw createValidationError("Player name is required.");
  }

  const playerName = value.trim().replace(/\s+/g, " ");

  if (playerName.length < 1 || playerName.length > MAX_PLAYER_NAME_LENGTH) {
    throw createValidationError(`Player name must be 1-${MAX_PLAYER_NAME_LENGTH} characters.`);
  }

  if (/[<>]/.test(playerName)) {
    throw createValidationError("Player name contains unsupported characters.");
  }

  return playerName;
}

function normalizeScoreEntry(input) {
  if (!isPlainObject(input)) {
    throw createValidationError("Score payload must be an object.");
  }

  if (!ALLOWED_GAMES.includes(input.game)) {
    throw createValidationError("Unsupported game.");
  }

  const score = Number(input.score);

  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    throw createValidationError(`Score must be an integer between 0 and ${MAX_SCORE}.`);
  }

  return {
    game: input.game,
    playerName: normalizePlayerName(input.playerName),
    score,
    createdAt: new Date().toISOString(),
  };
}

function normalizeStoredEntry(game, input) {
  const entry = normalizeScoreEntry({
    game,
    playerName: input.playerName,
    score: input.score,
  });

  if (typeof input.createdAt === "string" && !Number.isNaN(Date.parse(input.createdAt))) {
    return {
      ...entry,
      createdAt: input.createdAt,
    };
  }

  return entry;
}

function createEmptyData() {
  return ALLOWED_GAMES.reduce((data, game) => {
    return {
      ...data,
      [game]: [],
    };
  }, {});
}

function normalizeStoredData(value) {
  const data = createEmptyData();

  if (!isPlainObject(value)) {
    return data;
  }

  ALLOWED_GAMES.forEach((game) => {
    if (!Array.isArray(value[game])) {
      return;
    }

    data[game] = value[game]
      .filter(isPlainObject)
      .map((entry) => {
        try {
          return normalizeStoredEntry(game, entry);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score)
      .slice(0, MAX_ENTRIES_PER_GAME);
  });

  return data;
}

function readDataFile(dataFile) {
  if (!fs.existsSync(dataFile)) {
    return createEmptyData();
  }

  try {
    return normalizeStoredData(JSON.parse(fs.readFileSync(dataFile, "utf8")));
  } catch (error) {
    return createEmptyData();
  }
}

function writeDataFile(dataFile, data) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  fs.writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function createLeaderboardStore(dataFile) {
  function getData() {
    return readDataFile(dataFile);
  }

  function saveData(data) {
    writeDataFile(dataFile, data);
  }

  return {
    getScores(game) {
      if (!ALLOWED_GAMES.includes(game)) {
        throw createValidationError("Unsupported game.");
      }

      return getData()[game].map((entry) => ({ ...entry }));
    },

    addScore(input) {
      const entry = normalizeScoreEntry(input);
      const data = getData();
      const entries = [...data[entry.game], entry]
        .sort((left, right) => right.score - left.score)
        .slice(0, MAX_ENTRIES_PER_GAME);
      const nextData = {
        ...data,
        [entry.game]: entries,
      };

      saveData(nextData);

      return {
        entry: { ...entry },
        entries: entries.map((storedEntry) => ({ ...storedEntry })),
      };
    },
  };
}

module.exports = {
  ALLOWED_GAMES,
  MAX_ENTRIES_PER_GAME,
  createLeaderboardStore,
  normalizeScoreEntry,
};
