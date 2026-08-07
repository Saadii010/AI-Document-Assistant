#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Starting System Cleanup & Cache Flush ===${NC}"

# 1. Clean frontend static compilation artifacts
if [ -d dist ]; then
  echo -e "${BLUE}Removing client build outputs...${NC}"
  rm -rf dist
  echo -e "${GREEN}Removed /dist${NC}"
fi

# 2. Flush temporary lock files or node logs
echo -e "${BLUE}Purging system logs and temporary files...${NC}"
find . -type f -name "npm-debug.log*" -delete
find . -type f -name "yarn-error.log*" -delete
find . -type f -name ".DS_Store" -delete

# 3. Clean Docker system caches if Docker is running
if command -v docker &> /dev/null && docker info &> /dev/null; then
  echo -e "${BLUE}Flushing Docker builder and dangling network caches...${NC}"
  docker builder prune -f
  docker network prune -f
  echo -e "${GREEN}✓ Docker resources purged.${NC}"
fi

# 4. Prompt log rotation or archive compression
echo -e "${BLUE}Compressing active logs for archiving...${NC}"
mkdir -p server/logs
if [ -f server/logs/combined.log ]; then
  tar -czf server/logs/combined_$(date +%F_%H%M%S).tar.gz -C server/logs combined.log
  cat /dev/null > server/logs/combined.log
  echo -e "${GREEN}Archived and rotated combined.log${NC}"
fi

if [ -f server/logs/error.log ]; then
  tar -czf server/logs/error_$(date +%F_%H%M%S).tar.gz -C server/logs error.log
  cat /dev/null > server/logs/error.log
  echo -e "${GREEN}Archived and rotated error.log${NC}"
fi

echo -e "${GREEN}✓ System cleanup complete!${NC}"
