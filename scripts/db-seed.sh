#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Executing Database Seeding & Setup ===${NC}"

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env configuration file not found. Create it before seeding.${NC}"
  exit 1
fi

echo -e "${BLUE}Running MongoDB setup and model seeding...${NC}"
# Execute the seed TS script directly using npx tsx
npx tsx server/scripts/seed.ts

echo -e "${GREEN}✓ Seeding sequence executed successfully!${NC}"
