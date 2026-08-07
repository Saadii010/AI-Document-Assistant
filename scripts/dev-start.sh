#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -eo pipefail

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Knowledge Assistant Development Environment ===${NC}"

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found. Bootstrapping from .env.example...${NC}"
  cp .env.example .env
  echo -e "${GREEN}Created .env file. Please edit it with your real GEMINI_API_KEY.${NC}"
fi

# Ensure required folders exist
mkdir -p server/uploads server/logs

# Check if Docker is installed and running
if command -v docker &> /dev/null && docker info &> /dev/null; then
  echo -e "${GREEN}Docker is running. Booting up services via docker-compose-dev...${NC}"
  docker compose -f docker-compose.yml up --build -d mongodb
  echo -e "${GREEN}MongoDB is booted in the background. Starting local Node dev server...${NC}"
  npm run dev
else
  echo -e "${YELLOW}Warning: Docker is not running or not installed. Running local start sequence directly...${NC}"
  echo -e "${YELLOW}Please ensure a local MongoDB server is running on localhost:27017.${NC}"
  npm run dev
fi
