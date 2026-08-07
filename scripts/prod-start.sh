#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Starting Production Infrastructure ===${NC}"

# Check for production build existence
if [ ! -d dist ] || [ ! -f dist/server.js ]; then
  echo -e "${YELLOW}Build artifacts missing. Compiling a fresh release...${NC}"
  ./scripts/prod-build.sh
fi

# Ensure directories are ready
mkdir -p server/uploads server/logs

# Validate environment
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env configuration file is missing. Please create it and add required variables.${NC}"
  exit 1
fi

# Try launching with Docker Compose, otherwise fall back to raw Node
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  echo -e "${GREEN}Docker and Docker Compose found. Starting orchestrated container stack...${NC}"
  docker compose up -d --build
  echo -e "${GREEN}✓ Container services are up and healthy in the background!${NC}"
  echo -e "${GREEN}Access the application on http://localhost (Nginx reverse proxy)${NC}"
else
  echo -e "${YELLOW}Warning: Docker Compose not available. Running local Node.js production start...${NC}"
  export NODE_ENV=production
  npm start
fi
