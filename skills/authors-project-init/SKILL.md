---
name: authors-project-init
description: Initialize the per-project memory bible (.great-authors/) in the current working directory. Creates project.md, voice.md, timeline.md, glossary.md, and empty characters/, places/, scenes/ directories. Use when the user is starting a new writing project (novel, essay collection, long-form nonfiction) and wants author personas to have persistent context across sessions.
---

# /authors-project-init

Initialize the per-project memory bible for a writing project.

## What this does

Creates two sibling directories in the current working directory:

**1. `.great-authors/`** — the project bible (metadata every author persona reads before editing):
```
.great-authors/
├── project.md      # genre, voice, premise, POV, tense, manuscript config
├── voice.md        # voice rules for this project
├── timeline.md     # chronology
├── glossary.md     # invented terms, brands, dialect
├── characters/     # one file per character
├── places/         # one file per place
├── scenes/         # one file per scene or beat card
└── journal/        # dated session entries (YYYY-MM-DD.md)
```

**2. `manuscript/`** — the actual writing (where `/authors-draft` and `/authors-channel` save generated prose):
```
manuscript/
└── <starting-chapter>.md   # empty to start, filled as you write
```

## When to use

- Starting a new novel, essay collection, book-length nonfiction, or newsletter.
- Any writing project where you want author personas to have persistent context across sessions.
- Not needed for one-off short pieces — personas work fine without a bible for single-session drafts.

## Instructions for Claude

When this skill is invoked:

1. **Confirm the working directory** with the user. Ask: "Initialize `.great-authors/` in `<cwd>`? (yes/no/different path)"
   - If the user gives a different path, confirm that path exists and is writable.

2. **Check for existing `.great-authors/`** in the target directory. If it exists, ask: "A `.great-authors/` folder already exists here. Overwrite? (yes/no)" — default to no. If no, exit without changes.

3. **Ask the interview questions** one at a time, in this order. Use the user's answers to replace the guiding prose in the scaffolded files:
   a. Working title? (string, may be placeholder)
   b. Genre? (specific — not "fiction" but "cozy small-town mystery")
   c. Premise? (one or two sentences)
   d. POV and tense? (e.g., "third-person limited past")
   e. Dominant tone? (one word or phrase)
   f. One non-negotiable voice rule for this project? (can be skipped — user can fill in later)
   g. Starting chapter filename? Default: `chapter-01.md`. Accept any valid markdown filename (e.g., `prologue.md`, `part-1-chapter-01.md`).

4. **Scaffold both directories:**
   a. Copy the template tree from the plugin's `templates/project-bible/` to the target `.great-authors/` directory. The plugin install path varies; locate it by checking the skill's own file path and resolving `../../templates/project-bible/` relative to `SKILL.md`.
   b. Create `manuscript/` at the project root (sibling to `.great-authors/`).
   c. Create an empty file at `manuscript/<starting-chapter>.md` using the filename from question 3g.

5. **Substitute the user's answers** into the relevant sections of `project.md` and `voice.md`:
   - Working title, Genre, Premise, POV and tense, Register and voice go into the matching sections of `project.md`.
   - One non-negotiable rule (if given) goes into `voice.md`.
   - The starting chapter filename goes into `project.md`'s `## Manuscript` section as the `Current:` field.
   Leave the rest of the guiding prose as-is — the user fills in or deletes as they work.

6. **Report what was created:**
   ```
   Created .great-authors/ with:
     project.md (working title, genre, premise, POV, tone, and manuscript config filled in)
     voice.md (one rule filled in; rest ready for editing)
     timeline.md (empty skeleton)
     glossary.md (empty skeleton)
     characters/ (empty)
     places/ (empty)
     scenes/ (empty)
     journal/ (empty — entries added by /authors-journal)

   Created manuscript/ with:
     <starting-chapter>.md (empty — ready for your first prose)

   Next: run /authors-channel <author> to write, or /authors-draft "<brief>" <author> to generate a draft. Prose lands in manuscript/ by default. Use /authors-journal at the end of each session to capture decisions.
   ```

## Notes

- This skill does not commit to git. The user owns their repository.
- If the user answers "skip" or leaves an answer blank, leave the guiding prose in that section intact.
- Do not fabricate answers. If the user is uncertain, tell them they can edit the files directly later.
