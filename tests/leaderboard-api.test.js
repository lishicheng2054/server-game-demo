const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { createLeaderboardServer } = require("../backend/server");

async function test(name, run) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

function requestJson(baseUrl, pathname, options = {}) {
  const url = new URL(pathname, baseUrl);
  const body = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const request = http.request(
      url,
      {
        method: options.method || "GET",
        headers: body
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(body),
            }
          : {},
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          raw += chunk;
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: raw ? JSON.parse(raw) : null,
          });
        });
      }
    );

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

async function withServer(run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "server-game-api-"));
  const server = createLeaderboardServer({
    dataFile: path.join(directory, "leaderboard.json"),
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("returns a health response", async () => {
  await withServer(async (baseUrl) => {
    const response = await requestJson(baseUrl, "/api/health");

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.body, { success: true, data: { status: "ok" } });
  });
});

test("accepts a score and returns leaderboard entries", async () => {
  await withServer(async (baseUrl) => {
    const created = await requestJson(baseUrl, "/api/leaderboard", {
      method: "POST",
      body: { game: "tetris", playerName: "小李", score: 500 },
    });
    const listed = await requestJson(baseUrl, "/api/leaderboard?game=tetris");

    assert.strictEqual(created.statusCode, 201);
    assert.strictEqual(created.body.success, true);
    assert.strictEqual(created.body.data.entry.playerName, "小李");
    assert.strictEqual(listed.statusCode, 200);
    assert.strictEqual(listed.body.data.entries[0].score, 500);
  });
});

test("rejects invalid score payloads", async () => {
  await withServer(async (baseUrl) => {
    const response = await requestJson(baseUrl, "/api/leaderboard", {
      method: "POST",
      body: { game: "tetris", playerName: "<bad>", score: 20 },
    });

    assert.strictEqual(response.statusCode, 400);
    assert.strictEqual(response.body.success, false);
  });
});

test("returns not found for unknown API routes", async () => {
  await withServer(async (baseUrl) => {
    const response = await requestJson(baseUrl, "/api/missing");

    assert.strictEqual(response.statusCode, 404);
    assert.strictEqual(response.body.success, false);
  });
});
