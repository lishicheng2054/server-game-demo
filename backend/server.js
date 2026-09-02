const http = require("http");
const path = require("path");
const { createLeaderboardStore } = require("./leaderboard-service");

const DEFAULT_PORT = Number(process.env.PORT || 3001);
const DEFAULT_DATA_FILE = process.env.LEADERBOARD_FILE || "/var/lib/server-game-demo/leaderboard.json";
const MAX_BODY_BYTES = 4096;

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;

      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        const parseError = new Error("Request body must be valid JSON.");
        parseError.statusCode = 400;
        reject(parseError);
      }
    });
    request.on("error", reject);
  });
}

function getClientIp(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function createRateLimiter({ maxRequests = 30, windowMs = 60 * 1000 } = {}) {
  const requestsByIp = new Map();

  return function checkRateLimit(ip) {
    const now = Date.now();
    const recentRequests = (requestsByIp.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);

    if (recentRequests.length >= maxRequests) {
      return false;
    }

    requestsByIp.set(ip, [...recentRequests, now]);
    return true;
  };
}

function createLeaderboardServer(options = {}) {
  const dataFile = options.dataFile || DEFAULT_DATA_FILE;
  const store = createLeaderboardStore(path.resolve(dataFile));
  const checkRateLimit = createRateLimiter(options.rateLimit);

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");

      if (request.method === "GET" && url.pathname === "/api/health") {
        sendJson(response, 200, { success: true, data: { status: "ok" } });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/leaderboard") {
        const game = url.searchParams.get("game");
        sendJson(response, 200, {
          success: true,
          data: {
            game,
            entries: store.getScores(game),
          },
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/leaderboard") {
        if (!checkRateLimit(getClientIp(request))) {
          sendJson(response, 429, { success: false, error: "Too many requests." });
          return;
        }

        const payload = await readJsonBody(request);
        const data = store.addScore(payload);
        sendJson(response, 201, { success: true, data });
        return;
      }

      sendJson(response, 404, { success: false, error: "Not found." });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? "Internal server error." : error.message;

      if (statusCode === 500) {
        console.error(error);
      }

      sendJson(response, statusCode, { success: false, error: message });
    }
  });
}

if (require.main === module) {
  const server = createLeaderboardServer();

  server.listen(DEFAULT_PORT, "127.0.0.1", () => {
    console.log(`Leaderboard API listening on http://127.0.0.1:${DEFAULT_PORT}`);
  });
}

module.exports = {
  createLeaderboardServer,
};
