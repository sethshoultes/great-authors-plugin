# Great Authors v0.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.3 — journal system + continuity checker. Adds persistent session memory to the bible and a command that audits a draft against the bible for continuity violations.

**Architecture:**
- New bible subdirectory `.great-authors/journal/` holding dated session entries (`YYYY-MM-DD.md`).
- Three new slash commands: `/authors-journal` (write a session entry), `/authors-consolidate` (promote repeated journal decisions to the bible), `/authors-continuity` (check a draft against the bible).
- One-line addition to each of the 10 author personas' `## Before you edit` protocol to read the latest journal entry. Mechanical sed-driven diff across 10 files.
- Updated `/authors-project-init` to scaffold `journal/` alongside `characters/`, `places/`, `scenes/`.
- New template `templates/project-bible/journal/.gitkeep`.

**Tech stack:** Same as v0.1/v0.2 — bash + markdown + YAML frontmatter. No new dependencies.

**Prerequisites:**
- v0.2 is pushed (`origin/main` at commit `16bbd76` or later, tag `v0.2.0` exists)
- Clean working tree on `main`

---

## File structure for v0.3

```
great-authors-plugin/
├── agents/                            # 12 existing (10 personas + 2 builders)
│   └── <10 persona files all modified — add journal-read to ## Before you edit>
├── skills/                            # 7 existing + 3 new
│   ├── authors-journal/SKILL.md       # Task 5 (new)
│   ├── authors-consolidate/SKILL.md   # Task 6 (new)
│   ├── authors-continuity/SKILL.md    # Task 7 (new)
│   └── authors-project-init/SKILL.md  # Task 8 (modified — scaffold journal/)
├── templates/
│   └── project-bible/
│       └── journal/.gitkeep           # Task 2 (new)
└── README.md                          # Task 9 (updated — v0.3 commands)
```

**File responsibilities:**

- `.great-authors/journal/YYYY-MM-DD.md` — session entry. Written by `/authors-journal`, read by all personas before editing. Contains: what was worked on, decisions made, what's unresolved, where the user left off.
- `skills/authors-journal/SKILL.md` — user-facing command to write an entry. Interactive interview with smart prompts based on recent activity.
- `skills/authors-consolidate/SKILL.md` — promotes repeated journal decisions to the bible. E.g., if Marcus's age appears unchanged across 4 journal entries, promote to `characters/marcus.md`.
- `skills/authors-continuity/SKILL.md` — reads a draft file and the full bible; fans out to 1-2 authors; returns a list of flagged inconsistencies (character detail drift, timeline contradictions, voice rule violations, invented-term misuse).
- Persona updates — every `## Before you edit` protocol gains step 0: "Read the most recent `.great-authors/journal/` entry if any exist."

---

## Tasks

### Task 1: Verify repo state

- [ ] **Step 1: Confirm clean main**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && \
  git status && \
  git fetch origin && \
  git log --oneline origin/main..main && \
  git log --oneline main..origin/main && \
  echo "--- tags ---" && \
  git tag --list
```

Expected:
- Branch: `main`
- Status: clean
- No divergence from origin
- Tags include `v0.1.0` and `v0.2.0`

- [ ] **Step 2: Confirm v0.2 artifacts exist**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ls agents/character-builder.md agents/scene-builder.md && \
  ls skills/authors-edit skills/authors-critique skills/authors-debate && \
  ls skills/authors-build-character skills/authors-build-scene
```

Expected: no errors (all v0.2 files present).

No commit for this task.

---

### Task 2: Add journal template skeleton + bump version

**Files:**
- Create: `templates/project-bible/journal/.gitkeep`
- Modify: `.claude-plugin/plugin.json`
- Modify: `package.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Create journal/ scaffold dir**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  mkdir -p templates/project-bible/journal && \
  touch templates/project-bible/journal/.gitkeep && \
  find templates/project-bible -type d | sort
```

Expected: journal/ directory listed alongside characters/, places/, scenes/.

- [ ] **Step 2: Bump plugin.json version**

Use Edit on `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/plugin.json`:
- Replace: `  "version": "0.2.0",`
- With: `  "version": "0.3.0",`

- [ ] **Step 3: Bump package.json version**

Edit on `/Users/sethshoultes/Local Sites/great-authors-plugin/package.json`:
- Replace: `  "version": "0.2.0",`
- With: `  "version": "0.3.0",`

- [ ] **Step 4: Update marketplace description**

Edit on `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/marketplace.json`:
- Replace: `      "description": "Ten author personas + 7 slash commands: /authors-channel, /authors-edit, /authors-critique, /authors-debate, /authors-project-init, /authors-build-character, /authors-build-scene.",`
- With: `      "description": "Ten author personas + 10 slash commands: /authors-channel, /authors-edit, /authors-critique, /authors-debate, /authors-project-init, /authors-build-character, /authors-build-scene, /authors-journal, /authors-consolidate, /authors-continuity.",`

- [ ] **Step 5: Validate JSON**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  echo OK
```

Expected: `OK`.

- [ ] **Step 6: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add templates/project-bible/journal/ .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 0.3.0 and add journal template scaffold"
```

---

### Task 3: Update /authors-project-init to scaffold journal/

**Files:**
- Modify: `skills/authors-project-init/SKILL.md`

The current skill lists the bible structure as 4 files + 3 dirs (characters/, places/, scenes/). Add journal/ to the documented structure and the "report what was created" section.

- [ ] **Step 1: Read current SKILL.md**

```bash
cat "/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-project-init/SKILL.md"
```

Note the two places journal/ needs to be added:
1. The tree diagram under "What this does"
2. The report back section under Instructions for Claude step 6

- [ ] **Step 2: Update the tree diagram**

Edit on `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-project-init/SKILL.md`:

Replace:
```
.great-authors/
├── project.md      # genre, voice, premise, POV, tense
├── voice.md        # voice rules for this project
├── timeline.md     # chronology
├── glossary.md     # invented terms, brands, dialect
├── characters/     # one file per character
├── places/         # one file per place
└── scenes/         # one file per scene or beat card
```

With:
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

- [ ] **Step 3: Update the "report what was created" block**

Replace:
```
   Created .great-authors/ with:
     project.md (working title, genre, premise, POV, tone filled in)
     voice.md (one rule filled in; rest ready for editing)
     timeline.md (empty skeleton)
     glossary.md (empty skeleton)
     characters/ (empty)
     places/ (empty)
     scenes/ (empty)

   Next: run /authors-channel <author> or drop a draft into the directory and run an editing command.
```

With:
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

- [ ] **Step 4: Verify the file still parses as valid markdown with frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-project-init/SKILL.md
```

Expected: `---` on line 1, `name:` and `description:` fields intact.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-project-init/ && \
  git commit -m "feat(project-init): scaffold journal/ directory in new bibles"
```

---

### Task 4: Update all 10 author personas to read journal

**Files:**
- Modify: `agents/baldwin-persona.md`, `agents/didion-persona.md`, `agents/hemingway-persona.md`, `agents/king-persona.md`, `agents/le-guin-persona.md`, `agents/mccarthy-persona.md`, `agents/mcphee-persona.md`, `agents/orwell-persona.md`, `agents/vonnegut-persona.md`, `agents/wallace-persona.md`

Each of the 10 author personas has a `## Before you edit` section. Add one step about reading the most recent journal entry. The addition goes as a new numbered item between step 1 (read project.md) and the previous step 2 (read voice.md).

**Note on McCarthy and McPhee:** these two have slightly different `## Before you edit` content (McCarthy has a rule-4 about quotation marks; McPhee has a rule-4 about timeline.md/scenes/). Their step numbering is already unique. The journal-read step is insertable at the same logical position (between project.md and voice.md), but the subsequent renumbering differs.

This task is scripted — sed-driven to stay safe. But it's still touching 10 files, so each file gets verified by the persona validator after the edit.

- [ ] **Step 1: Write a test file to verify the transformation works before touching real personas**

Create a throwaway test file at `/tmp/test-persona.md`:

```bash
cat > /tmp/test-persona.md << 'EOF'
---
name: test
description: "test"
model: sonnet
color: blue
---

# Test

Body.

## Before you edit

If `.great-authors/` exists in the current working directory:
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
2. Read `.great-authors/voice.md` for established voice rules — respect them even when they conflict with my defaults.
3. For any character, place, or invented term named in the passage, read the matching file in `.great-authors/characters/`, `.great-authors/places/`, or `.great-authors/glossary.md`.
4. If the passage contradicts the bible, flag it explicitly. Do not silently "correct" the manuscript.

## Next section

foo
EOF
```

- [ ] **Step 2: Apply the transformation to the test file**

Use the Edit tool on `/tmp/test-persona.md`:

Replace:
```
If `.great-authors/` exists in the current working directory:
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
```

With:
```
If `.great-authors/` exists in the current working directory:
0. Read the most recent entry in `.great-authors/journal/` (if any exist) for context on what's in flux vs. settled this project.
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
```

- [ ] **Step 3: Verify the test file is correctly transformed**

```bash
grep -A 2 'Before you edit' /tmp/test-persona.md
```

Expected: the new step 0 line appears between the opening condition and step 1.

- [ ] **Step 4: Apply the same transformation to each of the 10 author personas**

For each of the ten files in order, run an Edit:

File: `/Users/sethshoultes/Local Sites/great-authors-plugin/agents/hemingway-persona.md` (and the same `old_string` / `new_string` for each of the 10 below)

Replace (exact):
```
If `.great-authors/` exists in the current working directory:
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
```

With:
```
If `.great-authors/` exists in the current working directory:
0. Read the most recent entry in `.great-authors/journal/` (if any exist) for context on what's in flux vs. settled this project.
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
```

Repeat for the other 9 persona files:
- `agents/orwell-persona.md`
- `agents/didion-persona.md`
- `agents/baldwin-persona.md`
- `agents/mcphee-persona.md`
- `agents/wallace-persona.md`
- `agents/king-persona.md`
- `agents/mccarthy-persona.md`
- `agents/vonnegut-persona.md`
- `agents/le-guin-persona.md`

**All 10 files contain the exact same two-line opening in their `## Before you edit` section, so the Edit will succeed on all 10.** If any file fails the replace (string not found), read that file to diagnose — it may have unique phrasing that needs a separate edit.

- [ ] **Step 5: Verify every persona still validates**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done
```

Expected: 10 `PASS:` lines.

- [ ] **Step 6: Verify the journal-read line is present in all 10**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -l "Read the most recent entry in \`.great-authors/journal/\`" agents/*-persona.md | wc -l
```

Expected: `10`

- [ ] **Step 7: Clean up test file**

```bash
rm /tmp/test-persona.md
```

- [ ] **Step 8: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/ && \
  git commit -m "feat(agents): add journal-read step to all ten personas' Before-you-edit protocol"
```

---

### Task 5: Write /authors-journal skill

**Files:**
- Create: `skills/authors-journal/SKILL.md`

Interactive skill. Prompts the user for the key session facts, writes a dated journal entry at `.great-authors/journal/YYYY-MM-DD.md`.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-journal/SKILL.md`:

```markdown
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

5. **Interview the user** with four questions, one at a time:

   a. **Worked on** — which chapter, scene, or section did you work on today? One line.
   b. **Decisions made** — list any choices that affect the project going forward (character detail confirmed, timeline shifted, scene cut or moved, voice rule adjusted). Up to 3-5 bullets. "None" is a valid answer.
   c. **Unresolved** — what's in flux? Questions you haven't answered, threads you haven't followed, character motivations you're still deciding. Up to 3 bullets.
   d. **Where you left off** — one sentence. Literal — what's the very next thing to work on when you return.

6. **Write the entry.** Format:

   ```markdown
   # YYYY-MM-DD

   ## Worked on
   <answer from question a>

   ## Decisions made
   - <bullet>
   - <bullet>
   <...or "None."...>

   ## Unresolved
   - <bullet>
   <...or "Nothing new today."...>

   ## Next session
   <answer from question d>
   ```

7. **If appending,** add a new section `## Session N` (increment from existing session count) above the standard sections, or re-open the most recent session's content for append. Default to adding a new `## Session 2` style header so each session remains distinct.

8. **Confirm:**
   ```
   Wrote .great-authors/journal/YYYY-MM-DD.md

   Next session: <the "where you left off" line>

   When you resume, any author persona you invoke will read this entry first to reorient.
   ```

## Notes

- Keep entries short. A journal entry that requires 20 minutes to write will never get written.
- If the user pastes a long narrative answer, keep the spirit but trim to a sentence per field.
- Do not editorialize. Record what the user says, not what you think they should have decided.
- Journal entries are read by personas via the `## Before you edit` protocol. Be concise — personas only read the most recent entry.
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-journal/SKILL.md
```

Expected: valid YAML frontmatter.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-journal/ && \
  git commit -m "feat: add /authors-journal skill"
```

---

### Task 6: Write /authors-consolidate skill

**Files:**
- Create: `skills/authors-consolidate/SKILL.md`

Periodic command that scans journal entries and offers to promote repeated decisions to the bible (e.g., to project.md, characters/, voice.md, etc.). Entirely advisory — user confirms each promotion.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-consolidate/SKILL.md`:

```markdown
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
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-consolidate/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-consolidate/ && \
  git commit -m "feat: add /authors-consolidate skill"
```

---

### Task 7: Write /authors-continuity skill

**Files:**
- Create: `skills/authors-continuity/SKILL.md`

Cross-chapter continuity checker. Reads a draft + full bible; fans out to 1-2 authors; returns flagged violations.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-continuity/SKILL.md`:

```markdown
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
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-continuity/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-continuity/ && \
  git commit -m "feat: add /authors-continuity skill"
```

---

### Task 8: Static integration check

- [ ] **Step 1: Confirm tree shape**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  find agents/ skills/ templates/project-bible/ -type f | sort
```

Expected: 12 agent files, 10 skill SKILL.md files, 5 template files (including journal/.gitkeep).

- [ ] **Step 2: All validators pass**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done && \
  ./scripts/lint-builder.sh agents/character-builder.md && \
  ./scripts/lint-builder.sh agents/scene-builder.md
```

Expected: 10 persona PASS + 2 builder PASS.

- [ ] **Step 3: Skills have frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in skills/*/SKILL.md; do
    head -1 "$f" | grep -q '^---$' && grep -qE '^name: ' "$f" && echo "OK $f" || echo "FAIL $f"
  done
```

Expected: 10 OK lines.

- [ ] **Step 4: Version is 0.3.0**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; print(json.load(open('.claude-plugin/plugin.json'))['version'])"
```

Expected: `0.3.0`.

- [ ] **Step 5: Every persona has the journal-read line**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -c "Read the most recent entry in \`.great-authors/journal/\`" agents/*-persona.md
```

Expected: each file shows `1` match.

No commit — verification only.

---

### Task 9: Update README for v0.3

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the "What's in v0.2" section**

Use Edit to rename section header and add the three new commands + journal to the structure diagram + updated workflow example. Replace the entire section and roadmap.

Replace (starting at `## What's in v0.2`, through `## Roadmap`):

(Block matching the current README's v0.2 content)

With:

```markdown
## What's in v0.3

### 10 Author Personas

| Agent | Strength |
|-------|----------|
| `hemingway-persona` | Iceberg prose. Tightens bloated writing. Kills adverbs. |
| `orwell-persona` | The plain-style hammer. Cuts political and corporate jargon. |
| `didion-persona` | Cool observational authority. Cultural reporting and essays. |
| `baldwin-persona` | Moral urgency. The essay as confrontation. |
| `mcphee-persona` | Long-form nonfiction architecture. Structure is destiny. |
| `wallace-persona` | Maximalist, self-aware. Essays about attention and sincerity. |
| `king-persona` | Voice-driven narrative. Pace, dialogue, working novelist's toolbox. |
| `mccarthy-persona` | Biblical weight, mythic register. Prose of terror and grace. |
| `vonnegut-persona` | Humane irony. Devastating compression. Short stories and satire. |
| `le-guin-persona` | Speculative fiction as thought experiment. World-building that serves theme. |

### 2 Tool Personas

| Agent | Role |
|-------|------|
| `character-builder` | Interviews you to build a character entry in the project bible. Optional `--author` lens. |
| `scene-builder` | Interviews you to build a scene beat card. Optional `--author` lens. |

### 10 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
| `/authors-critique <file> [authors...]` | Fast 3-bullet verdicts from 3 authors in parallel. |
| `/authors-debate <topic> <author-A> <author-B>` | 2-round craft dispute between two authors. |
| `/authors-continuity <file> [author]` | Audit a draft against the bible for continuity violations. |
| `/authors-project-init` | Initialize a per-project memory bible (`.great-authors/`). |
| `/authors-build-character <name> [--author <x>]` | Build a character entry in the bible. |
| `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |
| `/authors-journal` | Capture a session journal entry — decisions, unresolved threads, where you left off. |
| `/authors-consolidate` | Promote recurring journal decisions to the permanent bible. |

## Per-project memory

For novels, book-length nonfiction, or any project where you want consistency across sessions, run `/authors-project-init` in your project directory. It creates:

```
.great-authors/
├── project.md      # genre, voice, premise, POV, tense
├── voice.md        # voice rules for this project
├── timeline.md     # chronology
├── glossary.md     # invented terms, brands, dialect
├── characters/     # one file per character (use /authors-build-character)
├── places/         # one file per place
├── scenes/         # one file per scene or beat card (use /authors-build-scene)
└── journal/        # dated session entries (use /authors-journal)
```

Every author persona reads the relevant bible files — including the most recent journal entry — before editing any passage. No author "memorizes" the project; each invocation reads what's relevant, each time.

### Using with Obsidian

The bible is plain markdown. To keep project memory inside an Obsidian vault, symlink your `.great-authors/` folder to a vault subdirectory:

```bash
ln -s ~/Obsidian/My\ Vault/Novel-Project/.great-authors ./.great-authors
```

No plugin changes required.

## Workflow example

A typical novel session:

```
cd ~/my-novel
/authors-project-init                          # (once) scaffold .great-authors/
/authors-build-character marcus --author king  # (once) build the character
/authors-build-scene ch14-confrontation --author mcphee  # (once) outline the scene

# draft ch14.md as usual...
# then at any point:
/authors-edit ch14.md king vonnegut            # marked-up feedback
/authors-continuity ch14.md                    # catch character/timeline drifts
/authors-debate "this opening paragraph" hemingway mccarthy  # resolve a craft dispute

# at the end of the session:
/authors-journal                               # capture decisions and next-steps

# every few sessions:
/authors-consolidate                           # promote settled decisions to the bible
```

## Roadmap

- **v0.4** — `/authors-draft` voice-takeover drafting + Mode B activation for builders (auto-sketch characters introduced mid-draft)
- **v0.5** — `place-builder` and `relationship-builder` (finishes the builder set)
- **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
- **v1.0** — DXT package for Claude Desktop
```

- [ ] **Step 2: Verify README shape**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -c "^## " README.md && \
  wc -l README.md
```

Expected: 6-8 section headers; 100-140 lines.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update README for v0.3 (journal + continuity)"
```

---

### Task 10: Tag v0.3.0 and push

- [ ] **Step 1: Push commits**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push origin main
```

- [ ] **Step 2: Tag + push**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git tag -a v0.3.0 -m "v0.3.0 — journal system, /authors-consolidate, /authors-continuity" && \
  git push origin v0.3.0
```

- [ ] **Step 3: Verify**

```bash
gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -5
```

Expected: `v0.3.0` appears at top of tag list.

---

## Self-review

### Spec coverage

- **Journal system** (Section 7 "Phase 2 candidates"): covered by Task 5 (/authors-journal), Task 6 (/authors-consolidate), Task 2 (scaffold), Task 3 (project-init update), Task 4 (persona protocol update).
- **Continuity checker** (Section 7): covered by Task 7 (/authors-continuity).
- **Section 6 "The protocol"**: extended to include journal reading — Task 4 propagates the new protocol step to all 10 personas.

### Placeholder scan

No TBDs, no TODOs, no "implement later." All content specified.

### Type / name consistency

- New skill names: `authors-journal`, `authors-consolidate`, `authors-continuity` — all `authors-` prefixed for consistency.
- Journal entry filename: `YYYY-MM-DD.md` — specified identically in Task 5 step 3 and Task 7's prompt.
- Persona protocol step numbering: existing personas have steps 1-4 (or 1-5 for McCarthy/McPhee with rule-4 specific to them). New journal-read step is numbered `0` to avoid renumbering collisions.

### Risk notes

- **Task 4 scripted edit across 10 files.** If any persona's `## Before you edit` section has unexpected phrasing, the exact-match replace will fail. The plan instructs: if fail, read that file and do a per-file edit. The v0.1 personas were all generated from the same template so the risk is low, but flagged.
- **Task 9 README edit is large.** Consider using Write to rewrite the file rather than a large Edit.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-great-authors-v0.3.md`. Proceeding with subagent-driven execution.**
