---
name: authors-build-relationship
description: Build a relationship entry between two existing characters in the project bible. Usage - /authors-build-relationship <character-a> <character-b>. Six questions covering type, power dynamic, history, current conflict, shared vocabulary, secrets and wrong assumptions. Updates the ## Connections section of BOTH character files with reciprocal entries. Both characters must already exist as .great-authors/characters/<name>.md files.
---

# /authors-build-relationship <character-a> <character-b>

Build a relationship entry between two existing characters.

## When to use

- Two characters in your project have a significant relationship and you want it documented in both files.
- You're noticing that a relationship is driving multiple scenes and deserves craft-level attention.
- Before drafting a scene featuring both characters, so the draft respects their established dynamic.

Not for: creating new characters (use `/authors-build-character`); drafting a scene between them (use `/authors-channel <author>` or `/authors-draft`).

## Instructions for Claude

1. **Parse arguments:** both character names required. Lowercase, hyphenated (matching the character file names).

2. **Verify both character files exist:**
   - `.great-authors/characters/<character-a>.md`
   - `.great-authors/characters/<character-b>.md`

   If either is missing, tell the user and offer to run `/authors-build-character` for the missing one first. Do not proceed until both exist.

3. **Verify characters are different.** If `<character-a>` and `<character-b>` are the same, ask the user to pick a different second character.

4. **Check for existing connection** between them in either file's `## Connections` section. If found, ask: extend / replace / cancel. Default extend.

5. **Dispatch relationship-builder** via `Agent` tool:
   - `subagent_type: relationship-builder`
   - Prompt: `Mode: interactive`, `Character A: <name>`, `Character B: <name>`, `Working directory: <cwd>`.

6. **Relay the interview.** Six questions, one at a time.

7. **Confirm update:**
   ```
   Updated .great-authors/characters/<character-a>.md and .great-authors/characters/<character-b>.md

   Type: <type>
   Live tension: <one-line>

   Next: run /authors-channel <author> to draft a scene between them, or /authors-build-relationship for another pair.
   ```

## Notes

- This skill modifies TWO files. Both updates happen or neither does.
- If the user says "cancel" mid-interview, stop and confirm no files were written.
- The reciprocal entries are deliberately asymmetric — each character has their own POV on the relationship.
