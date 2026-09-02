# Game Lobby Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the homepage into a game lobby and add tic-tac-toe plus memory match as playable static games.

**Architecture:** Keep the existing static-site pattern: one directory per game, with `game-state.js` for pure tested rules and `game.js` for browser rendering/input. The homepage remains static HTML using shared CSS.

**Tech Stack:** Static HTML, shared CSS, vanilla JavaScript, Node-based tests, Nginx deployment script.

---

### Task 1: Tic-Tac-Toe

**Files:**
- Create: `tests/tic-tac-toe-state.test.js`
- Create: `public/games/tic-tac-toe/game-state.js`
- Create: `public/games/tic-tac-toe/index.html`
- Create: `public/games/tic-tac-toe/game.js`
- Modify: `package.json`

- [ ] Write failing tests for initial state, legal moves, turn switching, occupied-cell rejection, X win, O win, draw, and reset.
- [ ] Run `node tests/tic-tac-toe-state.test.js` and confirm the missing module failure.
- [ ] Implement immutable tic-tac-toe rule helpers.
- [ ] Build the browser page with a 3x3 button grid, status text, score counters, and reset.

### Task 2: Memory Match

**Files:**
- Create: `tests/memory-state.test.js`
- Create: `public/games/memory/game-state.js`
- Create: `public/games/memory/index.html`
- Create: `public/games/memory/game.js`
- Modify: `package.json`

- [ ] Write failing tests for deck creation, first/second selections, matched pair, mismatch lock, resolving mismatch, win, and reset.
- [ ] Run `node tests/memory-state.test.js` and confirm the missing module failure.
- [ ] Implement immutable memory-match rule helpers.
- [ ] Build the browser page with a 4x4 card grid, moves, matched pairs, best moves, and reset.

### Task 3: Game Lobby

**Files:**
- Modify: `public/index.html`
- Modify: `public/styles/site.css`
- Modify: `tests/site-structure.test.js`

- [ ] Upgrade the homepage with stats, recommended game, five playable cards, and an upcoming-game section.
- [ ] Extend site-structure tests for tic-tac-toe and memory.
- [ ] Keep mobile layout single-column and ensure card text fits.

### Task 4: Verification And Deployment

**Files:**
- Modify: `README.md`
- Modify: `docs/server-game-deploy-guide.md`
- Modify: `docs/finalshell-upload-steps.md`

- [ ] Update docs so the file map and gameplay notes include all five games.
- [ ] Run `npm test`.
- [ ] Run `node --check` for all game-state and browser scripts.
- [ ] Run the existing secret scan over deployable files.
- [ ] Upload to `ubuntu@81.71.69.124:~/server-game-demo/`.
- [ ] Run `./deploy-to-server.sh` on the server.
- [ ] Verify homepage and all five game pages from the public IP.
