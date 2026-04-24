# Great Authors — Distribution formats

The plugin ships in two formats:

| Format | Install target | Best for | Source |
|--------|----------------|----------|--------|
| **`great-authors`** (Claude Code plugin) | Claude Code | Terminal users who want the full slash command experience | repo root |
| **`great-authors-dxt`** (Claude Desktop) | Claude Desktop app | Non-terminal users; one-click install | `./dxt/` |

Both ship the same 10 author personas and 4 tool personas. The DXT has 14 tools corresponding to the 13 Claude Code slash commands plus `list_authors`.

## Install

**Claude Code:**
```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

**Claude Desktop:**
```bash
cd distribution/dxt
npm install
npx @anthropic-ai/dxt pack
```

Share the generated `great-authors.dxt` — teammates double-click to install.

## Sync between formats

The Claude Code plugin is the source of truth. The DXT bundles a COPY of `agents/*.md`. Keep them in sync with:

```bash
./sync-distribution.sh
```

Run after any agent edit.
