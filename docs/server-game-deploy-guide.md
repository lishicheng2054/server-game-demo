# 服务器网页游戏部署流程

这份文档记录从腾讯云轻量应用服务器到上线小游戏集合站的完整流程。你现在用的是 Ubuntu Server 22.04 LTS。当前项目已经进入第二阶段：除了静态网页，还包含一个轻量排行榜 API。网页由 Nginx 发布，排行榜接口由 Node.js 后端提供，Nginx 负责把 `/api/` 转发给后端服务。

## 1. 认识几个地址

公网 IP 用来给互联网访问。例如浏览器访问网站、FinalShell 连接服务器，都用公网 IP。

内网 IP 只给同一云厂商内的服务器互相访问。你只有一台服务器时，暂时不用管内网 IP。

域名是公网 IP 的别名。没有域名时，可以直接用 `http://公网IP` 访问网站。

## 2. 服务器控制台需要检查什么

在腾讯云轻量应用服务器页面确认：

```text
系统：Ubuntu Server 22.04 LTS 64bit
状态：运行中
防火墙：开放 22、80、443
```

端口含义：

```text
22   SSH 登录服务器，FinalShell 使用这个端口
80   HTTP 网页访问，浏览器访问 http://公网IP 使用这个端口
443  HTTPS 网页访问，以后绑定域名和证书时使用
```

不要随便开放数据库端口，例如 `3306`、`5432`、`6379`。第一阶段用不到。

## 3. 用 FinalShell 登录

新建 SSH 连接：

```text
主机：你的公网 IP
端口：22
用户名：ubuntu
认证方式：密码
密码：你在腾讯云重置的实例密码
```

登录后运行：

```bash
whoami
```

看到：

```text
ubuntu
```

说明你已经进入服务器。

## 4. 安装 Nginx

Nginx 是网页服务器。它负责把 `/var/www/game` 里的网页文件发给访问者的浏览器。

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable --now nginx
sudo systemctl status nginx
```

如果状态里看到 `active (running)`，说明 Nginx 正在运行。

如果浏览器打不开 `http://公网IP`，优先检查腾讯云防火墙是否开放了 `80` 端口。

## 4.1 安装 Node.js

Node.js 用来运行排行榜 API。部署脚本会自动检查，如果服务器还没有 `node` 命令，就执行：

```bash
sudo apt-get update
sudo apt-get install -y nodejs
```

## 5. 准备网站目录

```bash
sudo mkdir -p /var/www/game
sudo chown -R ubuntu:ubuntu /var/www/game
```

解释：

```text
mkdir -p              创建目录
/var/www/game         我们的网站目录
chown -R ubuntu:ubuntu 把目录交给 ubuntu 用户管理
```

## 6. 配置 Nginx 网站

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/game
```

写入：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name _;

    root /var/www/game;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/game /etc/nginx/sites-enabled/game
```

关闭默认欢迎页：

```bash
sudo rm /etc/nginx/sites-enabled/default
```

检查配置并重新加载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. 上传游戏文件

本地项目目录：

```text
server-game-demo/public/
```

现在需要上传整个 `public` 目录，目录里包含集合首页、共享样式和各个游戏：

```text
index.html
assets/arcade-backdrop.png
styles/site.css
scripts/leaderboard-widget.js
leaderboard/index.html
leaderboard/leaderboard.js
games/snake/index.html
games/snake/game-state.js
games/snake/game.js
games/2048/index.html
games/2048/game-state.js
games/2048/game.js
games/breakout/index.html
games/breakout/game-state.js
games/breakout/game.js
games/tic-tac-toe/index.html
games/tic-tac-toe/game-state.js
games/tic-tac-toe/game.js
games/memory/index.html
games/memory/game-state.js
games/memory/game.js
games/minesweeper/index.html
games/minesweeper/game-state.js
games/minesweeper/game.js
games/tetris/index.html
games/tetris/game-state.js
games/tetris/game.js
lobby.js
```

上传到服务器：

```text
/var/www/game/
```

FinalShell 里可以直接把本地文件拖到服务器目录。上传后，服务器目录应该是：

```text
/var/www/game/index.html
/var/www/game/styles/site.css
/var/www/game/leaderboard/index.html
/var/www/game/leaderboard/leaderboard.js
/var/www/game/games/snake/index.html
/var/www/game/games/snake/game-state.js
/var/www/game/games/snake/game.js
/var/www/game/games/2048/index.html
/var/www/game/games/2048/game-state.js
/var/www/game/games/2048/game.js
/var/www/game/games/breakout/index.html
/var/www/game/games/breakout/game-state.js
/var/www/game/games/breakout/game.js
/var/www/game/games/tic-tac-toe/index.html
/var/www/game/games/tic-tac-toe/game-state.js
/var/www/game/games/tic-tac-toe/game.js
/var/www/game/games/memory/index.html
/var/www/game/games/memory/game-state.js
/var/www/game/games/memory/game.js
/var/www/game/games/minesweeper/index.html
/var/www/game/games/minesweeper/game-state.js
/var/www/game/games/minesweeper/game.js
/var/www/game/games/tetris/index.html
/var/www/game/games/tetris/game-state.js
/var/www/game/games/tetris/game.js
/var/www/game/lobby.js
```

后端文件会由部署脚本复制到：

```text
/opt/server-game-demo/backend/server.js
/opt/server-game-demo/backend/leaderboard-service.js
```

排行榜数据文件会放在：

```text
/var/lib/server-game-demo/leaderboard.json
```

## 8. 验证上线

浏览器访问：

```text
http://你的公网IP
```

能看到“游戏大厅”首页。首页分类按钮由 `lobby.js` 在浏览器本地筛选卡片。点击“贪吃蛇”的“开始游戏”，进入 `/games/snake/` 后会出现 `3 / 2 / 1 / GO` 倒计时。点击“2048”的“开始游戏”，进入 `/games/2048/` 后可以滑动合并数字方块。点击“打砖块”的“开始游戏”，进入 `/games/breakout/` 后可以控制挡板反弹小球。点击“井字棋”“记忆翻牌”“扫雷”或“俄罗斯方块”，可以进入新的回合制、配对类、推理类和消除类小游戏。

排行榜总览页：

```text
http://你的公网IP/leaderboard/
```

这个页面不是单独保存数据，而是调用同一个排行榜 API，把贪吃蛇、2048、打砖块和俄罗斯方块的榜单集中展示出来。

排行榜接口验证：

```text
http://你的公网IP/api/health
http://你的公网IP/api/leaderboard?game=tetris
```

如果看不到最新页面，按 `Ctrl + F5` 强制刷新。

## 9. 常见问题

### 访问还是 Nginx 欢迎页

通常是 Nginx 还在使用默认配置。检查：

```bash
ls -l /etc/nginx/sites-enabled
```

应该有 `game`，不应该有 `default`。

### 403 Forbidden 或子页面、CSS 404

如果文件已经在服务器上，但浏览器访问 `/styles/site.css` 或 `/games/snake/` 还是 404，常见原因是目录权限太小，Nginx 无法进入子目录。运行：

```bash
sudo chown -R ubuntu:ubuntu /var/www/game
sudo find /var/www/game -type d -exec chmod 755 {} +
sudo find /var/www/game -type f -exec chmod 644 {} +
```

### 404 Not Found

通常是文件没传对位置。检查：

```bash
ls -l /var/www/game
```

里面必须有 `index.html`。

### SSH 能连，网页打不开

优先检查腾讯云防火墙是否开放了 `80` 端口。

### 排行榜打不开

检查后端服务：

```bash
sudo systemctl status server-game-leaderboard.service
```

查看日志：

```bash
sudo journalctl -u server-game-leaderboard.service -n 50 --no-pager
```

检查 Nginx 是否代理了 `/api/`：

```bash
sudo nginx -t
curl http://127.0.0.1:3001/api/health
```

## 10. 你学到了什么

```text
FinalShell 通过 SSH 连接服务器
22 端口负责登录
80 端口负责网页访问
Nginx 是网页服务器
/var/www/game 是网站文件目录
index.html 是网页入口
styles/site.css 控制样式
game.js 控制浏览器交互
game-state.js 保存可测试的游戏规则
Canvas 或 DOM 负责绘制棋盘和更新画面
Node.js 负责运行排行榜 API
systemd 负责让后端服务开机自启
Nginx 可以把 /api/ 请求转发给后端
```

## 11. 贪吃蛇代码怎么分工

```text
index.html
  放页面结构，例如分数、按钮、Canvas 画布。

styles/site.css
  放视觉样式，例如背景、卡片、按钮、移动端布局。

game-state.js
  放纯游戏规则，例如开始游戏、改变方向、蛇前进、吃食物、撞墙、撞自己。
  这个文件不依赖浏览器页面，所以可以用 Node.js 自动测试。

game.js
  放浏览器相关逻辑，例如键盘事件、触屏滑动、Canvas 绘图、倒计时和动画循环。
```

游戏循环可以理解成：

```text
每隔一小段时间
  从方向输入队列里取出下一步方向
  读取下一步方向
  计算蛇头的新位置
  判断是否吃到食物
  判断是否撞墙或撞自己
  更新分数和蛇身
  根据分数计算下一次移动速度
  重新绘制 Canvas
```

流畅动画可以理解成：

```text
游戏规则仍然按 20x20 的格子移动
但 Canvas 每一帧都会计算“上一格到下一格之间走了多少”
所以视觉上蛇不是突然跳到下一格，而是在两格之间平滑滑过去
```

输入队列可以理解成：

```text
快速按 上 -> 左
旧版本可能只记住最后一次，或者丢掉一次输入
现在会按顺序保存最多 2 个方向
下一次移动先向上，再下一次移动向左
同时仍然禁止直接反向
```

速度规则：

```text
0-4 分      每 150 毫秒移动一次
5-9 分      每 135 毫秒移动一次
10-14 分    每 120 毫秒移动一次
分数继续提高会继续加快
最快不会低于每 70 毫秒移动一次
```

## 12. 2048 代码怎么分工

```text
games/2048/index.html
  放 2048 的页面结构，例如分数、最高分、状态、棋盘和按钮。

games/2048/game-state.js
  放纯游戏规则，例如创建棋盘、移动、合并、计分、判断胜利和判断无路可走。
  这个文件不依赖浏览器页面，所以可以用 Node.js 自动测试。

games/2048/game.js
  放浏览器相关逻辑，例如键盘事件、触屏滑动、DOM 棋盘渲染和最高分保存。
```

2048 的移动规则可以理解成：

```text
选择一个方向
  取出每一行或每一列
  去掉空格
  从移动方向的一侧开始合并相邻相同数字
  每个方块一回合只能合并一次
  把结果补回 4x4 棋盘
  如果棋盘发生变化，就随机生成一个新方块
```

## 13. 打砖块代码怎么分工

```text
games/breakout/index.html
  放打砖块的页面结构，例如分数、生命、砖块数、按钮和 Canvas 画布。

games/breakout/game-state.js
  放纯游戏规则，例如小球移动、墙面反弹、挡板碰撞、砖块碰撞、扣生命和胜负判断。
  这个文件不依赖浏览器页面，所以可以用 Node.js 自动测试。

games/breakout/game.js
  放浏览器相关逻辑，例如键盘事件、鼠标拖动、触屏拖动、Canvas 绘图和动画循环。
```

打砖块的游戏循环可以理解成：

```text
每一帧
  根据速度更新小球位置
  判断是否撞到左右墙或顶部
  判断是否撞到挡板
  判断是否撞到砖块
  如果打到砖块就隐藏砖块并加分
  如果小球掉到底部就扣生命
  生命用完则游戏结束，砖块清空则胜利
  重新绘制 Canvas
```

## 14. 井字棋代码怎么分工

```text
games/tic-tac-toe/index.html
  放井字棋的页面结构，例如比分、当前回合、棋盘和重新开局按钮。

games/tic-tac-toe/game-state.js
  放纯规则逻辑，例如落子、切换回合、判断胜利线、判断平局和重置。

games/tic-tac-toe/game.js
  放浏览器相关逻辑，例如按钮棋盘渲染、点击落子和比分显示。
```

## 15. 记忆翻牌代码怎么分工

```text
games/memory/index.html
  放记忆翻牌的页面结构，例如步数、配对数、最佳步数、卡片棋盘和重新洗牌按钮。

games/memory/game-state.js
  放纯规则逻辑，例如创建牌组、选择第一张牌、选择第二张牌、配对、锁定和胜利判断。

games/memory/game.js
  放浏览器相关逻辑，例如卡片渲染、点击翻牌、错配延迟翻回和最佳步数保存。
```

## 16. 扫雷代码怎么分工

```text
games/minesweeper/index.html
  放扫雷页面结构，例如剩余旗子、已翻开数量、状态、棋盘和重新布雷按钮。

games/minesweeper/game-state.js
  放纯规则逻辑，例如布雷、计算邻雷数、翻开格子、空白扩散、插旗、失败和胜利判断。

games/minesweeper/game.js
  放浏览器相关逻辑，例如点击翻格、右键插旗、手机长按插旗和格子渲染。
```

扫雷规则可以理解成：

```text
创建棋盘
  随机挑出 10 个雷
  给每个格子计算周围雷的数量

点击格子
  如果是雷，游戏失败
  如果是数字，只翻开这一格
  如果是空白，就继续扩散翻开周围安全格

当所有非雷格都翻开
  游戏胜利
```

## 17. 俄罗斯方块代码怎么分工

```text
games/tetris/index.html
  放俄罗斯方块页面结构，例如分数、消除行、最高分、状态、棋盘和控制按钮。

games/tetris/game-state.js
  放纯规则逻辑，例如生成方块、碰撞检测、移动、旋转、下落、锁定、消行和计分。

games/tetris/game.js
  放浏览器相关逻辑，例如键盘事件、自动下落计时器、DOM 棋盘渲染、暂停和最高分保存。
```

俄罗斯方块的规则循环可以理解成：

```text
每隔一小段时间
  尝试让当前方块向下移动一格
  如果下方有墙或已有方块，就把当前方块锁进棋盘
  检查有没有被填满的横行
  删除满行，在顶部补空行
  生成下一个方块
如果新方块一出现就碰撞，游戏结束
```

## 18. 排行榜代码怎么分工

```text
backend/leaderboard-service.js
  负责输入校验、分数排序、只保留前 10 名、读写 JSON 数据文件。

backend/server.js
  负责 HTTP API，例如 GET /api/leaderboard 和 POST /api/leaderboard。

public/games/snake/game.js
public/games/2048/game.js
public/games/breakout/game.js
public/games/tetris/game.js
  游戏结束后允许输入昵称，把本局分数提交到 /api/leaderboard。

public/scripts/leaderboard-widget.js
  共享排行榜前端组件。贪吃蛇、2048、打砖块和俄罗斯方块都可以复用它。

public/leaderboard/leaderboard.js
  排行榜总览页脚本。它会分别请求多个游戏的 /api/leaderboard 接口，然后渲染成几个榜单卡片。

deploy-to-server.sh
  把后端复制到 /opt/server-game-demo/backend，写入 systemd 服务，并让 Nginx 代理 /api/。
```

请求流程可以理解成：

```text
浏览器提交分数
  POST /api/leaderboard
Nginx 收到 /api/ 请求
  转发到 127.0.0.1:3001
Node.js 后端校验昵称和分数
  写入 /var/lib/server-game-demo/leaderboard.json
后端返回最新排行榜
  浏览器刷新榜单显示
```
