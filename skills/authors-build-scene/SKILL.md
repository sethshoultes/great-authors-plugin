---
name: authors-build-scene
description: Build a scene entry (beat card) for the project bible via an interactive interview. Usage - /authors-build-scene [<id>] [--author <author-name>]. Optional --author flag channels McPhee (start with scene shape) or Vonnegut (start-close-to-end and glass-of-water want). Use when the user is planning a scene, has a scene that's drifting off-structure, or wants to ensure cross-chapter callbacks don't get lost.
---

# /authors-build-scene [<id>] [--author <author>]

Build a structured scene entry (beat card) in the project bible.

## When to use

- You're planning a scene before drafting and want its shape nailed down.
- A draft scene is meandering and you need to name its turn and exit state.
- You're tracking callbacks across chapters and need a coherent scene index.

Not for: writing the actual scene prose (use `/authors-channel <author>` for that); editing an existing scene (use `/authors-edit`).

## Instructions for Claude

When this skill is invoked:

1. **Parse the arguments:**
   - First positional: scene ID (optional). If missing, ask the user for a short ID they can use to reference this scene (e.g., `ch14-confrontation`, `opening-diner`). Derive a kebab-case ID from their answer.
   - Optional flag: `--author <name>`. Valid values: `hemingway`, `orwell`, `didion`, `mcphee`, `king`, `vonnegut`, `baldwin`, `mccarthy`, `wallace`, `le-guin`. Dedicated lenses ship for `mcphee` and `vonnegut`; others fall back to default with a note.

2. **Verify `.great-authors/` exists.** If not, tell the user to run `/authors-project-init` first and stop.

3. **Check for existing scene file.** If `.great-authors/scenes/<id>.md` exists, ask about overwrite — default no.

4. **Dispatch the scene-builder.** Use the `Agent` tool with:
   - `subagent_type: scene-builder`
   - Prompt includes: `Mode: interactive`, `Scene ID: <id>`, `Author lens: <author>`, `Working directory: <cwd>`.

5. **Relay the interview.** Eight questions, one at a time, user answers pass back to the builder. Do not answer on the user's behalf.

6. **Confirm creation.**
   ```
   Created .great-authors/scenes/<id>.md

   POV: <character name>
   Turn: <one-line turn from the card>

   Callbacks: <any earlier scenes this pays off>
   Sets up: <any later scenes this sets up>

   Next: run /authors-channel <author> to draft this scene, or /authors-build-scene for the next one.
   ```

## Notes

- Scene cards are bible metadata, not manuscript. Do not write to chapter files.
- The scene-builder will reference existing characters and places. If the user mentions a character that doesn't exist in `.great-authors/characters/`, offer to run `/authors-build-character` next (but complete the scene card first).
- If the user says "cancel" or "abort," stop the dispatch and confirm no file was written.
