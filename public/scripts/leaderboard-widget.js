(function exposeLeaderboardWidget(root) {
  function createNoopWidget() {
    return {
      load() {},
      refreshDisplay() {},
      resetSubmission() {},
    };
  }

  function create(options) {
    const list = document.getElementById("leaderboard-list");
    const status = document.getElementById("leaderboard-status");
    const form = document.getElementById("leaderboard-form");
    const playerNameInput = document.getElementById("player-name");

    if (!list || !status || !form || !playerNameInput) {
      return createNoopWidget();
    }

    const game = options.game;
    const getScore = options.getScore;
    const canSubmit = options.canSubmit;
    let lastSubmittedScore = null;

    function setStatus(text) {
      status.textContent = text;
    }

    function renderEntries(entries) {
      list.replaceChildren();

      if (entries.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "leaderboard-empty";
        emptyItem.textContent = "还没有分数，来拿第一个名次。";
        list.appendChild(emptyItem);
        return;
      }

      entries.forEach((entry) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const score = document.createElement("strong");

        name.textContent = entry.playerName;
        score.textContent = entry.score;
        item.append(name, score);
        list.appendChild(item);
      });
    }

    function refreshDisplay() {
      const score = getScore();
      form.hidden = !canSubmit() || score <= 0;
    }

    async function load() {
      try {
        const response = await fetch(`/api/leaderboard?game=${encodeURIComponent(game)}`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "排行榜加载失败");
        }

        renderEntries(payload.data.entries);
        setStatus("已同步");
      } catch (error) {
        renderEntries([]);
        setStatus("离线");
      }
    }

    async function submitScore(event) {
      event.preventDefault();

      const score = getScore();

      if (score <= 0) {
        setStatus("先拿到分数");
        return;
      }

      if (lastSubmittedScore === score) {
        setStatus("本局已提交");
        return;
      }

      const playerName = playerNameInput.value.trim();

      if (!playerName) {
        setStatus("请输入昵称");
        playerNameInput.focus();
        return;
      }

      setStatus("提交中");

      try {
        const response = await fetch("/api/leaderboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game,
            playerName,
            score,
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || "提交失败");
        }

        lastSubmittedScore = score;
        renderEntries(payload.data.entries);
        setStatus("提交成功");
        refreshDisplay();
      } catch (error) {
        setStatus("提交失败");
      }
    }

    form.addEventListener("submit", submitScore);

    return {
      load,
      refreshDisplay,
      resetSubmission() {
        lastSubmittedScore = null;
        refreshDisplay();
      },
    };
  }

  root.LeaderboardWidget = {
    create,
  };
})(window);
