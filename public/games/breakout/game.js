const BEST_SCORE_KEY = "server-game-demo-breakout-best-score";
const FRAME_MS = 1000 / 60;
const KEY_MOVES = {
  ArrowLeft: -28,
  KeyA: -28,
  ArrowRight: 28,
  KeyD: 28,
};

const canvas = document.getElementById("breakout-canvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best-score");
const livesText = document.getElementById("lives");
const bricksLeftText = document.getElementById("bricks-left");
const messageText = document.getElementById("message");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");

let animationFrameId = null;
let lastFrameAt = 0;
let state = BreakoutState.createInitialState(loadBestScore());
const leaderboard = LeaderboardWidget.create({
  game: "breakout",
  getScore: () => state.score,
  canSubmit: () => (state.status === "won" || state.status === "finished") && state.score > 0,
});

canvas.width = BreakoutState.BOARD_WIDTH;
canvas.height = BreakoutState.BOARD_HEIGHT;

function loadBestScore() {
  const storedBestScore = Number(window.localStorage.getItem(BEST_SCORE_KEY));
  return Number.isFinite(storedBestScore) ? storedBestScore : 0;
}

function saveBestScore(bestScore) {
  window.localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

function getAliveBricks() {
  return state.bricks.filter((brick) => brick.alive);
}

function drawRoundedRect(x, y, width, height, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.fill();
}

function drawBoard() {
  context.fillStyle = "#101217";
  context.fillRect(0, 0, canvas.width, canvas.height);

  state.bricks.forEach((brick, index) => {
    if (!brick.alive) {
      return;
    }

    const colors = ["#2fd07d", "#f9d65c", "#3d7cf5", "#f06449"];
    drawRoundedRect(brick.x, brick.y, brick.width, brick.height, 4, colors[index % colors.length]);
  });

  drawRoundedRect(
    state.paddle.x,
    state.paddle.y,
    state.paddle.width,
    state.paddle.height,
    6,
    "#f5f7fb"
  );

  context.fillStyle = "#f9d65c";
  context.beginPath();
  context.arc(state.ball.x, state.ball.y, BreakoutState.BALL_RADIUS, 0, Math.PI * 2);
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

function render() {
  scoreText.textContent = state.score;
  bestScoreText.textContent = state.bestScore;
  livesText.textContent = state.lives;
  bricksLeftText.textContent = getAliveBricks().length;
  pauseButton.textContent = state.status === "paused" ? "继续" : "暂停";
  pauseButton.disabled = state.status !== "playing" && state.status !== "paused";
  startButton.disabled = state.status === "playing";

  drawBoard();

  if (state.status === "idle") {
    messageText.textContent = "方向键或 A/D 控制挡板，也可以用鼠标或手指拖动。";
    drawOverlay("点击开始游戏");
  } else if (state.status === "paused") {
    messageText.textContent = "游戏已暂停。";
    drawOverlay("已暂停");
  } else if (state.status === "won") {
    messageText.textContent = `全部清空，本局 ${state.score} 分。`;
    drawOverlay("胜利");
  } else if (state.status === "finished") {
    messageText.textContent = `游戏结束，本局 ${state.score} 分。`;
    drawOverlay("游戏结束");
  } else {
    messageText.textContent = "反弹小球击碎砖块，别让小球落到底部。";
  }

  leaderboard.refreshDisplay();
}

function stopLoop() {
  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function tick(now) {
  if (now - lastFrameAt >= FRAME_MS) {
    state = BreakoutState.advanceGame(state);
    lastFrameAt = now;

    if (state.status === "won" || state.status === "finished") {
      saveBestScore(state.bestScore);
      stopLoop();
      render();
      return;
    }
  }

  render();
  animationFrameId = window.requestAnimationFrame(tick);
}

function startLoop() {
  stopLoop();
  lastFrameAt = performance.now();
  animationFrameId = window.requestAnimationFrame(tick);
}

function startRound() {
  leaderboard.resetSubmission();
  state = BreakoutState.startGame(state);
  saveBestScore(state.bestScore);
  render();
  startLoop();
}

function togglePause() {
  if (state.status === "playing") {
    state = { ...state, status: "paused" };
    stopLoop();
  } else if (state.status === "paused") {
    state = { ...state, status: "playing" };
    startLoop();
  }

  render();
}

function resetGame() {
  stopLoop();
  leaderboard.resetSubmission();
  state = BreakoutState.resetGame(state);
  saveBestScore(state.bestScore);
  render();
}

function movePaddleToClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const scale = BreakoutState.BOARD_WIDTH / rect.width;
  const canvasX = (clientX - rect.left) * scale;
  state = BreakoutState.movePaddle(state, canvasX - state.paddle.width / 2);
  render();
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
    return;
  }

  const move = KEY_MOVES[event.code];

  if (!move) {
    return;
  }

  event.preventDefault();
  state = BreakoutState.movePaddle(state, state.paddle.x + move);
  render();
});

canvas.addEventListener("mousemove", (event) => {
  movePaddleToClientX(event.clientX);
});

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  movePaddleToClientX(event.changedTouches[0].clientX);
});

startButton.addEventListener("click", startRound);
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetGame);

render();
leaderboard.load();
