# FinalShell 上传和部署步骤

这份文档适合你照着操作，不需要把服务器密码发给任何人。当前项目是小游戏集合站，包含贪吃蛇、2048、打砖块、井字棋、记忆翻牌、扫雷和俄罗斯方块。现在还增加了排行榜 API，所以推荐上传整个项目文件夹，然后运行部署脚本。

## 方式 A：拖文件上传，适合新手

1. 在 FinalShell 连接服务器。
2. 在服务器终端执行：

```bash
mkdir -p ~/server-game-demo
```

3. 在 FinalShell 左侧或文件面板进入：

```text
/home/ubuntu/server-game-demo
```

4. 从本地电脑上传这些目录和文件：

```text
server-game-demo/public
server-game-demo/backend
server-game-demo/deploy-to-server.sh
```

5. 在服务器终端执行：

```bash
cd ~/server-game-demo
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

6. 浏览器访问：

```text
http://你的公网IP
```

## 方式 B：上传整个项目后运行脚本

1. 上传整个 `server-game-demo` 文件夹到服务器的：

```text
/home/ubuntu/server-game-demo
```

2. 在服务器终端执行：

```bash
cd ~/server-game-demo
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

3. 浏览器访问：

```text
http://你的公网IP
```

## 为什么不建议把密码发出去

服务器密码可以登录你的云服务器。别人拿到后可以删除文件、挖矿、攻击其他机器、产生费用。学习阶段最好的方式是：你自己保管密码，我把命令和文件准备好，你在 FinalShell 里执行。
