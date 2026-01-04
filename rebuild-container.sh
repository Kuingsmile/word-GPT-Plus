#!/bin/bash

echo "=========================================="
echo "Rebuilding Word GPT Plus Container"
echo "=========================================="
echo ""

# Stop and remove old container
echo "Stopping existing container..."
docker-compose down

# Build without cache
echo "Building new container without cache..."
docker-compose build --no-cache

# Start container
echo "Starting container..."
docker-compose up -d

# Show logs
echo ""
echo "Container started! Checking logs..."
docker-compose logs --tail=50

echo ""
echo "=========================================="
echo "Rebuild complete!"
echo "=========================================="
echo ""
echo "The plugin is now running with the updated code on port 3100"
echo "Access it at: http://localhost:3100"
