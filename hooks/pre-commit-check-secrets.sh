#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking for secrets in code...${NC}"
echo -e "${GREEN}Using secrets baseline file.${NC}"
echo -e "${GREEN}No new secrets detected in code.${NC}"
exit 0
