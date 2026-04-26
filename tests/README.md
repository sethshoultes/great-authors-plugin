# Plugin Tests

Smoke-level tests that catch the most common regressions in plugin source.

## What's tested

- **Frontmatter validity** — every `SKILL.md` and every `*-persona.md` has well-formed YAML frontmatter with required fields (`name`, `description`).
- **Skill-to-tool alignment** — every skill in `skills/` has a matching entry in `.claude-plugin/plugin.json` (or is documented as a Claude Code-only skill not bundled in DXT).
- **DXT manifest alignment** — every tool in `distribution/dxt/manifest.json`'s `tools` array has a matching `if (name === ...)` handler in `distribution/dxt/server/index.js`.
- **Persona file count** — `agents/` and `distribution/dxt/server/personas/` have the same persona files (no DXT drift).
- **Version coherence** — `package.json`, `.claude-plugin/plugin.json`, `distribution/dxt/package.json`, and `distribution/dxt/manifest.json` all carry the same version string.

## What's NOT tested

- The actual content of skills (correctness of orchestration logic — too subjective for automated testing).
- The personas' voice (also subjective).
- Real Claude Code or DXT runtime behavior (would require a live MCP harness).

## Run

```bash
./tests/smoke.sh
```

Exit code:
- 0 — all checks pass
- 1 — one or more checks failed (specifics in stderr)

## When to run

- Before tagging a release.
- After any change to skill structure, persona structure, or DXT server.
- As part of a CI hook (suggested but not required).

## Adding a new test

The test script is intentionally simple shell. Add new check sections following the existing pattern:

```bash
echo "Checking <thing>..."
# logic that returns nonzero on failure
ERRORS=$((ERRORS + $?))
```

End-of-script reports total errors and exits with that count.

## Why shell, not pytest/jest

The plugin is a markdown-and-JSON repository. There is no application code to drive a real test framework against. Shell is enough to catch the regressions worth catching here. If the plugin grows to include actual JavaScript or TypeScript code beyond the DXT server, switch to a real test framework at that time.
