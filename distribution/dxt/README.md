# Great Authors — DXT (Claude Desktop Extension)

Local MCP server that exposes the great-authors personas and workflows as tools for Claude Desktop.

## Architecture

The server returns structured *prompts*, not LLM output. Claude Desktop runs the persona reasoning inside its own inference using your subscription — no API key, no hosting, no per-request cost. Filesystem operations (reading the bible, writing to manuscript files) are handled by Claude Desktop's built-in filesystem access; the MCP server only supplies prompts.

## Build

```bash
cd distribution/dxt
npm install
npx @anthropic-ai/dxt pack
```

Produces `great-authors.dxt`. Double-click to install in Claude Desktop.

## Tools (14)

| Tool | Purpose |
|------|---------|
| `list_authors` | List the 10 personas + 4 tool personas. |
| `authors_channel` | Load a named author persona. |
| `authors_draft` | Draft prose in an author's voice + save to a manuscript file. |
| `authors_edit` | Multi-author marked-up edit. |
| `authors_critique` | Fast 3-bullet verdicts in parallel. |
| `authors_debate` | 2-round craft dispute between two authors. |
| `authors_continuity` | Audit a draft against the bible. |
| `authors_project_init` | Scaffold `.great-authors/` + `manuscript/`. |
| `authors_build_character` | Interview-based character bible entry. |
| `authors_build_scene` | Interview-based scene beat card. |
| `authors_build_place` | Interview-based place bible entry. |
| `authors_build_relationship` | Interview + update two character files. |
| `authors_journal` | Session journal entry. |
| `authors_consolidate` | Promote recurring decisions to the bible. |

## Filesystem access

For tools that read or write files (`authors_draft`, `authors_project_init`, the builders, `authors_journal`, `authors_consolidate`, `authors_continuity`), Claude Desktop must have filesystem access to the user's project directory. Configure this via Claude Desktop's "Allowed Folders" setting.

If filesystem access isn't configured, the tools still return useful prompts — the user will simply be asked to read/paste content manually or copy outputs back by hand.

## Team distribution

Drop `great-authors.dxt` in a shared Drive / S3 / internal site. Teammates download once, double-click. Updates = new file + re-install.

## Sync from source

Persona files in `server/personas/` are copies of the root `agents/` directory. Keep them in sync with:

```bash
../sync-distribution.sh
```

Run this after editing any agent file.
