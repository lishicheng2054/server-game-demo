# Game Lobby Expansion Design

## Goal

Upgrade the static mini-games site from three game cards into a small game lobby, and add two new playable game types: tic-tac-toe and memory match.

## Scope

This iteration keeps the project static and server-friendly. There is no backend, database, login, analytics, or third-party dependency. Each new game follows the existing folder pattern:

```text
public/games/<game>/index.html
public/games/<game>/game-state.js
public/games/<game>/game.js
```

## Lobby Design

The homepage becomes a game lobby with a compact hero, site stats, a highlighted recommendation panel, a playable game grid, and a small upcoming-game section. The goal is to make the project feel like a real collection while staying easy to understand for server deployment learning.

## New Games

Tic-tac-toe teaches turn-based grid logic: board state, legal moves, current player, win lines, draw detection, and reset.

Memory match teaches shuffled cards and matching state: deck creation, selecting cards, matched pairs, move count, lock state, win detection, and reset.

## Testing

Rules are tested in Node before browser pages are added. Site-structure tests verify that the homepage links to each game and every game directory contains the expected HTML and scripts.

## Deployment

The existing deployment script remains unchanged. It already copies `public/.` and fixes Nginx-readable file permissions after upload.
