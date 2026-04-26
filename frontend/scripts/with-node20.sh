#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  echo "nvm not found at $NVM_DIR/nvm.sh"
  echo "Install nvm or run commands with Node 20.19+."
  exit 1
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"
nvm exec 20 "$@"
