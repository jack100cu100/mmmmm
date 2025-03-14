#!/bin/bash

set -e

sudo apt update || { echo "Lỗi khi update apt"; exit 1; }
sudo apt upgrade -y
sudo apt --fix-missing update
sudo apt install -y nginx curl wget

sudo tee /etc/nginx/sites-available/default > /dev/null <<EOT
server {
    listen 80;
    server_name _;

    location / {
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

nginx -t || { echo "Cấu hình Nginx không hợp lệ"; exit 1; }
systemctl restart nginx || { echo "Không thể khởi động lại Nginx"; exit 1; }

GO_VERSION="1.24.1"
wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz || { echo "Không thể tải Go"; exit 1; }
sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

if [ ! -f "main.go" ]; then
    echo "Không tìm thấy file main.go"
    exit 1
fi

go build -o app main.go || { echo "Lỗi khi build ứng dụng"; exit 1; }

sudo tee /etc/systemd/system/goapp.service > /dev/null <<EOT
[Unit]
Description=Go Application Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=$PWD/app
Restart=always

[Install]
WantedBy=multi-user.target
EOT

sudo systemctl daemon-reload
sudo systemctl enable goapp
sudo systemctl start goapp

echo "Cài đặt hoàn tất"