const boardElement = document.getElementById("tic-board");
const currentPlayerText = document.getElementById("current-player");
const xScoreText = document.getElementById("x-score");
const oScoreText = document.getElementById("o-score");
const drawScoreText = document.getElementById("draw-score");
const messageText = document.getElementById("message");
const resetButton = document.getElementById("reset");

let state = TicTacToeState.createInitialState();

function getMessage() {
  if (state.winner === "draw") {
    return "棋盘下满了，这局平局。";
  }

  if (state.winner) {
    return `${state.winner} 连成一线，赢下这一局。`;
  }

  return `轮到 ${state.currentPlayer} 落子。`;
}

function renderBoard() {
  boardElement.replaceChildren();

  state.board.forEach((mark, index) => {
    const cell = document.createElement("button");
    cell.className = "tic-cell";
    cell.type = "button";
    cell.textContent = mark || "";
    cell.disabled = state.status !== "playing" || Boolean(mark);
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", mark ? `${mark} 已落子` : `第 ${index + 1} 格`);

    if (state.winLine.includes(index)) {
      cell.classList.add("is-winning");
    }

    cell.addEventListener("click", () => {
      state = TicTacToeState.makeMove(state, index);
      render();
    });

    boardElement.appendChild(cell);
  });
}

function render() {
  currentPlayerText.textContent = state.status === "playing" ? state.currentPlayer : "-";
  xScoreText.textContent = state.scores.x;
  oScoreText.textContent = state.scores.o;
  drawScoreText.textContent = state.scores.draws;
  messageText.textContent = getMessage();
  renderBoard();
}

resetButton.addEventListener("click", () => {
  state = TicTacToeState.resetGame(state);
  render();
});

render();
