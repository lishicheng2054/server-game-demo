const BEST_MOVES_KEY = "server-game-demo-memory-best-moves";
const FLIP_BACK_DELAY_MS = 650;
const CARD_LABELS = {
  A: "云",
  B: "码",
  C: "游",
  D: "戏",
  E: "服",
  F: "器",
  G: "网",
  H: "页",
};

const boardElement = document.getElementById("memory-board");
const bestMovesText = document.getElementById("best-moves");
const movesText = document.getElementById("moves");
const pairsText = document.getElementById("pairs");
const statusText = document.getElementById("status");
const messageText = document.getElementById("message");
const resetButton = document.getElementById("reset");

let mismatchTimerId = null;
let state = MemoryState.createInitialState(undefined, loadBestMoves());

function loadBestMoves() {
  const storedBestMoves = Number(window.localStorage.getItem(BEST_MOVES_KEY));
  return Number.isFinite(storedBestMoves) ? storedBestMoves : 0;
}

function saveBestMoves(bestMoves) {
  if (bestMoves > 0) {
    window.localStorage.setItem(BEST_MOVES_KEY, String(bestMoves));
  }
}

function clearMismatchTimer() {
  if (mismatchTimerId !== null) {
    window.clearTimeout(mismatchTimerId);
    mismatchTimerId = null;
  }
}

function scheduleMismatchResolve() {
  clearMismatchTimer();
  mismatchTimerId = window.setTimeout(() => {
    state = MemoryState.resolveMismatch(state);
    render();
  }, FLIP_BACK_DELAY_MS);
}

function getMessage() {
  if (state.status === "won") {
    return `全部配对完成，用了 ${state.moves} 步。`;
  }

  if (state.locked) {
    return "这两张不同，稍等一下会翻回去。";
  }

  return "每次翻两张，找到相同的字就能配对。";
}

function renderBoard() {
  boardElement.replaceChildren();

  state.cards.forEach((card) => {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.textContent = card.faceUp || card.matched ? CARD_LABELS[card.value] : "?";
    button.disabled = state.status !== "playing" || state.locked || card.faceUp || card.matched;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", card.faceUp || card.matched ? `牌面 ${CARD_LABELS[card.value]}` : "未翻开的牌");

    if (card.faceUp || card.matched) {
      button.classList.add("is-open");
    }

    if (card.matched) {
      button.classList.add("is-matched");
    }

    button.addEventListener("click", () => {
      state = MemoryState.selectCard(state, card.id);
      saveBestMoves(state.bestMoves);

      if (state.locked) {
        scheduleMismatchResolve();
      }

      render();
    });

    boardElement.appendChild(button);
  });
}

function render() {
  bestMovesText.textContent = state.bestMoves > 0 ? state.bestMoves : "-";
  movesText.textContent = state.moves;
  pairsText.textContent = `${state.matchedPairs}/${MemoryState.PAIR_COUNT}`;
  statusText.textContent = state.status === "won" ? "胜利" : "进行中";
  messageText.textContent = getMessage();
  renderBoard();
}

resetButton.addEventListener("click", () => {
  clearMismatchTimer();
  state = MemoryState.resetGame(state);
  render();
});

render();
