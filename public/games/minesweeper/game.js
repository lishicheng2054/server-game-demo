const LONG_PRESS_MS = 520;
const STATUS_LABELS = {
  playing: "进行中",
  won: "胜利",
  lost: "失败",
};

const boardElement = document.getElementById("mine-board");
const flagsLeftText = document.getElementById("flags-left");
const revealedCountText = document.getElementById("revealed-count");
const statusText = document.getElementById("status");
const messageText = document.getElementById("message");
const resetButton = document.getElementById("reset");

let longPressTimerId = null;
let longPressTriggered = false;
let state = MinesweeperState.createInitialState();

function clearLongPressTimer() {
  if (longPressTimerId !== null) {
    window.clearTimeout(longPressTimerId);
    longPressTimerId = null;
  }
}

function getMessage() {
  if (state.status === "won") {
    return "所有安全格都翻开了，扫雷成功。";
  }

  if (state.status === "lost") {
    return "踩到雷了。重新布雷，再来一局。";
  }

  return "点击翻开格子，右键或长按可以插旗。";
}

function getCellText(cell) {
  if (cell.flagged && !cell.revealed) {
    return "旗";
  }

  if (!cell.revealed) {
    return "";
  }

  if (cell.mine) {
    return "雷";
  }

  return cell.neighborMines > 0 ? String(cell.neighborMines) : "";
}

function renderBoard() {
  boardElement.replaceChildren();

  state.cells.forEach((cell) => {
    const button = document.createElement("button");
    button.className = "mine-cell";
    button.type = "button";
    button.textContent = getCellText(cell);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `第 ${cell.id + 1} 格`);

    if (cell.revealed) {
      button.classList.add("is-revealed");
    }

    if (cell.flagged && !cell.revealed) {
      button.classList.add("is-flagged");
    }

    if (cell.mine && cell.revealed) {
      button.classList.add("is-mine");
    }

    if (cell.revealed && cell.neighborMines > 0 && !cell.mine) {
      button.dataset.count = String(cell.neighborMines);
    }

    button.addEventListener("click", () => {
      if (longPressTriggered) {
        longPressTriggered = false;
        return;
      }

      state = MinesweeperState.revealCell(state, cell.id);
      render();
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      state = MinesweeperState.toggleFlag(state, cell.id);
      render();
    });

    button.addEventListener("touchstart", () => {
      longPressTriggered = false;
      clearLongPressTimer();
      longPressTimerId = window.setTimeout(() => {
        longPressTriggered = true;
        state = MinesweeperState.toggleFlag(state, cell.id);
        render();
      }, LONG_PRESS_MS);
    });

    button.addEventListener("touchend", clearLongPressTimer);
    button.addEventListener("touchcancel", clearLongPressTimer);

    boardElement.appendChild(button);
  });
}

function render() {
  flagsLeftText.textContent = state.flagsLeft;
  revealedCountText.textContent = state.revealedSafeCells;
  statusText.textContent = STATUS_LABELS[state.status];
  messageText.textContent = getMessage();
  renderBoard();
}

resetButton.addEventListener("click", () => {
  clearLongPressTimer();
  state = MinesweeperState.resetGame(state);
  render();
});

render();
