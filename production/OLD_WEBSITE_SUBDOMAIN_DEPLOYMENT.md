# Old Website Subdomain Deployment

This document records the steps used to run the old Galaxy Elite website from:

```text
/var/www/galaxy_elite_private_match_ubuntu_ready
```

on this subdomain:

```text
https://old.yourpropertymatch.cloud
```

## 1. Confirm DNS

The DNS record for the subdomain must point to the VPS public IP.

```bash
getent hosts old.yourpropertymatch.cloud
```

Expected result:

```text
89.116.33.176 old.yourpropertymatch.cloud
```

## 2. Inspect The Old App

```bash
cd /var/www/galaxy_elite_private_match_ubuntu_ready
ls -la
cat package.json
cat ecosystem.config.cjs
```

The folder contains a built Next.js standalone app:

```text
server.js
.next/
node_modules/
.env.local
.data/
```

Important note: the included `ecosystem.config.cjs` points to an old path and port, so it was not used directly.

## 3. Choose A Free Internal Port

Check used ports:

```bash
ss -ltnp | grep -E ':300[0-9]|:80|:443' || true
```

Current live apps use:

```text
3001 admin dashboard
3002 current website
4000 backend API
```

The old website was started on:

```text
127.0.0.1:3003
```

## 4. Start The Old Website With PM2

```bash
cd /var/www/galaxy_elite_private_match_ubuntu_ready

PORT=3003 \
HOSTNAME=127.0.0.1 \
NODE_ENV=production \
NEXT_PUBLIC_SITE_URL=https://old.yourpropertymatch.cloud \
GALAXY_DATA_DIR=/var/www/galaxy_elite_private_match_ubuntu_ready/.data \
pm2 start server.js \
  --name galaxy-old-website \
  --cwd /var/www/galaxy_elite_private_match_ubuntu_ready \
  --update-env

pm2 save
pm2 status
```

## 5. Test The Old App Locally On The VPS

```bash
curl -sS -o /tmp/old-local.out -w "%{http_code}" http://127.0.0.1:3003
```

Expected result:

```text
200
```

Check logs:

```bash
pm2 logs galaxy-old-website --lines 20 --nostream --no-color
```

Expected log includes:

```text
Local: http://127.0.0.1:3003
Ready
```

## 6. Create Nginx Site

Create:

```bash
nano /etc/nginx/sites-available/galaxy-old-website
```

Use this config:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name old.yourpropertymatch.cloud;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/galaxy-old-website /etc/nginx/sites-enabled/galaxy-old-website
```

If the symlink already exists, skip this step.

## 7. Test And Reload Nginx

```bash
nginx -t
systemctl reload nginx
```

## 8. Test HTTP Before SSL

```bash
curl -sS -o /tmp/old-subdomain-http.out -w "%{http_code}" http://old.yourpropertymatch.cloud
curl -sS -I http://old.yourpropertymatch.cloud | sed -n '1,12p'
```

Expected result before SSL:

```text
200
```

## 9. Install SSL Certificate

Certbot was already installed on the VPS.

```bash
certbot --nginx \
  -d old.yourpropertymatch.cloud \
  --non-interactive \
  --agree-tos \
  --email admin@galaxyelite.ae \
  --redirect
```

Certbot installs the certificate and updates Nginx for HTTPS redirect.

Certificate paths:

```text
/etc/letsencrypt/live/old.yourpropertymatch.cloud/fullchain.pem
/etc/letsencrypt/live/old.yourpropertymatch.cloud/privkey.pem
```

## 10. Final Verification

```bash
curl -sS -o /tmp/old-subdomain-https.out -w "%{http_code}" https://old.yourpropertymatch.cloud
curl -sS -I http://old.yourpropertymatch.cloud | sed -n '1,10p'
nginx -t
pm2 status --no-color
```

Expected results:

```text
https://old.yourpropertymatch.cloud returns 200
http://old.yourpropertymatch.cloud returns 301 to HTTPS
nginx -t passes
galaxy-old-website is online in PM2
```

## Current Production State

```text
PM2 process: galaxy-old-website
App path: /var/www/galaxy_elite_private_match_ubuntu_ready
Internal URL: http://127.0.0.1:3003
Public URL: https://old.yourpropertymatch.cloud
Nginx site: /etc/nginx/sites-available/galaxy-old-website
```

## Useful Commands

Restart old website:

```bash
pm2 restart galaxy-old-website --update-env
pm2 save
```

View logs:

```bash
pm2 logs galaxy-old-website --lines 80 --nostream --no-color
```

Disable old website Nginx site:

```bash
rm /etc/nginx/sites-enabled/galaxy-old-website
nginx -t
systemctl reload nginx
```

Stop old website process:

```bash
pm2 stop galaxy-old-website
pm2 save
```

## Known Note

The old build still contains metadata and canonical URLs pointing to:

```text
https://match.galaxyelite.ae
```

The site works on `old.yourpropertymatch.cloud`, but SEO metadata should be rebuilt if the old site needs correct canonical URLs for public indexing.
