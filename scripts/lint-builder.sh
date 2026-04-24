#!/usr/bin/env bash
# lint-builder.sh <path-to-builder-agent-file>
#
# Verifies a builder agent file has the required structure:
# - YAML frontmatter with name, description, model, color
# - Mode A (interactive) section
# - Mode B (autonomous) section
# - Interview methodology section
# - Before-you-begin protocol section
# - Output format section
#
# Exit codes: 0 = pass, 1 = fail

set -euo pipefail

file="${1:-}"
if [[ -z "$file" ]]; then
  echo "usage: $0 <builder-file>" >&2
  exit 1
fi

if [[ ! -f "$file" ]]; then
  echo "FAIL: file does not exist: $file" >&2
  exit 1
fi

errors=0

check_contains() {
  local pattern="$1"
  local label="$2"
  if ! grep -qE "$pattern" "$file"; then
    echo "FAIL: missing $label" >&2
    errors=$((errors + 1))
  fi
}

check_frontmatter_field() {
  local field="$1"
  if ! head -30 "$file" | grep -qE "^${field}: "; then
    echo "FAIL: missing frontmatter field: $field" >&2
    errors=$((errors + 1))
  fi
}

if ! head -1 "$file" | grep -qE '^---$'; then
  echo "FAIL: file does not start with YAML frontmatter" >&2
  errors=$((errors + 1))
fi

check_frontmatter_field "name"
check_frontmatter_field "description"
check_frontmatter_field "model"
check_frontmatter_field "color"

check_contains "^## Mode A" "Mode A (interactive) section"
check_contains "^## Mode B" "Mode B (autonomous) section"
check_contains "^## Interview" "Interview methodology section"
check_contains "^## Before you begin" "Before you begin protocol"
check_contains "^## Output format" "Output format section"

if [[ $errors -gt 0 ]]; then
  echo "FAIL: $errors validation error(s) in $file" >&2
  exit 1
fi

echo "PASS: $file"
