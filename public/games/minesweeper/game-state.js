(function exposeMinesweeperState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.MinesweeperState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createMinesweeperStateApi() {
  const BOARD_SIZE = 9;
  const MINE_COUNT = 10;
  const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

  function createRandomMineIds() {
    const ids = Array.from({ length: CELL_COUNT }, (_, id) => id);
    const mines = [];

    while (mines.length < MINE_COUNT && ids.length > 0) {
      const index = Math.floor(Math.random() * ids.length);
      mines.push(ids.splice(index, 1)[0]);
    }

    return mines;
  }

  function getCoordinates(id) {
    return {
      x: id % BOARD_SIZE,
      y: Math.floor(id / BOARD_SIZE),
    };
  }

  function getId(x, y) {
    return y * BOARD_SIZE + x;
  }

  function getNeighborIds(id) {
    const { x, y } = getCoordinates(id);
    const neighbors = [];

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const nextX = x + dx;
        const nextY = y + dy;

        if (nextX >= 0 && nextX < BOARD_SIZE && nextY >= 0 && nextY < BOARD_SIZE) {
          neighbors.push(getId(nextX, nextY));
        }
      }
    }

    return neighbors;
  }

  function createCells(mineIds) {
    const mines = new Set(mineIds);

    return Array.from({ length: CELL_COUNT }, (_, id) => {
      const mine = mines.has(id);
      const neighborMines = getNeighborIds(id).filter((neighborId) => mines.has(neighborId)).length;

      return {
        id,
        mine,
        neighborMines,
        revealed: false,
        flagged: false,
      };
    });
  }

  function normalizeMineIds(createMineIds) {
    const ids = createMineIds();
    const uniqueIds = [...new Set(ids)].filter((id) => id >= 0 && id < CELL_COUNT);

    if (uniqueIds.length >= MINE_COUNT) {
      return uniqueIds.slice(0, MINE_COUNT);
    }

    return uniqueIds;
  }

  function createInitialState(createMineIds = createRandomMineIds) {
    const mineIds = normalizeMineIds(createMineIds);

    return {
      status: "playing",
      cells: createCells(mineIds),
      flagsLeft: MINE_COUNT,
      revealedSafeCells: 0,
    };
  }

  function cloneCells(cells) {
    return cells.map((cell) => ({ ...cell }));
  }

  function countRevealedSafeCells(cells) {
    return cells.filter((cell) => !cell.mine && cell.revealed).length;
  }

  function withWinStatus(state, cells) {
    const revealedSafeCells = countRevealedSafeCells(cells);
    const totalSafeCells = CELL_COUNT - state.cells.filter((cell) => cell.mine).length;

    return {
      ...state,
      status: revealedSafeCells === totalSafeCells ? "won" : state.status,
      cells,
      revealedSafeCells,
    };
  }

  function revealFlood(cells, startId) {
    const nextCells = cloneCells(cells);
    const queue = [startId];
    const visited = new Set();

    while (queue.length > 0) {
      const id = queue.shift();

      if (visited.has(id)) {
        continue;
      }

      visited.add(id);
      const cell = nextCells[id];

      if (!cell || cell.mine || cell.flagged) {
        continue;
      }

      cell.revealed = true;

      if (cell.neighborMines === 0) {
        getNeighborIds(id).forEach((neighborId) => {
          const neighbor = nextCells[neighborId];

          if (neighbor && !neighbor.revealed && !neighbor.mine && !neighbor.flagged) {
            queue.push(neighborId);
          }
        });
      }
    }

    return nextCells;
  }

  function revealCell(state, cellId) {
    if (state.status !== "playing") {
      return {
        ...state,
        cells: cloneCells(state.cells),
      };
    }

    const cell = state.cells[cellId];

    if (!cell || cell.revealed || cell.flagged) {
      return {
        ...state,
        cells: cloneCells(state.cells),
      };
    }

    if (cell.mine) {
      const cells = state.cells.map((item) =>
        item.mine || item.id === cellId ? { ...item, revealed: true } : { ...item }
      );

      return {
        ...state,
        status: "lost",
        cells,
      };
    }

    const cells = cell.neighborMines === 0
      ? revealFlood(state.cells, cellId)
      : state.cells.map((item) => (item.id === cellId ? { ...item, revealed: true } : { ...item }));

    return withWinStatus(state, cells);
  }

  function toggleFlag(state, cellId) {
    if (state.status !== "playing") {
      return {
        ...state,
        cells: cloneCells(state.cells),
      };
    }

    const cell = state.cells[cellId];

    if (!cell || cell.revealed) {
      return {
        ...state,
        cells: cloneCells(state.cells),
      };
    }

    if (!cell.flagged && state.flagsLeft <= 0) {
      return {
        ...state,
        cells: cloneCells(state.cells),
      };
    }

    const cells = state.cells.map((item) =>
      item.id === cellId ? { ...item, flagged: !item.flagged } : { ...item }
    );

    return {
      ...state,
      cells,
      flagsLeft: state.flagsLeft + (cell.flagged ? 1 : -1),
    };
  }

  function resetGame(state, createMineIds = createRandomMineIds) {
    return createInitialState(createMineIds);
  }

  return {
    BOARD_SIZE,
    MINE_COUNT,
    createInitialState,
    revealCell,
    toggleFlag,
    resetGame,
    getNeighborIds,
  };
});
