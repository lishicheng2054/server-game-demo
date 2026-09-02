const BEST_SCORE_KEY = "server-game-demo-2048-best-score";
const SWIPE_THRESHOLD_PX = 24;
const KEY_DIRECTIONS = {
  ArrowUp: "up",
  KeyW: "up",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
};
const STATUS_LABELS = {
  idle: "待开始",
  playing: "进行中",
  won: "胜利",
  finished: "结束",
};

const boardElement = document.getElementById("puzzle-board");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best-score");
const statusText = document.getElementById("status");
const messageText = document.getElementById("message");
const startButton = document.getElementById("start");
const directionButtons = document.querySelectorAll("[data-direction]");

let touchStart = null;
let state = Game2048State.createEmptyState(loadBestScore());
const leaderboard = LeaderboardWidget.create({
  game: "2048",
  getScore: () => state.score,
  canSubmit: () => (state.status === "won" || state.status === "finished") && state.score > 0,
});

function loadBestScore() {
  const storedBestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(storedBestScore) ? storedBestScore : 0;
}

function saveBestScore(bestScore) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

function getTileClass(value) {
  return value > 2048 ? "tile-super" : `tile-${value}`;
}

function getMessage() {
  if (state.status === "idle") {
    return "方向键或 WASD 移动方块，相同数字碰到一起会合并。";
  }

  if (state.status === "won") {
    return `你合成了 2048，本局 ${state.score} 分。点击开始新局可以重新挑战。`;
  }

  if (state.status === "finished") {
    return `没有可以移动的方向了，本局 ${state.score} 分。`;
  }

  return "把相同数字合并起来，目标是做出 2048。";
}

function renderBoard() {
  boardElement.replaceChildren();

  state.board.forEach((row, y) => {
    row.forEach((value, x) => {
      const cell = document.createElement("div");
      cell.className = "puzzle-cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", value === 0 ? `空格 ${x + 1}, ${y + 1}` : `${value}`);

      if (value !== 0) {
        const tile = document.createElement("span");
        tile.className = `puzzle-tile ${getTileClass(value)}`;
        tile.textContent = value;
        cell.appendChild(tile);
      }

      boardElement.appendChild(cell);
    });
  });
}

function render() {
  scoreText.textContent = state.score;
  bestScoreText.textContent = state.bestScore;
  statusText.textContent = STATUS_LABELS[state.status];
  startButton.textContent = state.status === "idle" ? "开始新局" : "重新开始";
  messageText.textContent = getMessage();
  renderBoard();
  leaderboard.refreshDisplay();
}

function startRound() {
  leaderboard.resetSubmission();
  state = Game2048State.startGame(state);
  saveBestScore(state.bestScore);
  render();
}

function applyDirection(direction) {
  if (state.status === "idle") {
    startRound();
  }

  const nextState = Game2048State.moveGame(state, direction);

  if (nextState === state) {
    return;
  }

  state = nextState;
  saveBestScore(state.bestScore);
  render();
}

document.addEventListener("keydown", (event) => {
  const direction = KEY_DIRECTIONS[event.code];

  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
});

boardElement.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
});

boardElement.addEventListener("touchmove", (event) => {
  event.preventDefault();
});

boardElement.addEventListener("touchend", (event) => {
  if (!touchStart) {
    return;
  }

  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) {
    touchStart = null;
    return;
  }

  applyDirection(isHorizontal ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  touchStart = null;
});

startButton.addEventListener("click", startRound);
directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
});

render();
leaderboard.load();
