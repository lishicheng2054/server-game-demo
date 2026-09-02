const CELL_SIZE = 24;
const BEST_SCORE_KEY = "server-game-demo-snake-best-score";
const COUNTDOWN_DELAY_MS = 700;
const FOOD_PULSE_MS = 220;
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

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best-score");
const lengthText = document.getElementById("snake-length");
const speedText = document.getElementById("speed");
const messageText = document.getElementById("message");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const directionButtons = document.querySelectorAll("[data-direction]");

let moveTimerId = null;
let countdownTimerId = null;
let animationFrameId = null;
let countdownText = "";
let lastStepAt = 0;
let foodPulseUntil = 0;
let previousSnake = [];
let touchStart = null;
let state = GameState.createInitialState(loadBestScore());
const leaderboard = LeaderboardWidget.create({
  game: "snake",
  getScore: () => state.score,
  canSubmit: () => state.status === "finished" && state.score > 0,
});

canvas.width = GameState.BOARD_SIZE * CELL_SIZE;
canvas.height = GameState.BOARD_SIZE * CELL_SIZE;
previousSnake = cloneSnake(state.snake);

function cloneSnake(snake) {
  return snake.map((segment) => ({ ...segment }));
}

function loadBestScore() {
  const storedBestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(storedBestScore) ? storedBestScore : 0;
}

function saveBestScore(bestScore) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAnimationProgress(now) {
  if (state.status !== "playing") {
    return 1;
  }

  return clamp((now - lastStepAt) / GameState.getTickMs(state.score), 0, 1);
}

function interpolateCell(previousCell, currentCell, progress) {
  if (!previousCell) {
    return currentCell;
  }

  return {
    x: previousCell.x + (currentCell.x - previousCell.x) * progress,
    y: previousCell.y + (currentCell.y - previousCell.y) * progress,
  };
}

function drawBoard() {
  context.fillStyle = "#101217";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#222936";
  context.lineWidth = 1;

  for (let index = 0; index <= GameState.BOARD_SIZE; index += 1) {
    const position = index * CELL_SIZE;
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }
}

function drawRoundedCell(cell, color, inset = 2, radius = 5) {
  const x = cell.x * CELL_SIZE + inset;
  const y = cell.y * CELL_SIZE + inset;
  const size = CELL_SIZE - inset * 2;

  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + size - radius, y);
  context.quadraticCurveTo(x + size, y, x + size, y + radius);
  context.lineTo(x + size, y + size - radius);
  context.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  context.lineTo(x + radius, y + size);
  context.quadraticCurveTo(x, y + size, x, y + size - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.fill();
}

function drawFood(now) {
  const isPulsing = now < foodPulseUntil;
  drawRoundedCell(state.food, isPulsing ? "#ff836c" : "#f06449", isPulsing ? 2 : 4, 8);
}

function drawSnake(progress) {
  state.snake.forEach((segment, index) => {
    const previousSegment = previousSnake[index] || segment;
    const visualSegment = interpolateCell(previousSegment, segment, progress);
    drawRoundedCell(visualSegment, index === 0 ? "#f9d65c" : "#2fd07d", 2, 6);
  });

  const head = interpolateCell(previousSnake[0] || state.snake[0], state.snake[0], progress);
  const eyeSize = 2.8;
  const eyeY = head.y * CELL_SIZE + 8;

  context.fillStyle = "#101217";
  context.beginPath();
  context.arc(head.x * CELL_SIZE + 8, eyeY, eyeSize, 0, Math.PI * 2);
  context.arc(head.x * CELL_SIZE + 16, eyeY, eyeSize, 0, Math.PI * 2);
  context.fill();
}

function drawOverlay(text) {
  context.fillStyle = "rgba(16, 18, 23, 0.72)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.font = "bold 26px Arial, Microsoft YaHei, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
}

function render(now = performance.now()) {
  const progress = getAnimationProgress(now);

  scoreText.textContent = state.score;
  bestScoreText.textContent = state.bestScore;
  lengthText.textContent = state.snake.length;
  speedText.textContent = `${GameState.getTickMs(state.score)}ms`;
  pauseButton.textContent = state.status === "paused" ? "继续" : "暂停";
  startButton.disabled = state.status === "countdown" || state.status === "playing";
  pauseButton.disabled = state.status !== "playing" && state.status !== "paused";

  drawBoard();
  drawFood(now);
  drawSnake(progress);

  if (state.status === "idle") {
    messageText.textContent = "方向键或 WASD 控制移动，吃到红色食物就加分。";
    drawOverlay("点击开始游戏");
  } else if (state.status === "countdown") {
    messageText.textContent = "准备开始。";
    drawOverlay(countdownText);
  } else if (state.status === "paused") {
    messageText.textContent = "游戏已暂停。";
    drawOverlay("已暂停");
  } else if (state.status === "finished") {
    messageText.textContent = `游戏结束，本局 ${state.score} 分，最高 ${state.bestScore} 分。`;
    drawOverlay("游戏结束");
  } else {
    messageText.textContent = "吃红色食物，避免撞墙或撞到自己。";
  }

  leaderboard.refreshDisplay();
}

function stopMoveTimer() {
  if (moveTimerId !== null) {
    window.clearTimeout(moveTimerId);
    moveTimerId = null;
  }
}

function stopCountdown() {
  if (countdownTimerId !== null) {
    window.clearTimeout(countdownTimerId);
    countdownTimerId = null;
  }
}

function stopAnimationLoop() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function renderAnimationFrame(now) {
  render(now);
  animationFrameId = window.requestAnimationFrame(renderAnimationFrame);
}

function startAnimationLoop() {
  stopAnimationLoop();
  animationFrameId = window.requestAnimationFrame(renderAnimationFrame);
}

function scheduleNextMove() {
  stopMoveTimer();
  moveTimerId = window.setTimeout(() => {
    const previousScore = state.score;
    previousSnake = cloneSnake(state.snake);
    state = GameState.advanceSnake(state);
    lastStepAt = performance.now();

    if (state.score > previousScore) {
      foodPulseUntil = lastStepAt + FOOD_PULSE_MS;
    }

    if (state.status === "finished") {
      stopMoveTimer();
      stopAnimationLoop();
      saveBestScore(state.bestScore);
      render();
      return;
    }

    scheduleNextMove();
  }, GameState.getTickMs(state.score));
}

function startPlaying() {
  state = GameState.startGame(state);
  previousSnake = cloneSnake(state.snake);
  lastStepAt = performance.now();
  countdownText = "";
  render();
  startAnimationLoop();
  scheduleNextMove();
}

function runCountdown(step) {
  if (step > 0) {
    countdownText = String(step);
    render();
    countdownTimerId = window.setTimeout(() => runCountdown(step - 1), COUNTDOWN_DELAY_MS);
    return;
  }

  countdownText = "GO";
  render();
  countdownTimerId = window.setTimeout(startPlaying, COUNTDOWN_DELAY_MS);
}

function startRound() {
  stopMoveTimer();
  stopCountdown();
  stopAnimationLoop();
  leaderboard.resetSubmission();
  state = GameState.prepareGame(state);
  previousSnake = cloneSnake(state.snake);
  runCountdown(3);
}

function togglePause() {
  if (state.status === "playing") {
    state = { ...state, status: "paused" };
    stopMoveTimer();
    stopAnimationLoop();
  } else if (state.status === "paused") {
    state = { ...state, status: "playing" };
    previousSnake = cloneSnake(state.snake);
    lastStepAt = performance.now();
    startAnimationLoop();
    scheduleNextMove();
  }

  render();
}

function resetGame() {
  stopMoveTimer();
  stopCountdown();
  stopAnimationLoop();
  leaderboard.resetSubmission();
  state = GameState.resetGame(state);
  previousSnake = cloneSnake(state.snake);
  countdownText = "";
  saveBestScore(state.bestScore);
  render();
}

function applyDirection(direction) {
  state = GameState.changeDirection(state, direction);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const direction = KEY_DIRECTIONS[event.code];

  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
});

canvas.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
});

canvas.addEventListener("touchend", (event) => {
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
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetGame);
directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
});

render();
leaderboard.load();
