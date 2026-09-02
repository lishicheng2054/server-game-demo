# Breakout Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Breakout as the third playable game in the static mini-games collection.

**Architecture:** Follow the existing game directory pattern. Breakout rules and physics live in `public/games/breakout/game-state.js` for Node tests; `public/games/breakout/game.js` handles canvas rendering, animation, keyboard input, mouse/touch paddle movement, and local best score.

**Tech Stack:** Static HTML, shared CSS, vanilla JavaScript, Canvas, Node-based tests, Nginx deployment script.

---

### Task 1: Breakout Rules

**Files:**
- Create: `public/games/breakout/game-state.js`
- Create: `tests/breakout-state.test.js`
- Modify: `package.json`

- [ ] Write failing tests for initial state, paddle movement, wall bounce, paddle bounce, brick collision, life loss, final game over, and win state.
- [ ] Run `node tests/breakout-state.test.js` and confirm it fails because the module does not exist.
- [ ] Implement immutable game-state helpers and physics transitions.
- [ ] Run `node tests/breakout-state.test.js` and confirm the rules pass.

### Task 2: Breakout Page

**Files:**
- Create: `public/games/breakout/index.html`
- Create: `public/games/breakout/game.js`
- Modify: `public/index.html`
- Modify: `public/styles/site.css`
- Modify: `tests/site-structure.test.js`

- [ ] Add a Breakout page with score, best score, lives, canvas, start/pause/reset buttons, and back link.
- [ ] Add keyboard controls, mouse movement, touch movement, and animation loop.
- [ ] Update homepage card from "coming soon" to "start game".
- [ ] Extend site-structure tests for the new route and scripts.

### Task 3: Verification And Deployment

**Files:**
- Modify: `README.md`
- Modify: `docs/server-game-deploy-guide.md`
- Modify: `docs/finalshell-upload-steps.md`

- [ ] Update docs so the file map and gameplay notes include Breakout.
- [ ] Run `npm test`.
- [ ] Run `node --check` for all game-state and browser scripts.
- [ ] Run the existing secret scan over deployable files.
- [ ] Upload the project to `ubuntu@81.71.69.124:~/server-game-demo/`.
- [ ] Run `./deploy-to-server.sh` on the server.
- [ ] Verify `http://81.71.69.124`, `/games/snake/`, `/games/2048/`, and `/games/breakout/`.
