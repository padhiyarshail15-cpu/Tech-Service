# Sourced by the Git hooks in this folder.
# GUI Git clients (GitHub Desktop, Sourcetree, apps opened from the Dock) don't load
# the shell profile, so Node/Yarn installed through nvm are not on PATH. Load nvm then.
if ! command -v yarn >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh" --no-use
    nvm use --silent >/dev/null 2>&1 || nvm use --silent default >/dev/null 2>&1 || true
  fi
fi

if ! command -v yarn >/dev/null 2>&1; then
  echo "husky - yarn not found. In a terminal run: nvm use && corepack enable" >&2
  exit 127
fi
