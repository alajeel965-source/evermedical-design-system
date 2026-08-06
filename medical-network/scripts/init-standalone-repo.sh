#!/usr/bin/env bash
#
# Turn this medical-network/ folder into its own standalone GitHub repo.
#
# This session was locked to the evermedical-design-system repository, so the
# repo could not be created from here. Run this on your own machine (or any
# environment that isn't repo-scoped) to create a private repo and push.
#
# Requires: git, and the GitHub CLI (`gh`) authenticated (`gh auth login`).
#
# Usage:
#   cd medical-network
#   ./scripts/init-standalone-repo.sh
#
set -euo pipefail

REPO_NAME="medical-network"
VISIBILITY="private"   # change to "public" if desired

# Run from the folder that contains this script's parent (the app root).
cd "$(dirname "$0")/.."

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit: Medical Network starter app"
fi

if command -v gh >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --"$VISIBILITY" --source=. --remote=origin --push
  echo "Done. Repo created and pushed via gh."
else
  echo "GitHub CLI (gh) not found."
  echo "Create an empty '$REPO_NAME' repo on github.com, then run:"
  echo "  git remote add origin https://github.com/<you>/$REPO_NAME.git"
  echo "  git branch -M main"
  echo "  git push -u origin main"
fi
