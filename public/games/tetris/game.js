const BEST_SCORE_KEY = "server-game-demo-tetris-best-score";
const DROP_MS = 620;
const STATUS_LABELS = {
  idle: "待开始",
  playing: "进行中",
  paused: "暂停",
  finished: "结束",
};
const KEY_ACTIONS = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowDown: "down",
  KeyS: "down",
  ArrowUp: "rotate",
  KeyW: "rotate",
  KeyX: "rotate",
  Space: "drop",
};

const boardElement = document.getElementById("tetris-board");
const scoreText = document.getElementById("score");
const linesText = document.getElementById("lines");
const bestScoreText = document.getElementById("best-score");
const statusText = document.getElementById("status");
const messageText = document.getElementById("message");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const actionButtons = document.querySelectorAll("[data-action]");

let dropTimerId = null;
let state = TetrisState.createInitialState(loadBestScore());
const leaderboard = LeaderboardWidget.create({
  game: "tetris",
  getScore: () => state.score,
  canSubmit: () => state.status === "finished" && state.score > 0,
});

function loadBestScore() {
  const storedBestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(storedBestScore) ? storedBestScore : 0;
}

function saveBestScore(bestScore) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

function stopLoop() {
  if (dropTimerId !== null) {
    window.clearInterval(dropTimerId);
    dropTimerId = null;
  }
}

function startLoop() {
  stopLoop();
  dropTimerId = window.setInterval(() => {
    state = TetrisState.tick(state);

    if (state.status === "finished") {
      stopLoop();
    }

    saveBestScore(state.bestScore);
    render();
  }, DROP_MS);
}

function getMessage() {
  if (state.status === "idle") {
    return "方向键或 WASD 移动，上键旋转，空格直接落底。";
  }

  if (state.status === "paused") {
    return "游戏已暂停。";
  }

  if (state.status === "finished") {
    return `方块堆到顶部了，本局 ${state.score} 分。`;
  }

  return "把方块拼成完整横行，满一行就会消除并加分。";
}

function getVisibleBoard() {
  const board = state.board.map((row) => [...row]);

  if (!state.activePiece) {
    return board;
  }

  TetrisState.getPieceCells(state.activePiece).forEach((cell) => {
    if (cell.y >= 0 && cell.y < TetrisState.BOARD_HEIGHT && cell.x >= 0 && cell.x < TetrisState.BOARD_WIDTH) {
      board[cell.y][cell.x] = state.activePiece.type;
    }
  });

  return board;
}

function renderBoard() {
  const board = getVisibleBoard();
  boardElement.replaceChildren();

  board.forEach((row, y) => {
    row.forEach((type, x) => {
      const cell = document.createElement("div");
      cell.className = "tetris-cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", type ? `${type} 方块 ${x + 1}, ${y + 1}` : `空格 ${x + 1}, ${y + 1}`);

      if (type) {
        cell.dataset.piece = type;
      }

      boardElement.appendChild(cell);
    });
  });
}

function render() {
  scoreText.textContent = state.score;
  linesText.textContent = state.lines;
  bestScoreText.textContent = state.bestScore;
  statusText.textContent = STATUS_LABELS[state.status];
  messageText.textContent = getMessage();
  startButton.textContent = state.status === "idle" ? "开始" : "重新开始";
  pauseButton.textContent = state.status === "paused" ? "继续" : "暂停";
  pauseButton.disabled = state.status !== "playing" && state.status !== "paused";
  leaderboard.refreshDisplay();
  renderBoard();
}

function startRound() {
  stopLoop();
  leaderboard.resetSubmission();
  state = TetrisState.startGame(state);
  saveBestScore(state.bestScore);

  if (state.status === "playing") {
    startLoop();
  }

  render();
}

function resetRound() {
  stopLoop();
  leaderboard.resetSubmission();
  state = TetrisState.resetGame(state);
  saveBestScore(state.bestScore);
  render();
}

function togglePause() {
  if (state.status === "playing") {
    stopLoop();
    state = { ...state, status: "paused" };
  } else if (state.status === "paused") {
    state = { ...state, status: "playing" };
    startLoop();
  }

  render();
}

function applyAction(action) {
  if (state.status === "idle" && action !== "drop") {
    startRound();
  }

  if (state.status !== "playing") {
    return;
  }

  if (action === "left") {
    state = TetrisState.movePiece(state, -1, 0);
  } else if (action === "right") {
    state = TetrisState.movePiece(state, 1, 0);
  } else if (action === "rotate") {
    state = TetrisState.rotatePiece(state);
  } else if (action === "down") {
    state = TetrisState.tick(state);
  } else if (action === "drop") {
    state = TetrisState.hardDrop(state);
  }

  if (state.status === "finished") {
    stopLoop();
  }

  saveBestScore(state.bestScore);
  render();
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Enter") {
    event.preventDefault();
    startRound();
    return;
  }

  if (event.code === "KeyP") {
    event.preventDefault();
    togglePause();
    return;
  }

  const action = KEY_ACTIONS[event.code];

  if (!action) {
    return;
  }

  event.preventDefault();
  applyAction(action);
});

startButton.addEventListener("click", startRound);
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetRound);
actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyAction(button.dataset.action);
  });
});

render();
leaderboard.load();
