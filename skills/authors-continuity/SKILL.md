---
name: authors-continuity
description: Check a draft for continuity violations against the project bible. Usage - /authors-continuity <file> [author]. Reads the draft and every bible file; fans out to 1-2 authors; returns flagged inconsistencies - character detail drift (eye color changes, age contradictions), timeline contradictions, voice rule violations, invented-term misuse. Use before sharing a chapter with beta readers or merging it into the main manuscript.
---

# /authors-continuity <file> [author]

Audit a draft for continuity violations against the bible.

## When to use

- Before sharing a chapter with beta readers — catch the drifts you missed.
- After a long break from a project, when your own memory of the bible is fuzzy.
- When two chapters disagree and you can't tell which one is wrong.

Not for: generic editorial feedback (use `/authors-edit`); craft gut-check (use `/authors-critique`).

## Instructions for Claude

When this skill is invoked:

1. **Parse arguments:**
   - First positional: file path (required). If missing, ask for a file.
   - Optional: author name. If not provided, pick based on the project's genre (from `project.md`): fiction → King; nonfiction → McPhee; essay → Didion; speculative → Le Guin; literary/mythic → McCarthy. Default if ambiguous: King.

2. **Verify file exists** and `.great-authors/` exists in its parent directory. If no bible, tell the user `/authors-continuity` requires a project bible — run `/authors-project-init` first.

3. **Dispatch the selected author** via the `Agent` tool:
   - `subagent_type: <author>-persona`
   - Prompt:
     ```
     CONTINUITY AUDIT MODE.

     The draft to audit is below. Your job is NOT to edit for craft; it's to catch continuity violations against the project bible.

     Read these first:
     - .great-authors/project.md
     - .great-authors/voice.md
     - .great-authors/characters/*.md (all character files)
     - .great-authors/places/*.md (all place files)
     - .great-authors/timeline.md
     - .great-authors/glossary.md
     - .great-authors/scenes/*.md (prior scene cards)
     - The most recent entry in .great-authors/journal/ (if any)

     Then read the draft and identify:
     - CHARACTER DRIFT: any detail about a character that contradicts their bible entry (physical, voice, backstory, relationship).
     - TIMELINE CONTRADICTION: events placed in sequences that conflict with timeline.md.
     - VOICE RULE VIOLATION: the draft breaks rules in voice.md (or establishes a new voice rule not yet in the bible).
     - GLOSSARY MISUSE: an invented term used differently from its glossary definition.
     - SCENE CONTRADICTION: the draft establishes something that contradicts a prior scene card.

     Output format:
     - **Violations found:** N
     - For each violation, one entry:
       - **Type:** <CHARACTER DRIFT | TIMELINE | VOICE | GLOSSARY | SCENE>
       - **Draft says:** "<quote from the draft>"
       - **Bible says:** "<quote from the relevant bible file>" (or path reference)
       - **Severity:** high (breaks plot or established fact) / low (probably a minor drift)

     If no violations, say so in one sentence: "No continuity violations found — the draft is consistent with the bible."

     Draft to audit:
     <full file contents>
     ```

4. **Consolidate.** If one author was dispatched, pass through their output with a top-line summary. If two were dispatched (user passed two authors or you auto-picked two for a mixed-genre piece), merge and dedupe the violation list.

5. **Output format:**

   ```markdown
   # /authors-continuity on <filename>

   **Auditor:** <author name>
   **Violations found:** N
   **Highest severity:** <high/low>

   ## Violations

   ### 1. <type>: <one-line summary>
   - **Draft says:** "<quote>"
   - **Bible says:** "<quote>" (`<bible-file>`)
   - **Severity:** <high/low>

   ### 2. ...

   ## Next step

   (One sentence — which violation to fix first, and whether a journal entry or bible edit is needed to resolve it.)
   ```

6. **Output to stdout.** Do not modify the manuscript.

## Notes

- The sub-agent will read MANY bible files. This is intentional — continuity demands full context.
- If the bible is sparse (few characters, no scenes yet), the audit will be quick and likely clean.
- If the draft establishes something not in the bible at all (a new character, a new invented term), flag it as "CANDIDATE BIBLE ADDITION" not as a violation. Offer to run `/authors-build-character` or similar.
- Fan-out is unusual here — most runs will use one auditor. Multiple only if the user explicitly passes two authors.
