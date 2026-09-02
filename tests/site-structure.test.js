const assert = require("assert");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function test(name, run) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

test("home page lists the game collection", () => {
  const html = readProjectFile("public/index.html");

  assert.match(html, /小游戏集合/);
  assert.match(html, /games\/snake\//);
  assert.match(html, /games\/2048\//);
  assert.match(html, /games\/breakout\//);
  assert.match(html, /games\/tic-tac-toe\//);
  assert.match(html, /games\/memory\//);
  assert.match(html, /games\/minesweeper\//);
  assert.match(html, /games\/tetris\//);
  assert.match(html, /lobby\.js/);
  assert.match(html, /data-filter="puzzle"/);
  assert.match(html, /游戏大厅/);
  assert.match(html, /class="lobby-showcase"/);
  assert.match(html, /class="game-spotlight"/);
  assert.match(html, /class="platform-notes"/);
  assert.match(html, /leaderboard\//);
  assert.match(html, /排行榜/);
  assert.match(html, /贪吃蛇/);
  assert.match(html, /2048/);
  assert.match(html, /打砖块/);
  assert.match(html, /井字棋/);
  assert.match(html, /记忆翻牌/);
  assert.match(html, /扫雷/);
  assert.match(html, /俄罗斯方块/);
});

test("snake game lives in its own directory", () => {
  const html = readProjectFile("public/games/snake/index.html");

  assert.match(html, /服务器贪吃蛇/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /..\/..\/scripts\/leaderboard-widget\.js/);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(html, /id="leaderboard-form"/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
});

test("shared site stylesheet exists", () => {
  const css = readProjectFile("public/styles/site.css");

  assert.match(css, /\.site-header/);
  assert.match(css, /\.game-grid/);
  assert.match(css, /arcade-backdrop\.png/);
  assert.ok(fs.existsSync(path.join(projectRoot, "public/assets/arcade-backdrop.png")));
});

test("2048 game lives in its own directory", () => {
  const html = readProjectFile("public/games/2048/index.html");

  assert.match(html, /服务器 2048/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /..\/..\/scripts\/leaderboard-widget\.js/);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(html, /id="leaderboard-form"/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
});

test("breakout game lives in its own directory", () => {
  const html = readProjectFile("public/games/breakout/index.html");

  assert.match(html, /服务器打砖块/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /..\/..\/scripts\/leaderboard-widget\.js/);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(html, /id="leaderboard-form"/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
});

test("tic-tac-toe game lives in its own directory", () => {
  const html = readProjectFile("public/games/tic-tac-toe/index.html");

  assert.match(html, /服务器井字棋/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
});

test("memory game lives in its own directory", () => {
  const html = readProjectFile("public/games/memory/index.html");

  assert.match(html, /服务器记忆翻牌/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
});

test("minesweeper game lives in its own directory", () => {
  const html = readProjectFile("public/games/minesweeper/index.html");

  assert.match(html, /服务器扫雷/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
});

test("tetris game lives in its own directory", () => {
  const html = readProjectFile("public/games/tetris/index.html");

  assert.match(html, /服务器俄罗斯方块/);
  assert.match(html, /..\/..\/styles\/site.css/);
  assert.match(html, /game-state.js/);
  assert.match(html, /game.js/);
  assert.match(html, /返回小游戏集合/);
  assert.match(html, /class="game-page-layout"/);
  assert.match(html, /class="game-help"/);
  assert.match(html, /..\/..\/scripts\/leaderboard-widget\.js/);
  assert.match(html, /id="leaderboard-list"/);
  assert.match(html, /id="leaderboard-form"/);
  assert.match(html, /id="player-name"/);
});

test("shared leaderboard browser script exists", () => {
  const script = readProjectFile("public/scripts/leaderboard-widget.js");

  assert.match(script, /LeaderboardWidget/);
  assert.match(script, /fetch\("\/api\/leaderboard/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
});

test("leaderboard overview page exists", () => {
  const html = readProjectFile("public/leaderboard/index.html");
  const script = readProjectFile("public/leaderboard/leaderboard.js");

  assert.match(html, /排行榜总览/);
  assert.match(html, /id="leaderboard-overview"/);
  assert.match(html, /leaderboard\.js/);
  assert.match(script, /leaderboard-overview/);
  assert.match(script, /api\/leaderboard/);
  assert.doesNotMatch(script, /innerHTML\s*=/);
});
