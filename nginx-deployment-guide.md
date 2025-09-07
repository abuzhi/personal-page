# Nginx部署指南 - 个人导航页面

## 1. 准备工作

### 1.1 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# 或
sudo dnf install nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.2 上传项目文件
```bash
# 将项目文件上传到服务器
# 例如上传到 /var/www/personal-page
sudo mkdir -p /var/www/personal-page
sudo cp -r /path/to/your/local/project/* /var/www/personal-page/
sudo chown -R www-data:www-data /var/www/personal-page  # Ubuntu
# 或
sudo chown -R nginx:nginx /var/www/personal-page  # CentOS
```

## 2. 配置Nginx

### 2.1 使用简化配置（推荐新手）
```bash
# 复制简化配置文件
sudo cp nginx-simple.conf /etc/nginx/sites-available/personal-page
sudo ln -s /etc/nginx/sites-available/personal-page /etc/nginx/sites-enabled/

# 修改配置文件中的路径
sudo nano /etc/nginx/sites-available/personal-page
```

### 2.2 使用完整配置（推荐生产环境）
```bash
# 复制完整配置文件
sudo cp nginx.conf /etc/nginx/sites-available/personal-page
sudo ln -s /etc/nginx/sites-available/personal-page /etc/nginx/sites-enabled/

# 修改配置文件
sudo nano /etc/nginx/sites-available/personal-page
```

### 2.3 重要配置项修改
在配置文件中需要修改以下内容：

```nginx
# 1. 修改域名
server_name your-domain.com www.your-domain.com;

# 2. 修改项目路径
root /var/www/personal-page;  # 替换为实际路径

# 3. 修改SSL证书路径（如果使用HTTPS）
ssl_certificate /path/to/your/certificate.crt;
ssl_certificate_key /path/to/your/private.key;
```

## 3. 测试和启动

### 3.1 测试配置
```bash
# 测试Nginx配置语法
sudo nginx -t

# 如果测试通过，重新加载配置
sudo systemctl reload nginx
```

### 3.2 检查服务状态
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 查看Nginx进程
ps aux | grep nginx
```

## 4. 常见配置场景

### 4.1 本地测试配置
```nginx
server {
    listen 8080;  # 使用8080端口避免冲突
    server_name localhost;
    root /path/to/your/personal-page;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.2 子目录部署配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    
    # 部署在子目录 /nav
    location /nav {
        alias /var/www/personal-page;
        index index.html;
        try_files $uri $uri/ /nav/index.html;
    }
}
```

### 4.3 多页面配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/personal-page;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 特定页面路由
    location /about {
        try_files $uri /about.html;
    }
    
    location /currency {
        try_files $uri /currency.html;
    }
}
```

## 5. 性能优化

### 5.1 启用Gzip压缩
```nginx
# 在http块中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 5.2 静态资源缓存
```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

## 6. 安全配置

### 6.1 基本安全头
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 6.2 隐藏Nginx版本
```nginx
# 在http块中添加
server_tokens off;
```

## 7. 故障排除

### 7.1 常见问题
```bash
# 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查访问日志
sudo tail -f /var/log/nginx/access.log

# 检查端口占用
sudo netstat -tlnp | grep :80
```

### 7.2 权限问题
```bash
# 修复文件权限
sudo chown -R www-data:www-data /var/www/personal-page
sudo chmod -R 755 /var/www/personal-page
```

## 8. SSL证书配置（可选）

### 8.1 使用Let's Encrypt免费证书
```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 9. 监控和维护

### 9.1 日志轮转
```bash
# 配置logrotate
sudo nano /etc/logrotate.d/nginx
```

### 9.2 定期备份
```bash
# 创建备份脚本
#!/bin/bash
tar -czf /backup/personal-page-$(date +%Y%m%d).tar.gz /var/www/personal-page
```

## 10. 快速部署命令

```bash
# 一键部署脚本
#!/bin/bash
# 1. 上传文件到服务器
# 2. 复制配置文件
sudo cp nginx-simple.conf /etc/nginx/sites-available/personal-page
# 3. 创建软链接
sudo ln -s /etc/nginx/sites-available/personal-page /etc/nginx/sites-enabled/
# 4. 测试配置
sudo nginx -t
# 5. 重启Nginx
sudo systemctl restart nginx
```

---

**注意事项：**
1. 请根据实际服务器环境调整路径和权限
2. 生产环境建议使用HTTPS
3. 定期更新Nginx和SSL证书
4. 监控服务器性能和日志
