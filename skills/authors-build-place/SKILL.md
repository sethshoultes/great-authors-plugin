---
name: authors-build-place
description: Build a place entry for the project bible via an interactive interview. Usage - /authors-build-place <name> [--author <author-name>]. Seven questions covering type, sensory signature, one odd detail, meaning to characters, how it changes, contradiction, connections. Optional --author lens (mcphee for architectural history, didion for cultural specificity). Use when you're adding a new location to a long-form project and want author personas to read its bible entry before editing passages set there.
---

# /authors-build-place <name> [--author <author>]

Build a structured place entry in the project bible.

## When to use

- A new location has entered your novel and you want other author personas to know about it.
- You're pre-planning a novel and sketching out key settings.
- A location has been drifting (sensory details shifting across chapters) and you want to nail it down.

Not for: writing scene prose set in this place (use `/authors-channel <author>` or `/authors-draft`); editing an existing passage (use `/authors-edit`).

## Instructions for Claude

1. **Parse arguments:** place name (required) + optional `--author <name>` flag. Valid lenses in v0.5: `mcphee`, `didion`. Others fall back to default.

2. **Verify `.great-authors/` exists.** If not, tell the user to run `/authors-project-init` and stop.

3. **Check for existing place file** at `.great-authors/places/<name>.md`. If exists, ask about overwrite (default no).

4. **Dispatch place-builder** via `Agent` tool:
   - `subagent_type: place-builder`
   - Prompt includes: `Mode: interactive`, `Place name: <name>`, `Author lens: <author>`, `Working directory: <cwd>`.

5. **Relay the interview.** Seven questions, one at a time, user answers pass back verbatim.

6. **Confirm creation:**
   ```
   Created .great-authors/places/<name>.md

   Type: <type>
   Sensory signature: <one-line summary>

   Next: run /authors-channel <author> to draft a scene here, or /authors-build-place for the next location.
   ```

## Notes

- Places are bible metadata. Do not write to the manuscript.
- If the user mentions a character that doesn't exist in `.great-authors/characters/` during the interview (question 7, connections), offer to run `/authors-build-character` next — after finishing this place file.
- If the user says "cancel" or "abort," stop the dispatch and confirm no file was written.
