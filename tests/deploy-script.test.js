const assert = require("assert");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const script = fs.readFileSync(path.join(projectRoot, "deploy-to-server.sh"), "utf8");

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

test("deployment keeps published directories readable by nginx", () => {
  assert.match(script, /find \/var\/www\/game -type d -exec chmod 755 \{\} \+/);
  assert.match(script, /find \/var\/www\/game -type f -exec chmod 644 \{\} \+/);
});

test("deployment does not wipe the whole published directory", () => {
  assert.doesNotMatch(script, /rm\s+-rf\s+\/var\/www\/game/);
  assert.match(script, /rm -f \/var\/www\/game\/style\.css \/var\/www\/game\/game-state\.js \/var\/www\/game\/game\.js/);
});

test("deployment configures the leaderboard backend service", () => {
  assert.match(script, /command -v node/);
  assert.match(script, /\/opt\/server-game-demo\/backend/);
  assert.match(script, /\/var\/lib\/server-game-demo/);
  assert.match(script, /server-game-leaderboard\.service/);
  assert.match(script, /proxy_pass http:\/\/127\.0\.0\.1:3001/);
  assert.match(script, /for attempt in/);
});
