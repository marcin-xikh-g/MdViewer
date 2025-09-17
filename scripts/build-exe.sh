#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_dir="$repo_root/backend"

if [[ ! -d "$backend_dir" ]]; then
  echo "Backend directory not found at '$backend_dir'." >&2
  exit 1
fi

echo "Running: npm run build:exe inside $backend_dir"
(
  cd "$backend_dir"
  npm run build:exe
)
