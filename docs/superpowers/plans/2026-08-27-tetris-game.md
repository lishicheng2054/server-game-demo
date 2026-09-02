# Tetris Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tetris as the seventh playable static game in the game lobby.

**Architecture:** Follow the existing pattern: `game-state.js` contains pure tested board/piece rules, while `game.js` handles DOM rendering, keyboard/mobile controls, timing, and local best score.

**Tech Stack:** Static HTML, shared CSS, vanilla JavaScript, Node-based tests, Nginx deployment script.

---

### Task 1: Tetris Rules

**Files:**
- Create: `tests/tetris-state.test.js`
- Create: `public/games/tetris/game-state.js`
- Modify: `package.json`

- [ ] Test initial board, game start, movement, rotation, ticking, hard drop, line clearing, and game over.
- [ ] Implement immutable Tetris state helpers.

### Task 2: Tetris Page

**Files:**
- Create: `public/games/tetris/index.html`
- Create: `public/games/tetris/game.js`
- Modify: `public/styles/site.css`

- [ ] Add stats, board, controls, and mobile buttons.
- [ ] Support arrows/WASD, up/W rotate, down/S soft drop, space hard drop, and pause.

### Task 3: Lobby And Docs

**Files:**
- Modify: `public/index.html`
- Modify: `tests/site-structure.test.js`
- Modify: `README.md`
- Modify: `docs/server-game-deploy-guide.md`
- Modify: `docs/finalshell-upload-steps.md`

- [ ] Add Tetris card and update counts.
- [ ] Add docs and deployment file map entries.
- [ ] Verify and deploy.
