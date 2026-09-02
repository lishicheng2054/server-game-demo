const GAMES = [
  { id: "snake", name: "贪吃蛇", href: "../games/snake/", type: "经典 / 反应" },
  { id: "2048", name: "2048", href: "../games/2048/", type: "益智 / 数字" },
  { id: "breakout", name: "打砖块", href: "../games/breakout/", type: "动作 / 物理" },
  { id: "tetris", name: "俄罗斯方块", href: "../games/tetris/", type: "经典 / 消除" },
];

const overview = document.getElementById("leaderboard-overview");

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

function renderEntries(list, entries) {
  list.replaceChildren();

  if (entries.length === 0) {
    const empty = createElement("li", "leaderboard-empty", "暂无分数");
    list.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = createElement("li");
    const name = createElement("span", "", entry.playerName);
    const score = createElement("strong", "", String(entry.score));

    item.append(name, score);
    list.appendChild(item);
  });
}

function createCard(game) {
  const card = createElement("article", "leaderboard-card");
  const header = createElement("div", "leaderboard-card-header");
  const titleWrap = createElement("div");
  const eyebrow = createElement("p", "game-type", game.type);
  const title = createElement("h2", "", game.name);
  const status = createElement("span", "leaderboard-card-status", "加载中");
  const list = createElement("ol", "leaderboard-list");
  const link = createElement("a", "play-link", "去挑战");

  link.href = game.href;
  titleWrap.append(eyebrow, title);
  header.append(titleWrap, status);
  card.append(header, list, link);

  return { card, list, status };
}

async function loadGameLeaderboard(game, elements) {
  try {
    const response = await fetch(`/api/leaderboard?game=${encodeURIComponent(game.id)}`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || "排行榜加载失败");
    }

    renderEntries(elements.list, payload.data.entries);
    elements.status.textContent = "已同步";
  } catch (error) {
    renderEntries(elements.list, []);
    elements.status.textContent = "离线";
  }
}

function renderOverview() {
  const cards = GAMES.map((game) => {
    const elements = createCard(game);
    overview.appendChild(elements.card);
    return { game, elements };
  });

  cards.forEach(({ game, elements }) => {
    loadGameLeaderboard(game, elements);
  });
}

renderOverview();
