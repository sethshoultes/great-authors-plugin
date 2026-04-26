#!/usr/bin/env bash
# Plugin smoke tests. Catches the regressions that matter — frontmatter,
# skill-to-tool alignment, version coherence. See tests/README.md.

set -uo pipefail

cd "$(dirname "$0")/.."

ERRORS=0
red() { printf '\033[31m%s\033[0m\n' "$1" >&2; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[33m%s\033[0m\n' "$1"; }

# ---------- 1. Frontmatter validity ----------

echo "Checking SKILL.md frontmatter..."
for f in skills/*/SKILL.md; do
  if [ ! -f "$f" ]; then continue; fi
  if ! head -1 "$f" | grep -q '^---$'; then
    red "  FAIL: $f does not start with YAML frontmatter delimiter"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  if ! awk '/^---$/{c++} c==1 && /^name: /{found=1} END{exit !found}' "$f"; then
    red "  FAIL: $f frontmatter is missing 'name:' field"
    ERRORS=$((ERRORS + 1))
  fi
  if ! awk '/^---$/{c++} c==1 && /^description: /{found=1} END{exit !found}' "$f"; then
    red "  FAIL: $f frontmatter is missing 'description:' field"
    ERRORS=$((ERRORS + 1))
  fi
done

echo "Checking persona frontmatter..."
for f in agents/*-persona.md agents/*-builder.md; do
  if [ ! -f "$f" ]; then continue; fi
  if ! head -1 "$f" | grep -q '^---$'; then
    red "  FAIL: $f does not start with YAML frontmatter delimiter"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  if ! awk '/^---$/{c++} c==1 && /^name: /{found=1} END{exit !found}' "$f"; then
    red "  FAIL: $f frontmatter is missing 'name:' field"
    ERRORS=$((ERRORS + 1))
  fi
  if ! awk '/^---$/{c++} c==1 && /^description: /{found=1} END{exit !found}' "$f"; then
    red "  FAIL: $f frontmatter is missing 'description:' field"
    ERRORS=$((ERRORS + 1))
  fi
done

# ---------- 2. Persona file count alignment ----------

echo "Checking DXT bundled personas match agents/..."
AGENTS_COUNT=$(ls agents/*.md 2>/dev/null | wc -l | tr -d ' ')
DXT_COUNT=$(ls distribution/dxt/server/personas/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$AGENTS_COUNT" != "$DXT_COUNT" ]; then
  red "  FAIL: agents/ has $AGENTS_COUNT files but distribution/dxt/server/personas/ has $DXT_COUNT"
  red "        Run: cp agents/*.md distribution/dxt/server/personas/"
  ERRORS=$((ERRORS + 1))
fi

# ---------- 3. Version coherence ----------

echo "Checking version coherence..."
PKG_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
PLUGIN_VERSION=$(grep '"version"' .claude-plugin/plugin.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
DXT_PKG_VERSION=$(grep '"version"' distribution/dxt/package.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
DXT_MANIFEST_VERSION=$(grep '"version"' distribution/dxt/manifest.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')

if [ "$PKG_VERSION" != "$PLUGIN_VERSION" ] || \
   [ "$PKG_VERSION" != "$DXT_PKG_VERSION" ] || \
   [ "$PKG_VERSION" != "$DXT_MANIFEST_VERSION" ]; then
  red "  FAIL: version drift across config files:"
  red "        package.json:                       $PKG_VERSION"
  red "        .claude-plugin/plugin.json:         $PLUGIN_VERSION"
  red "        distribution/dxt/package.json:      $DXT_PKG_VERSION"
  red "        distribution/dxt/manifest.json:     $DXT_MANIFEST_VERSION"
  ERRORS=$((ERRORS + 1))
fi

# ---------- 4. DXT tool definition / handler alignment ----------

echo "Checking DXT tool definitions vs handlers..."
TOOL_NAMES=$(grep -oE 'name: "[a-z_]+"' distribution/dxt/server/index.js | sed 's/name: "\(.*\)"/\1/' | sort -u)
HANDLER_NAMES=$(grep -oE 'name === "[a-z_]+"' distribution/dxt/server/index.js | sed 's/name === "\(.*\)"/\1/' | sort -u)

MISSING_HANDLERS=$(comm -23 <(echo "$TOOL_NAMES") <(echo "$HANDLER_NAMES"))
MISSING_DEFS=$(comm -13 <(echo "$TOOL_NAMES") <(echo "$HANDLER_NAMES"))

if [ -n "$MISSING_HANDLERS" ]; then
  red "  FAIL: tool defined in DXT manifest but no handler:"
  echo "$MISSING_HANDLERS" | sed 's/^/        /' >&2
  ERRORS=$((ERRORS + 1))
fi
if [ -n "$MISSING_DEFS" ]; then
  red "  FAIL: handler in DXT but no tool definition:"
  echo "$MISSING_DEFS" | sed 's/^/        /' >&2
  ERRORS=$((ERRORS + 1))
fi

# ---------- 5. v1.5+ project-bible scaffold checks (trilogy improvement #5) ----------

echo "Checking v1.5+ project-bible scaffold completeness..."
PKG_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')

# v1.5 introduced visual-lints.md template + ## Visual section in project.md
if [ "$PKG_VERSION" \> "1.4" ] || [ "$PKG_VERSION" = "1.5.0" ] || [ "$PKG_VERSION" \> "1.5.0" ]; then
  VISUAL_LINTS_TEMPLATE="templates/project-bible/visual-lints.md"
  if [ ! -f "$VISUAL_LINTS_TEMPLATE" ]; then
    red "  FAIL: v1.5+ requires $VISUAL_LINTS_TEMPLATE (trilogy improvement #3)"
    ERRORS=$((ERRORS + 1))
  fi

  PROJECT_TEMPLATE="templates/project-bible/project.md"
  if [ -f "$PROJECT_TEMPLATE" ]; then
    if ! grep -q '^## Visual$' "$PROJECT_TEMPLATE"; then
      red "  FAIL: v1.5+ requires '## Visual' section in $PROJECT_TEMPLATE (trilogy improvement #4)"
      ERRORS=$((ERRORS + 1))
    fi
  fi
fi

# ---------- Summary ----------

echo ""
if [ "$ERRORS" -eq 0 ]; then
  green "✓ All smoke tests passed."
  exit 0
else
  red "✗ $ERRORS check(s) failed."
  exit 1
fi
