# Minesweeper And Lobby Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Minesweeper as the sixth playable game and improve the game lobby with lightweight category filtering and richer card metadata.

**Architecture:** Minesweeper follows the existing one-directory-per-game pattern with tested rules in `game-state.js` and browser behavior in `game.js`. The lobby remains static HTML with a tiny `lobby.js` filter script that only toggles card visibility.

**Tech Stack:** Static HTML, shared CSS, vanilla JavaScript, Node-based tests, Nginx deployment script.

---

### Task 1: Minesweeper Rules

**Files:**
- Create: `tests/minesweeper-state.test.js`
- Create: `public/games/minesweeper/game-state.js`
- Modify: `package.json`

- [ ] Write failing tests for board creation, neighbor counts, reveal behavior, flagging, mine loss, flood reveal, win state, and reset.
- [ ] Run `npm test` and confirm the missing module failure.
- [ ] Implement immutable Minesweeper helpers.
- [ ] Run `npm test` and confirm rules pass.

### Task 2: Minesweeper Page

**Files:**
- Create: `public/games/minesweeper/index.html`
- Create: `public/games/minesweeper/game.js`
- Modify: `public/styles/site.css`

- [ ] Add a Minesweeper page with stats, board, reset button, and back link.
- [ ] Support click to reveal, right-click to flag, and long-press to flag.
- [ ] Render mine, flag, numbers, win, and loss states.

### Task 3: Lobby Polish

**Files:**
- Modify: `public/index.html`
- Create: `public/lobby.js`
- Modify: `public/styles/site.css`
- Modify: `tests/site-structure.test.js`

- [ ] Add category filter buttons.
- [ ] Add metadata badges for difficulty and device support.
- [ ] Add the Minesweeper game card.
- [ ] Update site-structure tests for six games and the filter script.

### Task 4: Verification And Deployment

**Files:**
- Modify: `README.md`
- Modify: `docs/server-game-deploy-guide.md`
- Modify: `docs/finalshell-upload-steps.md`

- [ ] Update docs for Minesweeper and lobby filtering.
- [ ] Run `npm test`.
- [ ] Run `node --check` for all game scripts and `public/lobby.js`.
- [ ] Run the secret scan over deployable files.
- [ ] Upload to the server and run `deploy-to-server.sh`.
- [ ] Verify homepage and six game pages from the public IP.
