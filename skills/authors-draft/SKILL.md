---
name: authors-draft
description: Draft new prose in a named author's voice from a brief. Usage - /authors-draft <brief> <author> [--to <path>]. Loads the author persona, writes prose in that voice, and saves the output to manuscript/<current>.md by default (or --to override). When new characters, places, or scenes appear in the draft, automatically dispatches the appropriate builder (character-builder, scene-builder) in Mode B to add them to the project bible. Use when you want a first-draft pass in a specific voice - prose lands on disk immediately, not stranded in chat.
---

# /authors-draft <brief> <author>

Voice-takeover drafting with auto-sketched bible entries.

## When to use

- You have a scene brief or chapter outline and want a first-draft pass in a specific author's voice.
- You want to generate prose that respects your project bible (voice rules, character details, established world).
- You're comfortable with AI-drafted prose as a *starting point* for your own revision — you'll rewrite extensively, but a scaffolded draft is faster than a blank page.

Not for: final-copy writing (this is draft material, not publication-ready); direct editing of existing prose (use `/authors-edit`); collaborative in-voice conversation (use `/authors-channel`).

## The warning this skill carries

Drafting in an author's voice is the slippery slope from "tool for writers" to "AI ghostwriter." This skill stays on the useful side of that line only if the user keeps revising. Aggressive disclaimer at the start of every draft. If the user starts using drafts as final copy, that's on them — but the skill nudges them toward revision.

## Instructions for Claude

When this skill is invoked with a brief and an author name:

1. **Parse arguments:**
   - `<brief>` (required, string). Can be long — a scene outline, a chapter summary, a character moment to render.
   - `<author>` (required). One of the ten personas. Short forms accepted (`papa`, `dfw`, `leguin`).
   - `--to <path>` (optional). If present, saves the draft to that exact path. Otherwise, the default path is computed from `.great-authors/project.md`'s `## Manuscript` section: `<project root>/manuscript/<Current>`.

   If the argument order is ambiguous, ask the user to clarify.

2. **Verify the author persona file exists:**

   ```bash
   test -f agents/<author>-persona.md
   ```

   If not, list the ten valid names and ask.

3. **Load the author persona.** Read `<plugin-install-path>/agents/<author>-persona.md`, strip frontmatter, and internalize the persona body.

4. **Read the project bible** if `.great-authors/` exists in the current working directory:
   - `project.md` — for genre, POV, tense, register.
   - `voice.md` — for project-specific voice rules (these override author defaults per each persona's `## Before you edit` protocol).
   - The most recent journal entry (if any).
   - All `characters/*.md` and `places/*.md` — you'll need these for reference during drafting.
   - `timeline.md`, `glossary.md`, `scenes/*.md` — reference as needed.

5. **Resolve the target save path:**
   a. If `--to <path>` was passed, use that.
   b. Else, read the `## Manuscript` section of `.great-authors/project.md`. Extract the `Current:` field — that's the filename.
   c. Compute the full path: `<cwd>/manuscript/<current>`.
   d. If `.great-authors/project.md` has no `## Manuscript` section or the `Current:` field is empty, ask the user: "Where should I save this draft? (default: `manuscript/chapter-01.md`)" — use their answer or the default. Write the answer back to `project.md`'s `## Manuscript > Current:` field for next time.
   e. If `manuscript/` doesn't exist, create it.
   f. **Check the target file:**
      - If the file doesn't exist: write will create it. Proceed.
      - If the file exists but is empty: write will overwrite (no data loss). Proceed.
      - If the file exists and has content: ask the user: "`<path>` already contains <N> words. Options: append / overwrite / save-as-next-chapter / cancel. (Default: append.)"
        - `append`: add a `---` separator and the new prose at the end.
        - `overwrite`: replace the file's contents.
        - `save-as-next-chapter`: compute the next chapter filename (e.g., `chapter-01.md` → `chapter-02.md`), save there, and update `project.md`'s `Current:` field.
        - `cancel`: abort the draft.

6. **Announce the draft mode:**

   ```
   Drafting in <Author's Display Name>'s voice.
   Saving to: <resolved-target-path> (<append|create|overwrite>)

   Reminder: this is draft material, not final copy. Revise aggressively. The author you're channeling would tell you the same thing.

   Brief: <brief, echoed>
   ```

7. **Write the draft AND save it.** Generate the prose in the author's voice. **Save to the resolved target path BEFORE returning the prose to the chat output.** Order matters — the file is the artifact; the chat is the secondary display.

   Write natural prose paragraphs. No headers, no commentary — just the prose.

   If appending, use this format:

   ```
   ---

   <new prose>
   ```

   So that appended sessions are visually separable.

8. **Mid-draft Mode B dispatches.** After writing each paragraph or scene beat, check: has a new entity appeared that isn't in the bible yet?

   - **New character name?** If a person is referred to by name and `.great-authors/characters/<name-slug>.md` doesn't exist, dispatch `character-builder` in Mode B:
     - `subagent_type: character-builder`
     - Prompt includes: `Mode: autonomous`, the recent paragraph(s) as context, instruction to write a minimal profile and return a one-line summary.
     - Note the auto-generation in a brief aside to the user: "(Sketched Marcus into `.great-authors/characters/marcus.md` — review later.)"
   - **New place?** Similar — dispatch place-builder if it exists (not yet shipped in v0.4 — skip silently if not installed).
   - **New scene structure?** Optional — if the draft is scene-shaped and the user hasn't built the scene card yet, dispatch scene-builder in Mode B with the drafted scene text as context.

   **Do not pause drafting for human input during these Mode B dispatches.** They're autonomous — fire and forget. The human reviews the auto-generated bible entries after the draft session.

9. **Continue drafting** until the brief is satisfied or the user says stop.

10. **End with a footer:**

    ```
    ---
    Draft complete. <N> paragraphs, approximately <N> words.
    Saved to: <resolved-target-path>

    Bible entries auto-generated this session:
    - characters/<name>.md (Marcus)
    - (etc.)

    Recommended next steps:
    - Open <resolved-target-path> and revise. Aggressively.
    - Review the auto-generated bible entries and fill in gaps.
    - Run /authors-edit on the revised draft for a second pass.
    - Capture decisions in /authors-journal before you close the session.
    ```

## Notes

- Drafts are written to `manuscript/<current>` on disk FIRST, then displayed in chat. The user can open the file directly in an editor after the draft completes.
- The author's constraint "never reproduce my actual published work" still applies — generate original prose in the voice, not pastiches of real books.
- If the user's brief is under-specified (one or two sentences), ask for more before drafting. A better brief produces a better draft.
- If the user requests a draft longer than ~2,000 words, break it into sections and pause for feedback between sections.
- The auto-generated bible entries from Mode B are intentionally minimal. They're hooks, not finished profiles. The user can flesh them out with `/authors-build-character` or `/authors-build-scene` later.

## Respecting project rules

If `voice.md` establishes a rule that conflicts with the author's defaults (e.g., "no adverbs ending in -ly" when the author normally allows them, or "quotation marks for dialogue" when the author prefers none), honor the project's rule. The author persona's `## Before you edit` protocol already codifies this — apply the same discipline when drafting.
