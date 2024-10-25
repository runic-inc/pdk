#!/bin/bash

# Get absolute path to the script directory
SCRIPT_DIR="$(pwd)/contracts/script"

# Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
OWNER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
PATCHWORK_PROTOCOL=0x00000000001616E65bb9FdA42dFBb7155406549b

# Find the deploy script matching the pattern *-deploy.sh
DEPLOY_SCRIPT=$(find "$SCRIPT_DIR" -name "*-deploy.sh" -type f)

# Check if exactly one deploy script was found
if [ -z "$DEPLOY_SCRIPT" ]; then
    echo "Error: No deploy script found in $SCRIPT_DIR"
    exit 1
fi

# Check if multiple deploy scripts were found
if [ $(echo "$DEPLOY_SCRIPT" | wc -l) -gt 1 ]; then
    echo "Error: Multiple deploy scripts found in $SCRIPT_DIR:"
    echo "$DEPLOY_SCRIPT"
    echo "Please ensure only one *-deploy.sh script exists."
    exit 1
fi

# Extract project name from the deploy script filename
PROJECT_NAME=$(basename "$DEPLOY_SCRIPT" | sed 's/-deploy\.sh//')
echo "Found deploy script for project: $PROJECT_NAME"

# Export required environment variables
export RPC_URL
export PRIVATE_KEY
export OWNER
export PATCHWORK_PROTOCOL

# Make deploy script executable if it isn't already
chmod +x "$DEPLOY_SCRIPT"

# Change to the script directory before executing
cd "$SCRIPT_DIR"

# Execute the deploy script from the correct directory
echo "Executing deploy script..."
"$DEPLOY_SCRIPT" "$@"
