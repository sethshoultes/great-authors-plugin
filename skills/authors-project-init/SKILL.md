---
name: authors-project-init
description: Initialize the per-project memory bible (.great-authors/) in the current working directory. Creates project.md, voice.md, timeline.md, glossary.md, and empty characters/, places/, scenes/ directories. Use when the user is starting a new writing project (novel, essay collection, long-form nonfiction) and wants author personas to have persistent context across sessions.
---

# /authors-project-init

Initialize the per-project memory bible for a writing project.

## What this does

Creates a `.great-authors/` folder in the current working directory with a standardized structure that every author persona in this plugin reads before editing:

```
.great-authors/
├── project.md      # genre, voice, premise, POV, tense
├── voice.md        # voice rules for this project
├── timeline.md     # chronology
├── glossary.md     # invented terms, brands, dialect
├── characters/     # one file per character
├── places/         # one file per place
├── scenes/         # one file per scene or beat card
└── journal/        # dated session entries (YYYY-MM-DD.md)
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

4. **Copy the template tree** from the plugin's `templates/project-bible/` to the target `.great-authors/` directory. The plugin install path varies; locate it by checking the skill's own file path and resolving `../../templates/project-bible/` relative to `SKILL.md`.

5. **Substitute the user's answers** into the relevant sections of `project.md` and `voice.md`. Leave the rest of the guiding prose as-is — the user will fill it in or delete it as they work.

6. **Report what was created:**
   ```
   Created .great-authors/ with:
     project.md (working title, genre, premise, POV, tone filled in)
     voice.md (one rule filled in; rest ready for editing)
     timeline.md (empty skeleton)
     glossary.md (empty skeleton)
     characters/ (empty)
     places/ (empty)
     scenes/ (empty)
     journal/ (empty — entries added by /authors-journal)

   Next: run /authors-channel <author> or drop a draft into the directory and run an editing command. Use /authors-journal at the end of each session to capture decisions.
   ```

## Notes

- This skill does not commit to git. The user owns their repository.
- If the user answers "skip" or leaves an answer blank, leave the guiding prose in that section intact.
- Do not fabricate answers. If the user is uncertain, tell them they can edit the files directly later.
