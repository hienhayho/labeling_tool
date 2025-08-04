#!/bin/bash

# Exit on error
set -e

echo "🛑 Stopping existing services..."
docker compose --env-file .env.production down

echo "🔄 Show docker-compose config..."
docker compose --env-file .env.production config

echo "🚀 Starting labeling tool setup with production configuration..."

# Start the services
docker compose --env-file .env.production up -d --build

echo "🚀 All services started successfully!"
echo ""
echo "Services running at:"
echo "  - Frontend: http://localhost (or http://\${DOMAIN} if configured)"
echo "  - Backend API: http://api.localhost (or http://api.\${DOMAIN})"
echo "  - Traefik Dashboard: http://localhost:8080"
echo ""
echo "To view logs: docker logs -f [container_name]"
echo "To stop services: docker compose --env-file .env.production down"
