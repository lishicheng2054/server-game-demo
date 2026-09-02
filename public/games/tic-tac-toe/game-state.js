(function exposeTicTacToeState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.TicTacToeState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createTicTacToeStateApi() {
  const BOARD_CELLS = 9;
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function createInitialState(scores = { x: 0, o: 0, draws: 0 }) {
    return {
      status: "playing",
      board: Array(BOARD_CELLS).fill(null),
      currentPlayer: "X",
      winner: null,
      winLine: [],
      scores: { ...scores },
    };
  }

  function findWinLine(board) {
    return WIN_LINES.find((line) => {
      const [first, second, third] = line;
      return board[first] && board[first] === board[second] && board[first] === board[third];
    }) || [];
  }

  function getNextScores(scores, winner) {
    if (winner === "X") {
      return { ...scores, x: scores.x + 1 };
    }

    if (winner === "O") {
      return { ...scores, o: scores.o + 1 };
    }

    if (winner === "draw") {
      return { ...scores, draws: scores.draws + 1 };
    }

    return { ...scores };
  }

  function makeMove(state, cellIndex) {
    if (
      state.status !== "playing" ||
      cellIndex < 0 ||
      cellIndex >= BOARD_CELLS ||
      state.board[cellIndex]
    ) {
      return {
        ...state,
        board: [...state.board],
        winLine: [...state.winLine],
        scores: { ...state.scores },
      };
    }

    const board = [...state.board];
    board[cellIndex] = state.currentPlayer;
    const winLine = findWinLine(board);

    if (winLine.length > 0) {
      return {
        ...state,
        status: "finished",
        board,
        winner: state.currentPlayer,
        winLine,
        scores: getNextScores(state.scores, state.currentPlayer),
      };
    }

    if (board.every(Boolean)) {
      return {
        ...state,
        status: "finished",
        board,
        winner: "draw",
        winLine: [],
        scores: getNextScores(state.scores, "draw"),
      };
    }

    return {
      ...state,
      board,
      currentPlayer: state.currentPlayer === "X" ? "O" : "X",
      winLine: [],
      scores: { ...state.scores },
    };
  }

  function resetGame(state) {
    return createInitialState(state.scores);
  }

  return {
    BOARD_CELLS,
    WIN_LINES,
    createInitialState,
    makeMove,
    resetGame,
  };
});
