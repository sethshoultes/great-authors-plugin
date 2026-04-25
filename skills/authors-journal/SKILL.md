---
name: authors-journal
description: Capture a session journal entry in the project bible. Usage - /authors-journal. Writes .great-authors/journal/YYYY-MM-DD.md with what was worked on, decisions made, what's unresolved, and where the user left off. Use at the end of a writing session so the next session's author personas know what's in flux vs. settled. If an entry already exists for today, offers to append rather than overwrite.
---

# /authors-journal

Capture a session journal entry.

## When to use

- At the end of a writing session, to lock in what happened before context rots.
- When you made a meaningful decision (character backstory changed, timeline shifted, scene reordered) and want future author personas to know.
- When you're stopping mid-chapter and want to remember where you left off.

Not for: daily life journaling. This is a project bible artifact, not a personal diary.

## Instructions for Claude

When this skill is invoked:

1. **Verify `.great-authors/` exists** in the current working directory. If not, tell the user to run `/authors-project-init` first and stop.

2. **Ensure `.great-authors/journal/` exists.** Create it if missing (`mkdir -p`). If the user's bible predates journal support, this is the first-use case.

3. **Determine today's date.** Use the format `YYYY-MM-DD` (local time).

4. **Check for an existing entry at `.great-authors/journal/YYYY-MM-DD.md`.** If it exists, ask: "A journal entry already exists for today. Append to it, or start a new section? (append/new/cancel)" — default append. If cancel, exit.

5. **Interview the user** with seven questions, one at a time. The structured fields support `/authors-consolidate`, which scans journal entries for repeated decisions and offers to promote them to the permanent bible.

   a. **Worked on** — which chapter, scene, or section did you work on today? One line.
   b. **Decisions made** — list any choices that affect the project going forward (character detail confirmed, timeline shifted, scene cut or moved, voice rule adjusted). Up to 3-5 bullets. "None" is a valid answer.
   c. **Characters introduced** — any new on-page characters today, or significant new detail about an existing character? Up to 3 bullets. "None" is valid.
   d. **Plants laid** — any audience-vs-character knowledge plants this session (foreshadowing, withheld information, a detail the audience now knows that the protagonist does not)? Up to 3 bullets. "None" is valid.
   e. **Plants paid off** — any earlier plants that paid off in today's work? Up to 3 bullets. "None" is valid.
   f. **Continuity flags** — anything you noticed that may contradict the bible or earlier chapters and that you want a future continuity pass to look at? Up to 3 bullets. "None" is valid.
   g. **Unresolved** — what's in flux? Questions you haven't answered, threads you haven't followed, character motivations you're still deciding. Up to 3 bullets.
   h. **Where you left off** — one sentence. Literal — what's the very next thing to work on when you return.

6. **Write the entry.** Format:

   ```markdown
   # YYYY-MM-DD

   ## Worked on
   <answer from question a>

   ## Decisions made
   - <bullet>
   - <bullet>
   <...or "None."...>

   ## Characters introduced
   - <bullet>
   <...or "None."...>

   ## Plants laid
   - <bullet>
   <...or "None."...>

   ## Plants paid off
   - <bullet>
   <...or "None."...>

   ## Continuity flags
   - <bullet>
   <...or "None."...>

   ## Unresolved
   - <bullet>
   <...or "Nothing new today."...>

   ## Next session
   <answer from question h>
   ```

7. **If appending,** add a new section `## Session N` (increment from existing session count) above the standard sections, or re-open the most recent session's content for append. Default to adding a new `## Session 2` style header so each session remains distinct.

8. **Confirm:**
   ```
   Wrote .great-authors/journal/YYYY-MM-DD.md

   Next session: <the "where you left off" line>

   When you resume, any author persona you invoke will read this entry first to reorient.
   ```

## Notes

- Keep entries short. A journal entry that requires 20 minutes to write will never get written. The seven structured questions can be answered in 5 minutes if the user is brisk.
- If the user pastes a long narrative answer, keep the spirit but trim to a sentence per field.
- Do not editorialize. Record what the user says, not what you think they should have decided.
- Journal entries are read by personas via the `## Before you edit` protocol. Be concise — personas only read the most recent entry.
- The structured fields (Plants laid / Plants paid off / Continuity flags) feed `/authors-consolidate`, which periodically scans journals for recurring decisions and offers to promote them to the permanent bible. Free-form journal entries don't support consolidation as well; the structure is what makes the long-arc accounting tractable.
