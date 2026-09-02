(function exposeMemoryState(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.MemoryState = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function createMemoryStateApi() {
  const PAIR_COUNT = 8;
  const VALUES = ["A", "B", "C", "D", "E", "F", "G", "H"];

  function defaultShuffle(cards) {
    const nextCards = [...cards];

    for (let index = nextCards.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [nextCards[index], nextCards[swapIndex]] = [nextCards[swapIndex], nextCards[index]];
    }

    return nextCards;
  }

  function createDeck(shuffle = defaultShuffle) {
    const cards = VALUES.flatMap((value) => [
      { value },
      { value },
    ]).map((card, id) => ({
      id,
      value: card.value,
      faceUp: false,
      matched: false,
    }));

    return shuffle(cards).map((card, id) => ({
      ...card,
      id,
    }));
  }

  function cloneCards(cards) {
    return cards.map((card) => ({ ...card }));
  }

  function createInitialState(shuffle = defaultShuffle, bestMoves = 0) {
    return {
      status: "playing",
      cards: createDeck(shuffle),
      selectedIds: [],
      moves: 0,
      matchedPairs: 0,
      bestMoves,
      locked: false,
    };
  }

  function updateBestMoves(bestMoves, moves) {
    if (bestMoves === 0) {
      return moves;
    }

    return Math.min(bestMoves, moves);
  }

  function selectCard(state, cardId) {
    if (state.status !== "playing" || state.locked || state.selectedIds.length >= 2) {
      return {
        ...state,
        cards: cloneCards(state.cards),
        selectedIds: [...state.selectedIds],
      };
    }

    const card = state.cards[cardId];

    if (!card || card.faceUp || card.matched) {
      return {
        ...state,
        cards: cloneCards(state.cards),
        selectedIds: [...state.selectedIds],
      };
    }

    const cards = state.cards.map((item) =>
      item.id === cardId ? { ...item, faceUp: true } : { ...item }
    );
    const selectedIds = [...state.selectedIds, cardId];

    if (selectedIds.length === 1) {
      return {
        ...state,
        cards,
        selectedIds,
      };
    }

    const [firstId, secondId] = selectedIds;
    const firstCard = cards[firstId];
    const secondCard = cards[secondId];
    const moves = state.moves + 1;

    if (firstCard.value !== secondCard.value) {
      return {
        ...state,
        cards,
        selectedIds,
        moves,
        locked: true,
      };
    }

    const matchedCards = cards.map((item) =>
      item.id === firstId || item.id === secondId ? { ...item, matched: true } : item
    );
    const matchedPairs = state.matchedPairs + 1;
    const won = matchedPairs === PAIR_COUNT;

    return {
      ...state,
      status: won ? "won" : "playing",
      cards: matchedCards,
      selectedIds: [],
      moves,
      matchedPairs,
      bestMoves: won ? updateBestMoves(state.bestMoves, moves) : state.bestMoves,
    };
  }

  function resolveMismatch(state) {
    if (!state.locked) {
      return {
        ...state,
        cards: cloneCards(state.cards),
        selectedIds: [...state.selectedIds],
      };
    }

    const selected = new Set(state.selectedIds);

    return {
      ...state,
      cards: state.cards.map((card) =>
        selected.has(card.id) && !card.matched ? { ...card, faceUp: false } : { ...card }
      ),
      selectedIds: [],
      locked: false,
    };
  }

  function resetGame(state, shuffle = defaultShuffle) {
    return createInitialState(shuffle, state.bestMoves);
  }

  return {
    PAIR_COUNT,
    VALUES,
    createInitialState,
    selectCard,
    resolveMismatch,
    resetGame,
  };
});
