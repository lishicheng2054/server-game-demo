#!/usr/bin/env bash
set -euo pipefail

echo "Checking Node.js runtime ..."
if ! command -v node >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y nodejs
fi

echo "Preparing /var/www/game ..."
sudo mkdir -p /var/www/game
sudo chown -R "$USER:$USER" /var/www/game

echo "Preparing leaderboard backend directories ..."
sudo mkdir -p /opt/server-game-demo/backend /var/lib/server-game-demo
sudo chown -R "$USER:$USER" /var/lib/server-game-demo
sudo cp -R backend/. /opt/server-game-demo/backend/
sudo find /opt/server-game-demo/backend -type d -exec chmod 755 {} +
sudo find /opt/server-game-demo/backend -type f -exec chmod 644 {} +

echo "Copying public site into /var/www/game ..."
rm -f /var/www/game/style.css /var/www/game/game-state.js /var/www/game/game.js
cp -R public/. /var/www/game/

echo "Fixing published file permissions ..."
find /var/www/game -type d -exec chmod 755 {} +
find /var/www/game -type f -exec chmod 644 {} +

echo "Writing leaderboard systemd service ..."
sudo tee /etc/systemd/system/server-game-leaderboard.service >/dev/null <<'SYSTEMD'
[Unit]
Description=Server Mini Games Leaderboard API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/server-game-demo
Environment=PORT=3001
Environment=LEADERBOARD_FILE=/var/lib/server-game-demo/leaderboard.json
ExecStart=/usr/bin/env node /opt/server-game-demo/backend/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SYSTEMD

echo "Starting leaderboard backend ..."
sudo systemctl daemon-reload
sudo systemctl enable --now server-game-leaderboard.service
sudo systemctl restart server-game-leaderboard.service

echo "Writing Nginx site config ..."
sudo tee /etc/nginx/sites-available/game >/dev/null <<'NGINX'
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
NGINX

sudo ln -sf /etc/nginx/sites-available/game /etc/nginx/sites-enabled/game
sudo rm -f /etc/nginx/sites-enabled/default

echo "Testing and reloading Nginx ..."
sudo nginx -t
sudo systemctl reload nginx

if command -v curl >/dev/null 2>&1; then
    for attempt in 1 2 3 4 5; do
        if curl -fsS http://127.0.0.1:3001/api/health >/dev/null 2>&1; then
            break
        fi

        if [ "$attempt" = "5" ]; then
            sudo systemctl status server-game-leaderboard.service --no-pager
            exit 1
        fi

        sleep 1
    done
fi

echo "Done. Visit http://your-public-ip in your browser."
