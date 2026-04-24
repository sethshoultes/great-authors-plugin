#!/usr/bin/env bash
# Sync agent files from root agents/ into distribution/dxt/server/personas/.
# Root is the source of truth. Run after editing any agent.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/agents"
DXT="$ROOT/distribution/dxt/server/personas"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source dir not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DXT"

echo "Syncing agents from $SRC"
echo "  → $DXT"

# Clear stale files in the target, then copy fresh.
find "$DXT" -maxdepth 1 -name "*.md" -delete

cp "$SRC"/*.md "$DXT/"

count=$(find "$SRC" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
dxt_count=$(find "$DXT" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')

echo "Synced $count agents."

if [[ "$count" != "$dxt_count" ]]; then
  echo "ERROR: count mismatch — source=$count dxt=$dxt_count" >&2
  exit 1
fi

echo "Done. Commit with:"
echo "  git add agents distribution/dxt/server/personas && git commit -m 'sync: agents to DXT bundle'"
