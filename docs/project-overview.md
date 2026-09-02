# Server Mini Games Project Overview

## 项目简介

Server Mini Games 是一个用于学习 Linux 服务器部署、Nginx 静态站点发布、Node.js API 服务和 Git 工作流的小游戏集合项目。

项目前端主要由静态 HTML、CSS 和 JavaScript 组成，可以直接通过 Nginx 发布到服务器目录。项目后端提供一个轻量排行榜 API，用 JSON 文件保存玩家分数，适合练习前后端联调、反向代理和 systemd 服务管理。

## 核心功能

- 小游戏大厅：展示并跳转到多个独立小游戏。
- 多款浏览器小游戏：包含贪吃蛇、2048、打砖块、井字棋、记忆翻牌、扫雷和俄罗斯方块。
- 排行榜系统：部分游戏可以提交分数，并在排行榜页面查看历史高分。
- 本地测试：项目包含规则逻辑、接口和站点结构测试。
- 服务器部署：提供部署脚本，将静态页面、后端 API 和 Nginx 配置部署到 Linux 服务器。

## 技术组成

```text
public/   静态页面、游戏脚本、样式和图片资源
backend/  Node.js 排行榜 API 和分数存储逻辑
tests/    游戏规则、接口和部署脚本测试
docs/     部署说明、上传步骤和项目文档
```

主要技术点：

- HTML / CSS / JavaScript
- Canvas 游戏绘制
- Node.js HTTP API
- JSON 文件持久化
- Nginx 静态站点和反向代理
- systemd 后台服务
- Git 分支、提交、本地合并和远程 Pull Request 合并

## 本地运行和验证

运行测试：

```bash
npm test
```

启动排行榜 API：

```bash
npm run start:api
```

前端页面位于 `public/` 目录，可以通过本地静态服务器或部署到 Nginx 后访问。

## 部署目标

部署脚本会把静态站点发布到：

```text
/var/www/game/
```

后端排行榜服务发布到：

```text
/opt/server-game-demo/backend/
```

排行榜数据默认保存在：

```text
/var/lib/server-game-demo/leaderboard.json
```

## GitHub 练习目标

这个项目适合用来练习完整 GitHub 协作流程：

1. 在本地创建 Git 仓库。
2. 创建功能分支并修改文件。
3. 提交分支改动。
4. 在本地把功能分支合并回 `main`。
5. 上传 `main` 到 GitHub。
6. 推送新的功能分支到 GitHub。
7. 在 GitHub 上创建 Pull Request。
8. 通过 Pull Request 完成远程合并。
9. 回到本地执行 `git pull` 同步远程合并结果。

## 安全注意事项

不要把私钥、密码、服务器凭据、`.env` 文件或部署 key 提交到 Git 仓库。项目中的 `.gitignore` 已经排除了常见密钥和本地配置文件，但提交前仍然应该用 `git status` 和 `git diff --staged` 检查一次。
