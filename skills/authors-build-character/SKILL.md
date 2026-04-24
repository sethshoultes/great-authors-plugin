---
name: authors-build-character
description: Build a character entry for the project bible via an interactive interview. Usage - /authors-build-character <name> [--author <author-name>]. Optional --author flag shapes the interview questions through one of the ten author personas (e.g., --author king adds small-town and pop-culture questions; --author le-guin adds social-position questions). Use when the user is creating a new character for a long-form project and wants a structured bible entry that author personas will read before editing passages with this character.
---

# /authors-build-character <name> [--author <author>]

Build a structured character entry in the project bible.

## When to use

- A new character has entered your novel and you want other author personas to know about them.
- You're pre-planning a novel and sketching out the cast.
- You have a character that's been drifting (eye color changes, accent shifts) and you want to nail them down.

Not for: writing scene prose where this character appears (use `/authors-channel <author>` for that); editing an existing passage (use `/authors-edit`).

## Instructions for Claude

When this skill is invoked:

1. **Parse the arguments:**
   - First positional: character name (required). If missing, ask the user for a name before proceeding.
   - Optional flag: `--author <name>`. Valid values: `hemingway`, `orwell`, `didion`, `mcphee`, `king`, `vonnegut`, `baldwin`, `mccarthy`, `wallace`, `le-guin`. Case-insensitive. If passed, note it for the builder dispatch.

2. **Verify `.great-authors/` exists** in the current working directory. If not, tell the user to run `/authors-project-init` first and stop here.

3. **Check for existing character file.** If `.great-authors/characters/<name>.md` already exists, ask: "A character file for `<name>` already exists. Overwrite? (yes/no)" — default no. If no, exit.

4. **Dispatch the character-builder agent.** Use the `Agent` tool with:
   - `subagent_type: character-builder`
   - Prompt should include:
     - `Mode: interactive`
     - `Character name: <name>`
     - `Author lens: <author>` (if `--author` was passed, else `none`)
     - `Working directory: <cwd>` so the sub-agent can read bible files
     - Instructions to conduct the interview in the user's conversation (i.e., the sub-agent's questions come back to the user via you)

5. **Relay the interview.** The builder will ask questions one at a time. Pass each question through to the user verbatim, pass the user's answers back to the builder verbatim. Do not paraphrase or answer on behalf of the user.

6. **Confirm creation.** After the builder returns, confirm the file was created at `.great-authors/characters/<name>.md` and report back:
   ```
   Created .great-authors/characters/<name>.md

   Referenced by: (list any other character files that now point to this one via the Connections section, if the user chose to add a relationship)

   Next: run /authors-channel <author> and paste a draft passage featuring <name>, or continue with /authors-build-character for the next character.
   ```

## Notes

- This skill is interactive — it's a conversation, not a one-shot command.
- The builder runs in a fresh sub-agent context per the `Agent` tool semantics; it does not inherit your conversation history. Pass all necessary context in the dispatch prompt.
- If the user says "cancel" or "abort" at any point during the interview, stop the dispatch and confirm with them that no file was written.
- Do not write to the manuscript itself — builders only write to `.great-authors/characters/`.
