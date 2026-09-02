(function exposeTetrisState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.TetrisState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createTetrisStateApi() {
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];
  const SHAPES = {
    I: [
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
    ],
    O: [
      [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
    ],
    T: [
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    ],
    S: [
      [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
    ],
    Z: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [2, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
    ],
    J: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [0, 2],
        [1, 2],
      ],
    ],
    L: [
      [
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    ],
  };

  function createEmptyBoard() {
    return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(""));
  }

  function cloneBoard(board) {
    return board.map((row) => [...row]);
  }

  function createInitialState(bestScore = 0) {
    return {
      status: "idle",
      board: createEmptyBoard(),
      activePiece: null,
      score: 0,
      lines: 0,
      bestScore,
    };
  }

  function createRandomPieceType() {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  function createPiece(type = createRandomPieceType()) {
    return {
      type,
      x: type === "I" ? 3 : 4,
      y: 0,
      rotation: 0,
    };
  }

  function getPieceCells(piece) {
    const rotations = SHAPES[piece.type];
    const shape = rotations[piece.rotation % rotations.length];

    return shape.map(([x, y]) => ({
      x: piece.x + x,
      y: piece.y + y,
    }));
  }

  function collides(board, piece) {
    return getPieceCells(piece).some((cell) => {
      if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) {
        return true;
      }

      return cell.y >= 0 && Boolean(board[cell.y][cell.x]);
    });
  }

  function spawnPiece(state, createPieceType = createRandomPieceType) {
    const activePiece = createPiece(createPieceType());
    const status = collides(state.board, activePiece) ? "finished" : "playing";

    return {
      ...state,
      status,
      activePiece,
      bestScore: Math.max(state.bestScore, state.score),
    };
  }

  function startGame(state, createPieceType = createRandomPieceType) {
    return spawnPiece(
      {
        ...createInitialState(state.bestScore),
        board: cloneBoard(state.board || createEmptyBoard()),
        score: 0,
        lines: 0,
      },
      createPieceType
    );
  }

  function resetGame(state) {
    return createInitialState(state.bestScore);
  }

  function movePiece(state, dx, dy) {
    if (state.status !== "playing" || !state.activePiece) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    const activePiece = {
      ...state.activePiece,
      x: state.activePiece.x + dx,
      y: state.activePiece.y + dy,
    };

    if (collides(state.board, activePiece)) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    return {
      ...state,
      board: cloneBoard(state.board),
      activePiece,
    };
  }

  function rotatePiece(state) {
    if (state.status !== "playing" || !state.activePiece) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    const rotations = SHAPES[state.activePiece.type];
    const activePiece = {
      ...state.activePiece,
      rotation: (state.activePiece.rotation + 1) % rotations.length,
    };

    if (collides(state.board, activePiece)) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    return {
      ...state,
      board: cloneBoard(state.board),
      activePiece,
    };
  }

  function clearLines(board) {
    const openRows = board.filter((row) => row.some((cell) => !cell));
    const clearedLines = BOARD_HEIGHT - openRows.length;
    const nextBoard = [
      ...Array.from({ length: clearedLines }, () => Array(BOARD_WIDTH).fill("")),
      ...openRows,
    ];

    return {
      board: nextBoard,
      clearedLines,
    };
  }

  function lockPiece(state, createPieceType = createRandomPieceType) {
    const board = cloneBoard(state.board);

    getPieceCells(state.activePiece).forEach((cell) => {
      if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
        board[cell.y][cell.x] = state.activePiece.type;
      }
    });

    const cleared = clearLines(board);
    const score = state.score + cleared.clearedLines * 100;
    const lines = state.lines + cleared.clearedLines;

    return spawnPiece(
      {
        ...state,
        board: cleared.board,
        score,
        lines,
        bestScore: Math.max(state.bestScore, score),
      },
      createPieceType
    );
  }

  function tick(state, createPieceType = createRandomPieceType) {
    if (state.status !== "playing" || !state.activePiece) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    const moved = movePiece(state, 0, 1);

    if (moved.activePiece && moved.activePiece.y !== state.activePiece.y) {
      return moved;
    }

    return lockPiece(state, createPieceType);
  }

  function hardDrop(state, createPieceType = createRandomPieceType) {
    if (state.status !== "playing" || !state.activePiece) {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    let nextState = state;

    while (true) {
      const moved = movePiece(nextState, 0, 1);

      if (moved.activePiece.y === nextState.activePiece.y) {
        return lockPiece(nextState, createPieceType);
      }

      nextState = moved;
    }
  }

  return {
    BOARD_WIDTH,
    BOARD_HEIGHT,
    PIECE_TYPES,
    createInitialState,
    startGame,
    resetGame,
    movePiece,
    rotatePiece,
    tick,
    hardDrop,
    getPieceCells,
  };
});
