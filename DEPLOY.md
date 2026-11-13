# 部署到 nn.sayai.top

本项目是纯静态导航页，没有 Node.js 服务、后端接口或构建步骤。Nginx 和网站文件均放在 `177.3.88.105`，由 Nginx 直接提供 HTTPS 服务，无需反向代理。

| 项目 | 值 |
| --- | --- |
| 访问地址 | `https://nn.sayai.top`（443） |
| DNS A 记录 | `nn.sayai.top` → `177.3.88.105` |
| 网站目录 | `/var/www/personal-page` |
| Nginx 站点配置 | `/etc/nginx/conf.d/personal-page.conf` |
| HTTPS 证书 | `/etc/letsencrypt/live/nn.sayai.top/fullchain.pem` |
| HTTPS 私钥 | `/etc/letsencrypt/live/nn.sayai.top/privkey.pem` |
| ACME 验证目录 | `/var/www/letsencrypt` |

以下命令以 **Ubuntu / Debian、服务器 root 账户**为例。其他发行版可使用相应的包管理器安装 Nginx、Certbot、rsync；网站目录和站点配置内容相同。实际 SSH 账户不是 root 时，请替换上传命令中的账户，并为服务器管理命令加上 `sudo`。

## 1. DNS 和端口

将 `nn.sayai.top` 的 A 记录指向 `177.3.88.105`，确认解析生效。当前配置监听 IPv4；如存在 AAAA 记录，应移除，或在服务器具备公网 IPv6 时补充 IPv6 监听后再使用。

在云安全组及服务器防火墙中放行 TCP **443、80**。443 提供 HTTPS；80 用于跳转至 HTTPS，以及 Let's Encrypt HTTP-01 证书签发和续期。如果使用了 CDN，先使用仅 DNS 解析模式完成源站部署。

若服务器必须只开放 443，参见文末的 DNS 验证方案。

## 2. 安装软件并上传项目

在服务器执行：

```bash
apt-get update
apt-get install -y nginx certbot rsync
systemctl enable --now nginx
install -d -m 755 /var/www/personal-page /var/www/letsencrypt
```

在本地 `personal-page/` 目录执行，将当前目录内容上传到网站根目录：

```bash
rsync -av \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='.idea/' \
  --exclude='.DS_Store' \
  --exclude='Thumbs.db' \
  ./ root@177.3.88.105:/var/www/personal-page/
```

随后在服务器执行，保证 Nginx 可以读取静态文件：

```bash
find /var/www/personal-page -type d -exec chmod 755 {} +
find /var/www/personal-page -type f -exec chmod 644 {} +
```

## 3. 首次申请证书

正式 HTTPS 配置需要先有证书，否则 `nginx -t` 会因证书不存在而失败。先在服务器安装临时 HTTP 配置：

```bash
install -m 644 /var/www/personal-page/nginx.http.conf /etc/nginx/conf.d/personal-page.conf
nginx -t && systemctl reload nginx
```

这里加载的是站点配置文件，保留系统的 `/etc/nginx/nginx.conf`。系统主配置应在 `http {}` 内加载 `/etc/nginx/conf.d/*.conf` 并包含 `mime.types`，发行版默认配置通常已具备。若此前已有 `nn.sayai.top` 的配置，请合并或停用旧的同域名配置，避免重复。

申请证书，按提示填写邮箱、同意证书服务条款：

```bash
certbot certonly \
  --webroot \
  --webroot-path /var/www/letsencrypt \
  --cert-name nn.sayai.top \
  -d nn.sayai.top
```

如果已经有该域名的可信证书，可跳过本节，并将 `nginx.conf` 中的两个证书路径改为实际路径。`ssl_certificate` 使用包含中间证书的完整证书链；私钥留在服务器上。

## 4. 启用 HTTPS

证书就绪后，在服务器用正式配置覆盖临时配置：

```bash
install -m 644 /var/www/personal-page/nginx.conf /etc/nginx/conf.d/personal-page.conf
nginx -t && systemctl reload nginx
```

两个配置文件先后安装到同一个位置，**不要同时启用**。Nginx 监听服务器所有 IPv4 网卡的 443 端口，因此无需在配置中填写公网 IP。域名用于匹配虚拟主机和证书。

验证访问：

```bash
# 应返回 301，Location 指向 https://nn.sayai.top/。
curl -I http://nn.sayai.top/

# 应返回 200，且证书校验通过。
curl -I https://nn.sayai.top/

# 直接验证指定服务器的 HTTPS，仍使用域名验证证书和 SNI。
curl -I --resolve nn.sayai.top:443:177.3.88.105 https://nn.sayai.top/

# 配置文件、Git 元数据和不存在的资源均应返回 404。
curl -I https://nn.sayai.top/nginx.conf
curl -I https://nn.sayai.top/.git/config
curl -I https://nn.sayai.top/static/missing.css
```

配置会对 HTML、CSS、JavaScript、manifest 和 Service Worker 使用 `no-cache`，让浏览器在复用缓存前检查更新；图片和字体缓存 7 天。调试页、备份页、隐藏文件、部署配置和 Markdown 文档不对外提供。

## 5. 自动续期

在服务器创建证书续期成功后的重载脚本，让 Nginx 读取新证书：

```bash
install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/sh
set -eu
nginx -t
systemctl reload nginx
EOF
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

systemctl enable --now certbot.timer
certbot renew --dry-run
```

保留 80 端口的 ACME 验证配置和放行规则。日常更新网站时，重新执行上传及文件权限命令即可；静态内容更新无需重启 Nginx。修改 Nginx 配置后，需要重新安装配置文件并执行 `nginx -t && systemctl reload nginx`。

日志位于 `/var/log/nginx/personal-page.access.log` 和 `/var/log/nginx/personal-page.error.log`。

## 仅开放 443 时

使用 **DNS-01 验证**申请证书，绕开对 80 端口的依赖。推荐选择 DNS 服务商对应的 Certbot DNS 插件，按插件文档配置服务器上的 API 凭据并设置最小读取权限，以便自动续期；具体插件取决于 `sayai.top` 的 DNS 服务商。

也可以先手动签发，在服务器执行并按提示添加 `_acme-challenge.nn.sayai.top` 的 TXT 记录：

```bash
certbot certonly \
  --manual \
  --preferred-challenges dns \
  --cert-name nn.sayai.top \
  -d nn.sayai.top
```

手动 DNS 验证在没有认证钩子时**不能无人值守续期**，仅开启 `certbot.timer` 也不能解决；需在到期前手动续期并重载 Nginx，或改用 DNS 插件。证书签发后，删除 `nginx.conf` 中整个 `listen 80` 的 `server` 块，只安装 443 的配置，再执行配置检查及重载。此方案直接访问 `https://nn.sayai.top`，不提供 HTTP 跳转。

## 页面现有依赖

页面仍使用第三方 CDN 的脚本、字体和部分外部接口，相关功能依赖这些服务可访问。现有代码还包含 HTTP 的搜索建议接口和个别图标地址；浏览器在 HTTPS 页面上可能拦截这些混合内容，Nginx 配置无法替第三方资源修复协议问题。如需完全消除，可后续将这些地址换成支持 HTTPS 的服务，或将依赖资源本地化。
