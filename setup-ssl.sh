#!/bin/bash
# SSL setup script for mistersdrivers.ma
# Run this on the VPS after DNS is pointing to your droplet

set -e

DOMAIN="mistersdrivers.ma"
EMAIL="admin@mistersdrivers.ma"  # Change to your real email

echo "=== Step 1: Switch to HTTP-only nginx config ==="
cp nginx/nginx-initial.conf nginx/nginx-active.conf
docker compose cp nginx/nginx-initial.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
echo "✅ Nginx reloaded with HTTP-only config"

echo ""
echo "=== Step 2: Request SSL certificate ==="
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "✅ SSL certificate obtained!"

echo ""
echo "=== Step 3: Switch to HTTPS nginx config ==="
docker compose cp nginx/nginx.conf nginx:/etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
echo "✅ Nginx reloaded with HTTPS config"

echo ""
echo "=== Step 4: Test ==="
curl -s -o /dev/null -w "HTTPS: HTTP %{http_code}\n" "https://$DOMAIN/api/health"
echo ""
echo "🎉 SSL setup complete! Site is live at https://$DOMAIN"
echo ""
echo "To auto-renew certificates, add this cron job:"
echo "  crontab -e"
echo "  0 3 * * * cd $(pwd) && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
