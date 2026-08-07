#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Building Knowledge Assistant Production Release ===${NC}"

# Clean existing build directories
echo -e "${BLUE}Cleaning legacy builds...${NC}"
npm run clean || rm -rf dist

# Install dependencies if node_modules is missing
if [ ! -directory node_modules ]; then
  echo -e "${BLUE}Installing required packages...${NC}"
  npm install
fi

# Run Linting and Type Checks
echo -e "${BLUE}Running source diagnostics and type checking...${NC}"
npm run lint

# Compile static clients and bundle backend server
echo -e "${BLUE}Compiling Client and Bundling Server...${NC}"
npm run build

echo -e "${GREEN}✓ Production build completed successfully! Build output stored in /dist${NC}"
echo -e "${GREEN}To start the production system, run: ./scripts/prod-start.sh${NC}"
