#!/usr/bin/env bash
# Einmalig auf der eigenen Amazon-Linux-2023-Instanz ausführen.
set -euo pipefail
sudo dnf install -y nginx rsync
sudo install -d -m 755 -o ec2-user -g ec2-user /var/www/biztrips
sudo tee /etc/nginx/nginx.conf >/dev/null <<'NGINX'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;
events { worker_connections 1024; }
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    server {
        listen 80 default_server;
        server_name _;
        root /var/www/biztrips;
        index index.html;
        location / { try_files $uri $uri/ /index.html; }
    }
}
NGINX
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
