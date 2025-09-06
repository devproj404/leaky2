#!/bin/bash

set -e  # Exit on error

DOMAIN="leakybabes.com"
PROJECT_DIR=$(dirname "$(realpath "$0")")

echo "Changing to project directory: $PROJECT_DIR"
cd "$PROJECT_DIR"

echo "Obtaining SSL certificate using Certbot..."
sudo docker run --rm -v $PROJECT_DIR/certbot/conf:/etc/letsencrypt -v $PROJECT_DIR/certbot/www:/var/www/certbot certbot/certbot certonly --webroot --webroot-path /var/www/certbot --email admin@$DOMAIN --agree-tos --no-eff-email -d $DOMAIN

echo "Done!"
