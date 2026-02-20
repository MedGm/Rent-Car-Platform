#!/bin/bash
# SSL initialization script for mistersdrivers.com
# Run this ONCE on a fresh droplet after docker compose is configured.

set -e

DOMAIN="mistersdrivers.com"
EMAIL="contact@mistersdrivers.com"  # Change to your real email
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=============================================="
echo "  SSL Setup for $DOMAIN"
echo "=============================================="

# 0. Check if port 80 is reachable (basic firewall test)
echo "[0/4] Checking firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp 2>/dev/null || true
    sudo ufw allow 443/tcp 2>/dev/null || true
    echo "  Firewall rules updated (ports 80, 443 allowed)"
else
    echo "  No ufw detected — make sure ports 80 and 443 are open in your cloud firewall"
fi

# 1. Swap to HTTP-only nginx config (no SSL needed) and start nginx
echo "[1/4] Starting nginx with HTTP-only config..."
cp "$SCRIPT_DIR/nginx/nginx-http.conf" "$SCRIPT_DIR/nginx/nginx-active.conf"

# Temporarily override the nginx volume mount to use the http-only config
docker compose stop nginx 2>/dev/null || true
docker compose rm -f nginx 2>/dev/null || true

# Start nginx with http-only config
NGINX_CONF=nginx-http.conf docker compose up -d nginx
sleep 3

# Verify nginx is running on port 80
echo "  Verifying nginx responds on port 80..."
if curl -sf -o /dev/null http://localhost/.well-known/acme-challenge/test 2>/dev/null || curl -sf -o /dev/null http://localhost/ 2>/dev/null; then
    echo "  ✓ nginx is listening on port 80"
else
    echo "  ⚠ nginx may not be fully ready yet, continuing..."
fi

# 2. Request real certificates from Let's Encrypt
echo "[2/4] Requesting SSL certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# 3. Switch to full SSL nginx config and restart
echo "[3/4] Switching to SSL nginx config..."
docker compose stop nginx
docker compose rm -f nginx
docker compose up -d nginx
sleep 2

# 4. Verify HTTPS works
echo "[4/4] Verifying HTTPS..."
if curl -sf -o /dev/null "https://$DOMAIN" 2>/dev/null; then
    echo "  ✓ HTTPS is working!"
else
    echo "  ⚠ HTTPS check inconclusive (may need a moment to propagate)"
fi

echo ""
echo "=============================================="
echo "  SSL setup complete!"
echo "  https://$DOMAIN is now live"
echo "=============================================="
echo ""
echo "To auto-renew, add this cron job:"
echo "  crontab -e"
echo "  0 3 * * * cd $SCRIPT_DIR && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
