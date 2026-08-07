#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TIMESTAMP=$(date +%F_%H%M%S)
BACKUP_DIR="backups"
BACKUP_NAME="backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo -e "${BLUE}=== Initializing System Backup Routine ===${NC}"

# Ensure backups directory exists
mkdir -p "${BACKUP_DIR}"
TEMP_BACKUP_DIR="${BACKUP_DIR}/temp_${TIMESTAMP}"
mkdir -p "${TEMP_BACKUP_DIR}"

# 1. Back up upload assets and FAISS index
echo -e "${BLUE}Packing persistent user upload storage...${NC}"
if [ -d server/uploads ]; then
  cp -r server/uploads "${TEMP_BACKUP_DIR}/uploads"
else
  mkdir -p "${TEMP_BACKUP_DIR}/uploads"
fi

# 2. Back up application logs
echo -e "${BLUE}Packing system diagnostics and logs...${NC}"
if [ -d server/logs ]; then
  cp -r server/logs "${TEMP_BACKUP_DIR}/logs"
else
  mkdir -p "${TEMP_BACKUP_DIR}/logs"
fi

# 3. Back up MongoDB
# Try exporting via mongodump from running Docker container, fallback to message
if command -v docker &> /dev/null && docker ps | grep -q "knowledge_assistant_db"; then
  echo -e "${BLUE}Dumping MongoDB collections using active container pipe...${NC}"
  docker exec knowledge_assistant_db mongodump --db=knowledge_assistant --archive --gzip > "${TEMP_BACKUP_DIR}/db_archive.gz"
  echo -e "${GREEN}✓ DB collection dump successful.${NC}"
else
  echo -e "${YELLOW}Warning: Running MongoDB container not found. Skipping DB dump...${NC}"
  echo -e "${YELLOW}If you have a local MongoDB, please back it up manually.${NC}"
fi

# 4. Create compressed tarball
echo -e "${BLUE}Assembling unified tarball archive...${NC}"
tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "temp_${TIMESTAMP}"

# Clean up temp folder
rm -rf "${TEMP_BACKUP_DIR}"

echo -e "${GREEN}✓ System Backup completed successfully!${NC}"
echo -e "${GREEN}Archive location: ${BACKUP_PATH}.tar.gz${NC}"
