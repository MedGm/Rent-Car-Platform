#!/bin/bash
# SSL initialization script for mistersdrivers.com
# Run this ONCE on a fresh droplet after docker compose is configured.

set -e

DOMAIN="mistersdrivers.com"
EMAIL="admin@mistersdrivers.com"  # Change to your real email

echo "=============================================="
echo "  SSL Setup for $DOMAIN"
echo "=============================================="

# 1. Create a temporary self-signed cert so nginx can start
echo "[1/5] Creating temporary self-signed certificate..."
docker compose run --rm --entrypoint "" certbot sh -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN &&
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=$DOMAIN'
"

# 2. Start nginx (it can now load the temporary cert)
echo "[2/5] Starting nginx..."
docker compose up -d nginx

# 3. Remove the temporary cert
echo "[3/5] Removing temporary certificate..."
docker compose run --rm --entrypoint "" certbot sh -c "
  rm -rf /etc/letsencrypt/live/$DOMAIN &&
  rm -rf /etc/letsencrypt/archive/$DOMAIN &&
  rm -rf /etc/letsencrypt/renewal/$DOMAIN.conf
"

# 4. Request real certificates from Let's Encrypt
echo "[4/5] Requesting real SSL certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

# 5. Reload nginx with the real certificate
echo "[5/5] Reloading nginx with real certificate..."
docker compose exec nginx nginx -s reload

echo ""
echo "=============================================="
echo "  SSL setup complete!"
echo "  https://$DOMAIN is now live"
echo "=============================================="
echo ""
echo "To auto-renew, add this cron job:"
echo "  crontab -e"
echo "  0 3 * * * cd $(pwd) && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload"
