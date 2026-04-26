# Recommended Hooks (`.claude/settings.json`)

This file documents OPTIONAL hooks for projects using great-authors. Hooks live in `.claude/settings.json` at the project root — NOT in `.great-authors/`. They are project-specific, not bible content.

The hooks below catch drift early. None are required; all are recommended for projects that have moved past first-draft skeleton into expansion or beta-reader prep.

## Recommended hooks

### Continuity check after manuscript saves

Run `/authors-continuity` automatically when a chapter file is saved. Catches drift in real time rather than waiting for an explicit audit pass.

```json
{
  "hooks": {
    "PostToolUse": {
      "Write|Edit": [
        {
          "matcher": "manuscript/.*\\.md$",
          "command": "echo 'Manuscript file changed. Consider /authors-continuity <file> before next session.' >&2"
        }
      ]
    }
  }
}
```

(The above is a *reminder* hook — it does not auto-run continuity. Continuity is expensive enough that auto-running on every save would be wasteful. The reminder catches you before you forget.)

### Voice-lints check before commit

If `voice-lints.md` has patterns specified (forbidden words, dialogue tags, punctuation rules), run a pattern scan on changed manuscript files before commit. Refuses commits that introduce new violations.

```json
{
  "hooks": {
    "PreCommit": [
      {
        "command": "scripts/lint-voice.sh"
      }
    ]
  }
}
```

Where `scripts/lint-voice.sh` reads `.great-authors/voice-lints.md` and greps the changed manuscript files for the forbidden patterns. Sample script:

```bash
#!/usr/bin/env bash
# scripts/lint-voice.sh
set -euo pipefail
VIOLATIONS=$(rg --no-heading -n -f .great-authors/voice-lints.patterns manuscript/ 2>/dev/null || true)
if [ -n "$VIOLATIONS" ]; then
  echo "Voice-lint violations:" >&2
  echo "$VIOLATIONS" >&2
  echo "" >&2
  echo "Cut them or run /authors-rewrite on the affected chapter." >&2
  exit 1
fi
exit 0
```

(Requires extracting the regex patterns from `voice-lints.md` into a separate `voice-lints.patterns` file the script reads. The plugin's voice-lints template documents pattern syntax.)

### Journal reminder at session end

Remind the user to run `/authors-journal` before closing the session if they've made changes to any manuscript or bible file.

```json
{
  "hooks": {
    "Stop": [
      {
        "command": "git diff --quiet HEAD -- .great-authors/ manuscript/ || echo 'Run /authors-journal before exiting to capture this session.' >&2"
      }
    ]
  }
}
```

## What NOT to put in hooks

- **Auto-rewrites.** Hooks should never modify prose without explicit user approval. The orchestrator pattern requires checkpoints; hooks that rewrite would bypass them.
- **Auto-commits.** Hooks should never commit on behalf of the user. Commits are decisions, not events.
- **Anything that runs a sub-agent dispatch.** Sub-agent dispatches cost token budget and should be deliberate. A hook that runs `/authors-rewrite` on every save would burn budget without consent.

The principle: hooks **surface signal**, they don't **act on it**. Acting is the orchestrator's job. The user is the orchestrator's checkpoint.

## Hooks for the plugin maintainer (not project-side)

If you are working on the great-authors-plugin itself, the plugin's own hook recommendations live at the plugin repo root, not here. This file is for projects USING the plugin, not for the plugin's own development.
