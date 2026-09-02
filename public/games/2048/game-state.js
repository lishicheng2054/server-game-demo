(function exposeGame2048State(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.Game2048State = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createGame2048StateApi() {
  const GRID_SIZE = 4;
  const WIN_TILE = 2048;
  const DIRECTIONS = ["up", "down", "left", "right"];

  function createEmptyBoard() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  }

  function cloneBoard(board) {
    return board.map((row) => [...row]);
  }

  function createEmptyState(bestScore = 0) {
    return {
      status: "idle",
      board: createEmptyBoard(),
      score: 0,
      bestScore,
      won: false,
    };
  }

  function getOpenCells(board) {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (board[y][x] === 0) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  }

  function createRandomTile(board) {
    const openCells = getOpenCells(board);

    if (openCells.length === 0) {
      return null;
    }

    const cell = openCells[Math.floor(Math.random() * openCells.length)];

    return {
      ...cell,
      value: Math.random() < 0.9 ? 2 : 4,
    };
  }

  function addTile(board, createTile = createRandomTile) {
    const nextBoard = cloneBoard(board);
    const tile = createTile(nextBoard);

    if (!tile || nextBoard[tile.y][tile.x] !== 0) {
      return nextBoard;
    }

    nextBoard[tile.y][tile.x] = tile.value;

    return nextBoard;
  }

  function startGame(state, createTile = createRandomTile) {
    const boardWithFirstTile = addTile(createEmptyBoard(), createTile);

    return {
      ...createEmptyState(state.bestScore),
      status: "playing",
      board: addTile(boardWithFirstTile, createTile),
    };
  }

  function resetGame(state) {
    return createEmptyState(state.bestScore);
  }

  function compressLine(line) {
    const values = line.filter((value) => value !== 0);
    const merged = [];
    let scoreDelta = 0;

    for (let index = 0; index < values.length; index += 1) {
      if (values[index] === values[index + 1]) {
        const mergedValue = values[index] * 2;
        merged.push(mergedValue);
        scoreDelta += mergedValue;
        index += 1;
      } else {
        merged.push(values[index]);
      }
    }

    while (merged.length < GRID_SIZE) {
      merged.push(0);
    }

    return { line: merged, scoreDelta };
  }

  function getLine(board, direction, index) {
    if (direction === "left") {
      return [...board[index]];
    }

    if (direction === "right") {
      return [...board[index]].reverse();
    }

    const column = board.map((row) => row[index]);

    return direction === "up" ? column : column.reverse();
  }

  function setLine(board, direction, index, line) {
    const nextLine = direction === "right" || direction === "down" ? [...line].reverse() : line;

    if (direction === "left" || direction === "right") {
      nextLine.forEach((value, x) => {
        board[index][x] = value;
      });
      return;
    }

    nextLine.forEach((value, y) => {
      board[y][index] = value;
    });
  }

  function boardsAreEqual(first, second) {
    return first.every((row, y) => row.every((value, x) => value === second[y][x]));
  }

  function moveBoard(board, direction) {
    if (!DIRECTIONS.includes(direction)) {
      return {
        board: cloneBoard(board),
        scoreDelta: 0,
        moved: false,
      };
    }

    const nextBoard = createEmptyBoard();
    let scoreDelta = 0;

    for (let index = 0; index < GRID_SIZE; index += 1) {
      const result = compressLine(getLine(board, direction, index));
      scoreDelta += result.scoreDelta;
      setLine(nextBoard, direction, index, result.line);
    }

    return {
      board: nextBoard,
      scoreDelta,
      moved: !boardsAreEqual(board, nextBoard),
    };
  }

  function boardHasTile(board, tileValue) {
    return board.some((row) => row.some((value) => value === tileValue));
  }

  function canMove(board) {
    if (getOpenCells(board).length > 0) {
      return true;
    }

    return DIRECTIONS.some((direction) => moveBoard(board, direction).moved);
  }

  function moveGame(state, direction, createTile = createRandomTile) {
    if (state.status !== "playing") {
      return {
        ...state,
        board: cloneBoard(state.board),
      };
    }

    const result = moveBoard(state.board, direction);

    if (!result.moved) {
      return {
        ...state,
        status: canMove(state.board) ? state.status : "finished",
        board: cloneBoard(state.board),
      };
    }

    const score = state.score + result.scoreDelta;
    const boardWithTile = addTile(result.board, createTile);
    const won = state.won || boardHasTile(result.board, WIN_TILE);
    const hasMoves = canMove(boardWithTile);
    const status = won ? "won" : hasMoves ? "playing" : "finished";

    return {
      ...state,
      status,
      board: boardWithTile,
      score,
      bestScore: Math.max(state.bestScore, score),
      won,
    };
  }

  return {
    GRID_SIZE,
    WIN_TILE,
    createEmptyBoard,
    createEmptyState,
    startGame,
    resetGame,
    moveBoard,
    moveGame,
    canMove,
  };
});
