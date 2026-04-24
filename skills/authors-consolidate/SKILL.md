---
name: authors-consolidate
description: Scan journal entries and offer to promote repeated decisions into the permanent bible. Usage - /authors-consolidate. Reads .great-authors/journal/* and identifies decisions that appear in multiple entries; for each, proposes which bible file to promote to (project.md, voice.md, a character file, etc.). Every promotion requires user confirmation. Use periodically - after 5+ sessions - to keep the bible current without losing fidelity to in-flux ideas.
---

# /authors-consolidate

Promote recurring journal decisions to the permanent bible.

## When to use

- You've been journaling for several sessions and want to move settled decisions out of the journal and into the appropriate bible file.
- Something that started as "tentative" in a journal entry has now survived 3+ sessions — it deserves a permanent home.

Not for: initial bible setup (use `/authors-project-init`); one-off session capture (use `/authors-journal`).

## Instructions for Claude

When this skill is invoked:

1. **Verify `.great-authors/journal/` exists** and contains at least 3 entries. If fewer than 3, tell the user there's not enough journal history to consolidate yet and stop.

2. **Read all journal entries** in `.great-authors/journal/*.md`, sorted by date.

3. **Extract "Decisions made" bullets** across all entries. Group similar decisions (e.g., multiple entries mentioning "Marcus's age is 42" or "shifted opening to present tense"). A "recurring" decision appears in 2+ entries OR is clearly a ratification of an earlier decision.

4. **For each recurring decision, propose a promotion:**
   - Character-related → `.great-authors/characters/<name>.md`
   - Voice/rule related → `.great-authors/voice.md`
   - Timeline related → `.great-authors/timeline.md`
   - Premise/POV/tense related → `.great-authors/project.md`
   - Invented term / brand → `.great-authors/glossary.md`

5. **Ask for each promotion individually:**

   > "Promote this decision to `<target-file>`?
   > 
   > **Decision:** <one-line summary>
   > **Source:** appears in <N> journal entries (first: <date>)
   > **Target:** <file path>
   > **Proposed edit:** <one-line description of what gets added or changed>
   > 
   > (yes/no/edit first)"

6. **If user says yes,** apply the edit. If "edit first," let the user revise the proposed edit before applying.

7. **After all promotions processed,** offer to add a consolidation note at the top of the journal:

   > "Add a consolidation marker to `<most-recent-journal-entry>` showing what was promoted? (yes/no)"

   If yes, append a section at the top of the most recent entry:
   ```
   ## Consolidated on YYYY-MM-DD
   - Promoted to characters/marcus.md: Marcus's age (42)
   - Promoted to voice.md: no interiority in italics
   - (etc.)
   ```

8. **Final report:**
   ```
   Consolidation complete.
   Promoted N decisions across M bible files.

   The journal remains intact — promotions are additive, not destructive.
   ```

## Notes

- Never delete journal entries. Consolidation is additive.
- If a user flags a proposal as wrong ("that's not settled, it's still in flux"), skip the promotion and move to the next.
- Never promote a decision that appears in only one journal entry unless the user explicitly overrides.
- This skill is a dialog, not a batch job. Expect it to take several minutes.
