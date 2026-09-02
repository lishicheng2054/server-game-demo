# Server Mini Games

这是一个用来学习服务器部署的小游戏集合站。网页部分是静态文件，只要 Nginx 能访问 `/var/www/game`，就能上线。项目现在还包含一个轻量排行榜 API，先用服务器上的 JSON 文件保存分数，适合学习 API、Nginx 反向代理和 systemd 服务。

## 文件结构

```text
public/
  index.html                 小游戏集合首页
  assets/arcade-backdrop.png 全站像素风背景图
  styles/site.css            共享样式
  scripts/leaderboard-widget.js 共享排行榜前端组件
  leaderboard/index.html     排行榜总览页
  leaderboard/leaderboard.js 排行榜总览页数据读取和渲染
  games/snake/index.html     贪吃蛇页面
  games/snake/game-state.js  贪吃蛇规则逻辑，可测试
  games/snake/game.js        Canvas 绘制、键盘控制和页面更新
  games/2048/index.html      2048 页面
  games/2048/game-state.js   2048 规则逻辑，可测试
  games/2048/game.js         2048 棋盘渲染、键盘和触屏控制
  games/breakout/index.html  打砖块页面
  games/breakout/game-state.js 打砖块规则逻辑，可测试
  games/breakout/game.js     打砖块 Canvas 绘制、动画和输入控制
  games/tic-tac-toe/index.html 井字棋页面
  games/tic-tac-toe/game-state.js 井字棋规则逻辑，可测试
  games/tic-tac-toe/game.js   井字棋棋盘渲染和点击控制
  games/memory/index.html     记忆翻牌页面
  games/memory/game-state.js  记忆翻牌规则逻辑，可测试
  games/memory/game.js        记忆翻牌渲染、翻牌和最佳步数保存
  games/minesweeper/index.html 扫雷页面
  games/minesweeper/game-state.js 扫雷规则逻辑，可测试
  games/minesweeper/game.js   扫雷格子渲染、翻格、插旗和长按控制
  games/tetris/index.html      俄罗斯方块页面
  games/tetris/game-state.js   俄罗斯方块规则逻辑，可测试
  games/tetris/game.js         俄罗斯方块棋盘渲染、键盘和按钮控制
  lobby.js                    游戏大厅分类筛选
backend/
  leaderboard-service.js      排行榜校验、排序和 JSON 文件存储
  server.js                   排行榜 HTTP API
tests/
  game-state.test.js
  2048-state.test.js
  breakout-state.test.js
  tic-tac-toe-state.test.js
  memory-state.test.js
  minesweeper-state.test.js
  tetris-state.test.js
  leaderboard-service.test.js
  leaderboard-api.test.js
  site-structure.test.js
  deploy-script.test.js
docs/
  server-game-deploy-guide.md
  finalshell-upload-steps.md
```

## 玩法

- 点击“开始”启动游戏
- 使用方向键或 `WASD` 控制蛇移动
- 按空格可以暂停/继续
- 手机上可以用滑动或页面下方方向按钮控制
- 吃到红色食物加 1 分并变长
- 分数越高，移动速度越快
- 开始前会有 `3 / 2 / 1 / GO` 倒计时
- 画面使用插值动画，蛇在格子之间会平滑移动
- 撞墙或撞到自己时游戏结束
- 最高分保存在当前浏览器里

## 2048 玩法

- 点击“开始新局”生成初始方块
- 使用方向键或 `WASD` 移动
- 手机上可以滑动，也可以用页面下方方向按钮
- 相同数字相撞会合并，并把合并后的数字计入分数
- 合成 `2048` 时胜利
- 棋盘填满且没有任何方向可以移动时游戏结束
- 最高分保存在当前浏览器里

## 打砖块玩法

- 点击“开始”启动游戏
- 使用方向键或 `A/D` 移动挡板
- 电脑上可以用鼠标移动挡板，手机上可以用手指拖动
- 按空格可以暂停/继续
- 小球击中砖块加 10 分
- 小球落到底部会扣 1 条生命
- 清空全部砖块时胜利，生命用完时游戏结束

## 井字棋玩法

- 两名玩家轮流点击 3x3 棋盘
- `X` 先手，`O` 后手
- 横、竖、斜任意三格连成一线即获胜
- 棋盘下满且无人连线时平局
- 页面会记录本次打开页面后的 X 胜、O 胜和平局次数

## 记忆翻牌玩法

- 每次翻开两张牌
- 两张相同会保持翻开并计为一组配对
- 两张不同会短暂停留后翻回去
- 找到全部 8 组配对即胜利
- 页面会保存当前浏览器里的最佳步数

## 扫雷玩法

- 9x9 棋盘，里面有 10 个雷
- 点击格子可以翻开
- 右键可以插旗，手机上长按可以插旗
- 数字表示周围 8 个方向里有几个雷
- 翻开所有安全格即胜利
- 点到雷时游戏失败

## 俄罗斯方块玩法

- 点击“开始”启动游戏
- 使用方向键或 `WASD` 左右移动、加速下落
- 使用上键、`W` 或 `X` 旋转方块
- 按空格可以直接落底，按 `P` 可以暂停/继续
- 手机上可以用页面下方按钮控制
- 拼满横行后会消除，每消除 1 行加 100 分
- 方块堆到顶部时游戏结束
- 最高分保存在当前浏览器里

## 本地验证

```bash
npm test
```

## 排行榜 API

当前已接入排行榜的游戏：

```text
贪吃蛇
2048
打砖块
俄罗斯方块
```

排行榜页面：

```text
http://你的公网IP/leaderboard/
```

这个页面会同时读取多个游戏的排行榜。浏览器访问 `/leaderboard/` 时，前端脚本会分别请求：

```text
/api/leaderboard?game=snake
/api/leaderboard?game=2048
/api/leaderboard?game=breakout
/api/leaderboard?game=tetris
```

本地启动：

```bash
npm run start:api
```

接口：

```text
GET  /api/leaderboard?game=tetris
POST /api/leaderboard
```

提交示例：

```json
{
  "game": "tetris",
  "playerName": "小李",
  "score": 500
}
```

## 部署到服务器

推荐上传整个项目后运行部署脚本：

```bash
cd ~/server-game-demo
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

脚本会把整个 `public` 目录发布到服务器：

```text
/var/www/game/
```

同时会把后端发布到：

```text
/opt/server-game-demo/backend/
```

排行榜数据保存在：

```text
/var/lib/server-game-demo/leaderboard.json
```

然后浏览器访问：

```text
http://你的公网IP
http://你的公网IP/games/snake/
http://你的公网IP/games/2048/
http://你的公网IP/games/breakout/
http://你的公网IP/games/tic-tac-toe/
http://你的公网IP/games/memory/
http://你的公网IP/games/minesweeper/
http://你的公网IP/games/tetris/
http://你的公网IP/leaderboard/
http://你的公网IP/api/leaderboard?game=tetris
```
