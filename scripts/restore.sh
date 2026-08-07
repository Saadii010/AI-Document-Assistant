#!/usr/bin/env bash

set -eo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Initializing System Restore Sequence ===${NC}"

# Check for input argument
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Please specify the backup file to restore.${NC}"
  echo -e "Usage: ./scripts/restore.sh backups/backup_YYYY-MM-DD_HHMMSS.tar.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

# Create a temporary extraction directory
TEMP_RESTORE_DIR="backups/temp_restore_extract"
mkdir -p "$TEMP_RESTORE_DIR"

echo -e "${BLUE}Extracting backup archive...${NC}"
tar -xzf "$BACKUP_FILE" -C "$TEMP_RESTORE_DIR"

# Locate the actual extracted directory (temp_*)
EXTRACTED_SUBDIR=$(find "$TEMP_RESTORE_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)

if [ -z "$EXTRACTED_SUBDIR" ]; then
  echo -e "${RED}Error: Failed to parse backup file structure.${NC}"
  rm -rf "$TEMP_RESTORE_DIR"
  exit 1
fi

# 1. Restore Uploads
echo -e "${BLUE}Restoring uploaded documents and indexes...${NC}"
if [ -d "${EXTRACTED_SUBDIR}/uploads" ]; then
  mkdir -p server/uploads
  cp -r "${EXTRACTED_SUBDIR}/uploads/"* server/uploads/
  echo -e "${GREEN}✓ Document uploads and FAISS indexes restored.${NC}"
fi

# 2. Restore Logs
echo -e "${BLUE}Restoring system log files...${NC}"
if [ -d "${EXTRACTED_SUBDIR}/logs" ]; then
  mkdir -p server/logs
  cp -r "${EXTRACTED_SUBDIR}/logs/"* server/logs/
  echo -e "${GREEN}✓ Diagnostic logs restored.${NC}"
fi

# 3. Restore MongoDB
if [ -f "${EXTRACTED_SUBDIR}/db_archive.gz" ]; then
  if command -v docker &> /dev/null && docker ps | grep -q "knowledge_assistant_db"; then
    echo -e "${BLUE}Restoring MongoDB database collections inside Docker...${NC}"
    # Copy the gzip archive into the docker container and run mongorestore inside it
    docker cp "${EXTRACTED_SUBDIR}/db_archive.gz" knowledge_assistant_db:/tmp/db_archive.gz
    docker exec knowledge_assistant_db mongorestore --drop --archive=/tmp/db_archive.gz --gzip
    docker exec knowledge_assistant_db rm -f /tmp/db_archive.gz
    echo -e "${GREEN}✓ Database collections restored successfully.${NC}"
  else
    echo -e "${YELLOW}Warning: Running MongoDB docker container not found. Skipping DB restoration...${NC}"
    echo -e "${YELLOW}Please restore DB manually using: mongorestore --archive=${EXTRACTED_SUBDIR}/db_archive.gz --gzip${NC}"
  fi
else
  echo -e "${YELLOW}No database archive found in this backup.${NC}"
fi

# Clean up temp folder
rm -rf "$TEMP_RESTORE_DIR"

echo -e "${GREEN}✓ System Restoration completed successfully!${NC}"
echo -e "${GREEN}Please restart your application server or containers to sync the restored state.${NC}"
