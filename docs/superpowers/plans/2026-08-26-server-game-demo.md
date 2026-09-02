# Server Game Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static browser Snake game package and a beginner-friendly deployment guide for Ubuntu 22.04 plus Nginx.

**Architecture:** The deployable site lives in `public/` and is served by Nginx from `/var/www/game`. Snake movement, direction queues, countdown preparation, food, scoring, speed scaling, and collision rules are separated into `game-state.js` so they can be tested with Node, while `game.js` handles keyboard/touch input, mobile direction buttons, countdown timers, and smooth Canvas rendering.

**Tech Stack:** HTML, CSS, JavaScript, Node.js built-in `assert`, Ubuntu 22.04, Nginx.

---

### Task 1: Test Game State

**Files:**
- Create: `tests/game-state.test.js`
- Create: `public/game-state.js`

- [x] **Step 1: Write the failing test**

```javascript
const assert = require("assert");
const { createInitialState } = require("../public/games/snake/game-state");

const state = createInitialState();
assert.strictEqual(state.status, "idle");
assert.deepStrictEqual(state.snake[0], { x: 10, y: 10 });
```

- [x] **Step 2: Run test to verify it fails**

Run:

```bash
node tests/game-state.test.js
```

Expected: FAIL until Snake-specific exports such as `BOARD_SIZE`, `changeDirection`, and `advanceSnake` exist.

- [x] **Step 3: Implement game state functions**

Create immutable state functions for initial state, start, direction changes, snake movement, food placement, collision finishing, and reset.

- [x] **Step 4: Add speed scaling**

```javascript
assert.strictEqual(getTickMs(0), 150);
assert.strictEqual(getTickMs(20), 90);
assert.strictEqual(getTickMs(100), 70);
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
node tests/game-state.test.js
```

Expected: all tests print `PASS`.

### Task 2: Build Static Game UI

**Files:**
- Create: `public/index.html`
- Create: `public/style.css`
- Create: `public/game.js`

- [x] **Step 1: Create HTML entry**

`index.html` loads `style.css`, `game-state.js`, and `game.js`.

- [x] **Step 2: Create CSS**

`style.css` defines a responsive game panel, stable square Canvas board, buttons, and stats.

- [x] **Step 3: Create browser controller**

`game.js` wires keyboard/touch/mobile-button input to the tested game-state functions, draws the Canvas board, and persists the best score in `localStorage`.

- [x] **Step 4: Add v1.2 smoothness work**

Add `requestAnimationFrame` rendering between grid moves, a countdown before play starts, and an input queue so quick direction changes are consumed in order.

- [ ] **Step 4: Smoke-check required assets**

Run:

```bash
node tests/game-state.test.js
```

Expected: `game-state.js` loads correctly.

### Task 3: Write Learning Documentation

**Files:**
- Create: `README.md`
- Create: `docs/server-game-deploy-guide.md`

- [x] **Step 1: Explain local project structure**

Document which files are deployable and which files are for tests and learning.

- [x] **Step 2: Explain server setup**

Document public IP, private IP, domain, FinalShell login, ports, Nginx setup, and troubleshooting.

- [ ] **Step 3: Verify no placeholders remain**

Run:

```bash
rg "PLACEHOLD[E]R|[待]补" .
```

Expected: no unfinished placeholders.
