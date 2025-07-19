#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking for vulnerable dependencies...${NC}"

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
  # Check if package.json has changed
  if git diff --cached --name-only | grep -q "frontend/package.json"; then
    echo -e "${YELLOW}Checking pnpm dependencies...${NC}"
    cd frontend && pnpm audit --prod || {
      echo -e "${RED}Vulnerable pnpm dependencies found!${NC}"
      echo -e "${YELLOW}Run 'pnpm audit fix' to fix issues or 'pnpm audit' for more details.${NC}"
      echo -e "${YELLOW}You can bypass this check with 'git commit --no-verify' if needed.${NC}"
      exit 1
    }
    cd ..
  fi
else
  echo -e "${YELLOW}pnpm not found. Skipping frontend dependency check.${NC}"
  echo -e "${YELLOW}Install pnpm with 'npm install -g pnpm' to enable this check.${NC}"
fi

# Check if pip is available
if command -v pip &> /dev/null; then
  # Check if requirements files have changed
  if git diff --cached --name-only | grep -q "requirements"; then
    echo -e "${YELLOW}Checking Python dependencies...${NC}"
    pip install safety &> /dev/null || pip install safety

    # Check backend requirements
    if [ -f "backend/requirements.txt" ]; then
      safety check -r backend/requirements.txt --full-report || {
        echo -e "${RED}Vulnerable Python dependencies found in backend!${NC}"
        echo -e "${YELLOW}Please update the affected packages.${NC}"
        echo -e "${YELLOW}You can bypass this check with 'git commit --no-verify' if needed.${NC}"
        exit 1
      }
    fi

    # Check other requirements files
    for req_file in $(find . -name "requirements.txt" -not -path "*/\.*" -not -path "*/backend/*"); do
      safety check -r "$req_file" --full-report || {
        echo -e "${RED}Vulnerable Python dependencies found in $req_file!${NC}"
        echo -e "${YELLOW}Please update the affected packages.${NC}"
        echo -e "${YELLOW}You can bypass this check with 'git commit --no-verify' if needed.${NC}"
        exit 1
      }
    done
  fi
fi

echo -e "${GREEN}No vulnerable dependencies found!${NC}"
exit 0
