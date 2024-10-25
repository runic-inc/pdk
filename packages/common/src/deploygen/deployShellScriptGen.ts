import { cleanAndCapitalizeFirstLetter } from '../codegen/utils';
import { ProjectConfig } from "../types";

export class DeployShellScriptGen {
    constructor() { }

    gen(projectConfig: ProjectConfig): string {
        const deployerFilename = cleanAndCapitalizeFirstLetter(projectConfig.name) + "-deploy.s.sol";
        const mainContractName = projectConfig.name.replace(/\s/g, "");
        return `#!/bin/bash

# Function to check if required environment variables are set
check_env_vars() {
  [[ -z "$RPC_URL" ]] && echo "Error: RPC_URL environment variable not set" && exit 1
  [[ -z "$PRIVATE_KEY" ]] && echo "Error: PRIVATE_KEY environment variable not set" && exit 1
  [[ -z "$PATCHWORK_PROTOCOL" ]] && echo "Error: PATCHWORK_PROTOCOL environment variable not set" && exit 1
}

# Function to display usage information
usage() {
  echo "Usage: $0 [-b] [-s] [-c]"
  echo "Required environment variables:"
  echo "  RPC_URL             The RPC URL to use"
  echo "  PRIVATE_KEY         The private key for deployment"
  echo "  PATCHWORK_PROTOCOL  The Patchwork Protocol address"
  echo "Options:"
  echo "  -b    Optional flag to broadcast the script. Default is to simulate"
  echo "  -s    Optional flag to broadcast transactions slowly"
  echo "  -c    Optional flag to continue the last broadcast if it failed"
  exit 1
}

# Set defaults for forge script options
broadcast=false
slow=false
resume=false

# Parse command line options
while getopts ":bsc" opt; do
  case $opt in
    b)
      broadcast=true
      ;;
    s)
      slow=true
      ;;
    c)
      resume=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      ;;
  esac
done

# Check for required environment variables
check_env_vars

# Build forge options
forge_options="--optimize --optimizer-runs=200"

if $broadcast; then
  forge_options="$forge_options --broadcast"
fi

if $slow; then
  echo "Slow mode enabled: will wait for confirmations before broadcasting the next transaction"
  forge_options="$forge_options --slow"
fi

if $resume; then
  echo "Resume mode enabled: will continue from last broadcast"
  forge_options="$forge_options --resume"
fi

# Run the forge script
if $broadcast; then
  echo "Broadcasting deployment..."
else
  echo "Simulating deployment..."
fi

forge script $forge_options ${deployerFilename}:${mainContractName}Deploy \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY`
    }
}

