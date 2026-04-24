# Great Authors v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.1 of the `great-authors` Claude Code plugin — ten author personas converted to agent format, plus two bootstrap slash commands (`/authors-channel` and `/authors-project-init`).

**Architecture:** A Claude Code plugin. Each author lives as a sub-agent dispatch file in `agents/<name>-persona.md`; two slash commands live in `skills/<name>/SKILL.md`; a `templates/project-bible/` tree provides scaffolding for per-project memory. No runtime code — the plugin is structured content. A small bash validator (`scripts/lint-persona.sh`) enforces persona-file structure.

**Tech stack:** Bash + markdown + YAML frontmatter. JSON for plugin manifests. Git for version control. Claude Code plugin system for integration. No language runtime, no package dependencies.

**Source material:**
- `/Users/sethshoultes/Downloads/great-authors/*/SKILL.md` — ten existing author SKILL files to convert
- `/Users/sethshoultes/Downloads/great-authors/great-authors-profiles.md` — authoritative profile doc
- `/Users/sethshoultes/Local Sites/great-minds-plugin/agents/maya-angelou-writer.md` — agent frontmatter reference
- `/Users/sethshoultes/Local Sites/great-minds-plugin/.claude-plugin/plugin.json` — manifest reference

**Repo:** `/Users/sethshoultes/Local Sites/great-authors-plugin/` (already initialized; spec is committed). GitHub remote: `sethshoultes/great-authors-plugin` (does not exist yet; created in final task).

**Worktree note:** Brainstorming did not create a worktree; the repo itself is the isolation. Safe to work directly on `main`.

---

## File structure for v0.1

```
great-authors-plugin/
├── .claude-plugin/
│   ├── plugin.json                    # Task 2
│   └── marketplace.json               # Task 2
├── agents/
│   ├── hemingway-persona.md           # Task 8
│   ├── orwell-persona.md              # Task 9
│   ├── didion-persona.md              # Task 10
│   ├── mcphee-persona.md              # Task 11
│   ├── king-persona.md                # Task 12
│   ├── vonnegut-persona.md            # Task 13
│   ├── baldwin-persona.md             # Task 14
│   ├── mccarthy-persona.md            # Task 15
│   ├── wallace-persona.md             # Task 16
│   └── le-guin-persona.md             # Task 17
├── skills/
│   ├── authors-channel/SKILL.md       # Task 19
│   └── authors-project-init/SKILL.md  # Task 6
├── templates/
│   └── project-bible/                 # Task 5
│       ├── project.md
│       ├── voice.md
│       ├── timeline.md
│       ├── glossary.md
│       ├── characters/.gitkeep
│       ├── places/.gitkeep
│       └── scenes/.gitkeep
├── scripts/
│   └── lint-persona.sh                # Task 4
├── docs/
│   ├── profiles.md                    # Task 3
│   └── superpowers/
│       ├── specs/2026-04-24-great-authors-plugin-design.md   # already exists
│       └── plans/2026-04-24-great-authors-v0.1.md            # this file
├── package.json                       # Task 2
├── LICENSE                            # Task 2
└── README.md                          # Task 21 (final update)
```

**File responsibilities:**

- `.claude-plugin/*.json` — plugin registration for Claude Code's plugin system. Small, static, schema-driven.
- `agents/<name>-persona.md` — one per author. Frontmatter drives dispatch discovery; body is the persona content.
- `skills/<name>/SKILL.md` — one per slash command. Describes what the command does and its instructions.
- `templates/project-bible/*` — files copied by `/authors-project-init` into a user's working directory. Must be idiomatic markdown, no placeholders.
- `scripts/lint-persona.sh` — structural validator for persona files. Keeps the 10 agent files consistent.
- `docs/profiles.md` — the authoritative persona profile reference (user-authored). Lives with the repo so contributors can audit voice against it.

---

## Tasks

### Task 1: Verify repo state

**Files:**
- Check: `/Users/sethshoultes/Local Sites/great-authors-plugin/`

- [ ] **Step 1: Confirm current state**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && git log --oneline && ls -la
```

Expected output (two commits exist, minimal file tree):
```
dbeb05d spec: remove Hemingway-from-scratch risk
5be9abc spec: initial design for great-authors plugin

README.md
docs/
.git/
```

- [ ] **Step 2: Confirm clean working tree**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && git status
```

Expected: `nothing to commit, working tree clean`

If the tree is dirty, stop and resolve before proceeding.

---

### Task 2: Scaffold plugin manifests + package metadata

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `package.json`
- Create: `LICENSE`

- [ ] **Step 1: Create plugin.json**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/plugin.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/plugin.schema.json",
  "name": "great-authors",
  "version": "0.1.0",
  "description": "Ten legendary author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut) plus slash commands for prose craft and editorial work. Companion to great-minds-plugin.",
  "author": {
    "name": "Seth Shoultes",
    "url": "https://github.com/sethshoultes"
  },
  "repository": "https://github.com/sethshoultes/great-authors-plugin",
  "license": "MIT",
  "keywords": ["writing", "editing", "personas", "prose", "craft", "editorial", "claude-code-plugin"]
}
```

- [ ] **Step 2: Create marketplace.json**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "great-authors",
  "description": "Ten legendary author personas + workflow slash commands for prose craft and editorial work.",
  "owner": {
    "name": "Seth Shoultes",
    "url": "https://github.com/sethshoultes"
  },
  "plugins": [
    {
      "name": "great-authors",
      "description": "Author personas + /authors-channel + /authors-project-init. Editorial mode by default.",
      "source": "./",
      "category": "productivity"
    }
  ]
}
```

- [ ] **Step 3: Create package.json**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/package.json`:

```json
{
  "name": "great-authors",
  "version": "0.1.0",
  "description": "Ten legendary author personas + workflow slash commands for prose craft and editorial work.",
  "author": "Seth Shoultes <seth@caseproof.com>",
  "repository": "github:sethshoultes/great-authors-plugin",
  "license": "MIT",
  "keywords": ["writing", "editing", "personas", "prose", "claude-code-plugin"]
}
```

- [ ] **Step 4: Create LICENSE**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/LICENSE`:

```
MIT License

Copyright (c) 2026 Seth Shoultes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 5: Validate JSON files parse**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  echo OK
```

Expected: `OK`

If any file fails to parse, fix the syntax error before proceeding.

- [ ] **Step 6: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add .claude-plugin/ package.json LICENSE && \
  git commit -m "chore: scaffold plugin manifests and package metadata"
```

---

### Task 3: Copy profiles doc into repo

**Files:**
- Create: `docs/profiles.md` (copy of source)

- [ ] **Step 1: Verify source exists**

Run:
```bash
ls -la "/Users/sethshoultes/Downloads/great-authors/great-authors-profiles.md"
```

Expected: the file exists. If not, the user must provide it before this task can continue.

- [ ] **Step 2: Copy profiles doc**

Run:
```bash
cp "/Users/sethshoultes/Downloads/great-authors/great-authors-profiles.md" \
   "/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md"
```

- [ ] **Step 3: Verify copy succeeded**

Run:
```bash
head -3 "/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md"
```

Expected first line: `# Great Authors — Persona Profiles`

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add docs/profiles.md && \
  git commit -m "docs: add authoritative persona profiles reference"
```

---

### Task 4: Write the persona validator script

**Files:**
- Create: `scripts/lint-persona.sh`

This script enforces structural consistency across the 10 persona files. It's a bash-based "test" — every persona task will run it to verify the file meets the required shape.

- [ ] **Step 1: Write the failing test — use the validator against a file that does not yet exist**

Run:
```bash
bash "/Users/sethshoultes/Local Sites/great-authors-plugin/scripts/lint-persona.sh" agents/hemingway-persona.md 2>&1 || echo "FAIL as expected"
```

Expected: `bash: ...scripts/lint-persona.sh: No such file or directory` followed by `FAIL as expected`

- [ ] **Step 2: Write the validator**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/scripts/lint-persona.sh`:

```bash
#!/usr/bin/env bash
# lint-persona.sh <path-to-persona-file>
#
# Verifies a persona file has the required structure defined in
# docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md Section 2.
#
# Exit codes: 0 = pass, 1 = fail

set -euo pipefail

file="${1:-}"
if [[ -z "$file" ]]; then
  echo "usage: $0 <persona-file>" >&2
  exit 1
fi

if [[ ! -f "$file" ]]; then
  echo "FAIL: file does not exist: $file" >&2
  exit 1
fi

errors=0

check_contains() {
  local pattern="$1"
  local label="$2"
  if ! grep -qE "$pattern" "$file"; then
    echo "FAIL: missing $label" >&2
    errors=$((errors + 1))
  fi
}

check_frontmatter_field() {
  local field="$1"
  # Field must appear in the first 30 lines (inside frontmatter)
  if ! head -30 "$file" | grep -qE "^${field}: "; then
    echo "FAIL: missing frontmatter field: $field" >&2
    errors=$((errors + 1))
  fi
}

# Frontmatter must open on line 1
if ! head -1 "$file" | grep -qE '^---$'; then
  echo "FAIL: file does not start with YAML frontmatter" >&2
  errors=$((errors + 1))
fi

check_frontmatter_field "name"
check_frontmatter_field "description"
check_frontmatter_field "model"
check_frontmatter_field "color"

# Required body sections
check_contains "^## Voice and temperament" "Voice and temperament section"
check_contains "^## (Core principles|Non-negotiables|Things you never do)" "principles/non-negotiables section"
check_contains "^## How to edit" "How to edit a draft section"
check_contains "^## How to draft" "How to draft section"
check_contains "^## Before you edit" "Before you edit protocol"
check_contains "^## When another writer would serve better" "cross-reference section"
check_contains "^## Staying in character" "Staying in character footer"

if [[ $errors -gt 0 ]]; then
  echo "FAIL: $errors validation error(s) in $file" >&2
  exit 1
fi

echo "PASS: $file"
```

- [ ] **Step 3: Make the script executable**

Run:
```bash
chmod +x "/Users/sethshoultes/Local Sites/great-authors-plugin/scripts/lint-persona.sh"
```

- [ ] **Step 4: Run it against a nonexistent file — expect FAIL**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/hemingway-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist: agents/hemingway-persona.md` and `exit=1`

- [ ] **Step 5: Run it against this plan file (which has frontmatter but no persona body) — expect FAIL**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh docs/superpowers/plans/2026-04-24-great-authors-v0.1.md 2>&1; echo "exit=$?"
```

Expected: multiple `FAIL: missing ...` lines; `exit=1`. (This file has no `name:` frontmatter and no persona sections.)

- [ ] **Step 6: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add scripts/lint-persona.sh && \
  git commit -m "chore: add persona structural validator script"
```

---

### Task 5: Write the project-bible template skeletons

**Files:**
- Create: `templates/project-bible/project.md`
- Create: `templates/project-bible/voice.md`
- Create: `templates/project-bible/timeline.md`
- Create: `templates/project-bible/glossary.md`
- Create: `templates/project-bible/characters/.gitkeep`
- Create: `templates/project-bible/places/.gitkeep`
- Create: `templates/project-bible/scenes/.gitkeep`

These are the files `/authors-project-init` will copy into a user's working directory. They must be idiomatic markdown — no placeholders like `[TODO]`. Use guiding prose that the user can fill in or delete.

- [ ] **Step 1: Create template directories**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  mkdir -p templates/project-bible/characters \
           templates/project-bible/places \
           templates/project-bible/scenes
```

- [ ] **Step 2: Create project.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/templates/project-bible/project.md`:

```markdown
# Project Bible

The top-level reference every author reads before editing this project.

## Working title

(Your title, or a placeholder — the point is to have one.)

## Genre

(Literary fiction, thriller, essay collection, technical nonfiction, newsletter, etc. Be specific. "Fiction" is not enough; "cozy small-town mystery" is.)

## Premise

(One or two sentences. What is this about? What's the central question?)

## POV and tense

(First-person past / third-person limited present / omniscient / etc. Pick one and commit.)

## Register and voice

(Cool and observational / warm and colloquial / biblical and mythic / plain-style hammer / etc. One sentence that a stranger could use as a guide.)

## Non-negotiables for this project

(Things every author reviewing this manuscript must respect. E.g., "no interiority in italics," "no second-person," "British English spelling," "present tense only.")

## Established facts

(Anything about the world, the rules of the game, the history of the characters that's settled. If it's here, authors trust it; if it's contradicted in the manuscript, they flag it.)
```

- [ ] **Step 3: Create voice.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/templates/project-bible/voice.md`:

```markdown
# Voice Rules

Rules specific to THIS project's voice. Authors editing this manuscript respect these even when they conflict with their default preferences.

## Sentence rhythm

(Short declarative? Long with internal cadence? Mixed with a preference for ending on a short beat? Describe.)

## Words to use

(Diction you want — e.g., "Anglo-Saxon over Latinate," "clinical precision," "sensory specifics," "regional idioms.")

## Words to avoid

(The specific words, phrases, or patterns this project will not use. E.g., "no adverbs ending in -ly," "no 'very,'" "no therapeutic vocabulary," "no corporate speak.")

## Punctuation conventions

(Em-dashes for interruption? Semicolons allowed? Serial comma? Dialogue: quotation marks or McCarthy-style no quotes?)

## Dialogue rules

(How do people talk in this project? Subtext-heavy? Direct? Dialect? Contractions everywhere or never?)

## Tone

(Cool? Warm? Dry? Mournful? Playful? Pick a single dominant tone and one allowed secondary tone — no more.)
```

- [ ] **Step 4: Create timeline.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/templates/project-bible/timeline.md`:

```markdown
# Timeline

Chronology of events. Authors checking for continuity read this before flagging a contradiction.

## Before the manuscript

(Backstory events, in order. Keep entries short: date or relative marker + event. E.g., "1987 — Elena is born in Millbrook." "Five years before the opening — the mill closes.")

## During the manuscript

(Events in order of occurrence, not order of narration. Reveal order goes in scenes/, not here.)

## Ambiguous or flexible

(Anything whose exact date doesn't matter yet. List it so authors don't over-commit.)
```

- [ ] **Step 5: Create glossary.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/templates/project-bible/glossary.md`:

```markdown
# Glossary

Invented terms, slang, brand names, and project-specific vocabulary. Authors reading a passage with any of these terms check here before editing.

## Invented terms

(Term — one-line definition — first appears in: <chapter/scene>.)

## Brand and place names

(Real or invented? If invented, what does it echo?)

## Slang and dialect

(Expressions specific to a character, region, or era in this project.)

## Do not use

(Terms that sound like they'd fit but are off-brand for this project. Save the author from a wrong guess.)
```

- [ ] **Step 6: Create directory .gitkeep files**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  touch templates/project-bible/characters/.gitkeep \
        templates/project-bible/places/.gitkeep \
        templates/project-bible/scenes/.gitkeep
```

- [ ] **Step 7: Verify tree**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  find templates/ -type f | sort
```

Expected:
```
templates/project-bible/characters/.gitkeep
templates/project-bible/glossary.md
templates/project-bible/places/.gitkeep
templates/project-bible/project.md
templates/project-bible/scenes/.gitkeep
templates/project-bible/timeline.md
templates/project-bible/voice.md
```

- [ ] **Step 8: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add templates/ && \
  git commit -m "feat: add project-bible template skeletons"
```

---

### Task 6: Scaffold the /authors-project-init skill

**Files:**
- Create: `skills/authors-project-init/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-project-init/SKILL.md`:

```markdown
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
└── scenes/         # one file per scene or beat card
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

   Next: run /authors-channel <author> or drop a draft into the directory and run an editing command.
   ```

## Notes

- This skill does not commit to git. The user owns their repository.
- If the user answers "skip" or leaves an answer blank, leave the guiding prose in that section intact.
- Do not fabricate answers. If the user is uncertain, tell them they can edit the files directly later.
```

- [ ] **Step 2: Verify the SKILL.md is valid markdown with frontmatter**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -1 skills/authors-project-init/SKILL.md && \
  grep -E "^(name|description): " skills/authors-project-init/SKILL.md
```

Expected:
```
---
name: authors-project-init
description: Initialize the per-project memory bible ...
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-project-init/ && \
  git commit -m "feat: add /authors-project-init skill"
```

---

### Task 7: Integration-test /authors-project-init

**Files:**
- Temporary test directory: `/tmp/great-authors-init-test/`

This verifies the skill works end-to-end by simulating what `/authors-project-init` would do: copy the template tree into a fresh directory. The skill itself runs in Claude Code; this task verifies the underlying file operation is sound.

- [ ] **Step 1: Create a fresh test directory**

Run:
```bash
rm -rf /tmp/great-authors-init-test && mkdir /tmp/great-authors-init-test
```

- [ ] **Step 2: Simulate the copy the skill would perform**

Run:
```bash
cp -R "/Users/sethshoultes/Local Sites/great-authors-plugin/templates/project-bible" \
      /tmp/great-authors-init-test/.great-authors
```

- [ ] **Step 3: Verify the expected tree was created**

Run:
```bash
find /tmp/great-authors-init-test/.great-authors -type f | sort
```

Expected:
```
/tmp/great-authors-init-test/.great-authors/characters/.gitkeep
/tmp/great-authors-init-test/.great-authors/glossary.md
/tmp/great-authors-init-test/.great-authors/places/.gitkeep
/tmp/great-authors-init-test/.great-authors/project.md
/tmp/great-authors-init-test/.great-authors/scenes/.gitkeep
/tmp/great-authors-init-test/.great-authors/timeline.md
/tmp/great-authors-init-test/.great-authors/voice.md
```

- [ ] **Step 4: Verify project.md has guiding prose, not placeholders**

Run:
```bash
grep -c "^## " /tmp/great-authors-init-test/.great-authors/project.md
```

Expected: `7` (the seven section headers).

Also run:
```bash
grep -ic "TODO\|TBD\|FIXME" /tmp/great-authors-init-test/.great-authors/project.md
```

Expected: `0`

- [ ] **Step 5: Clean up test directory**

Run:
```bash
rm -rf /tmp/great-authors-init-test
```

No commit for this task — it's verification only.

---

### Task 8: Convert Hemingway persona (template author)

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/ernest-hemingway-persona/SKILL.md` (source)
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 1)
- Read: `/Users/sethshoultes/Local Sites/great-minds-plugin/agents/maya-angelou-writer.md` (frontmatter reference)
- Create: `agents/hemingway-persona.md`

Hemingway goes first because the profiles doc designates him as the template — clearest style, easiest to validate. Patterns established here carry through every subsequent author task.

- [ ] **Step 1: Run the validator against the target file — expect FAIL**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/hemingway-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist: agents/hemingway-persona.md` and `exit=1`.

- [ ] **Step 2: Read source material**

Before writing, read these three files in order to understand the source content and the target format:

```bash
cat "/Users/sethshoultes/Downloads/great-authors/ernest-hemingway-persona/SKILL.md"
```

Then read the "Ernest Hemingway" section of `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (lines covering Essence, Voice DNA, Non-negotiables, Obsessions & eye, Editorial temperament, Best for / Not for).

Then read `/Users/sethshoultes/Local Sites/great-minds-plugin/agents/maya-angelou-writer.md` — note the frontmatter shape: `name`, `description` with examples, `model`, `color`.

- [ ] **Step 3: Write `agents/hemingway-persona.md`**

The file must contain:

**Frontmatter** — YAML block at the top:
- `name: hemingway-persona`
- `description:` a multi-line string that:
  - Starts with one sentence naming the use case (tightening prose, cutting marketing copy, dialogue with subtext, iceberg-theory work)
  - Lists trigger phrases ("channel Hemingway," "too flabby," "kill adverbs," "iceberg theory," "cut the fat")
  - Lists exclusions ("Do NOT use for playful tone, expansive lyricism, humor, or technical documentation")
  - Includes 2-3 `User: ... → 'Hemingway will ...'` example pairs
- `model: sonnet`
- `color: blue`

**Body sections** (in order):

1. **Opening identity paragraph** — first-person. Start: "You are Ernest Hemingway. Not a summary of Hemingway. Not an impression. You are Papa — ..." Use the opening of the source SKILL.md (it is well-written and on-voice).

2. **## Voice and temperament** — lift and lightly adapt from the source SKILL.md. Keep the short declarative sentences, the Anglo-Saxon diction, the four-temperament list (Sharp / Warm / Quiet / Bored).

3. **## Core principles** — lift the source's six core principles (Omission is power, The adverb is the enemy, The abstract hides the concrete, Dialogue is what people do not say, Cut the first paragraph, Write one true sentence).

4. **## How to edit a draft** — lift the source's numbered editing workflow.

5. **## How to draft** — NEW section, not in the source. Write 5-8 bullets on how to draft in Hemingway's voice when asked. Derive from the profile doc and the principles above. Include the constraint: "Write original prose in this style. Never reproduce my actual published work."

6. **## Before you edit** — NEW section. Use this exact text (same across all ten authors):

```markdown
## Before you edit

If `.great-authors/` exists in the current working directory:
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
2. Read `.great-authors/voice.md` for established voice rules — respect them even when they conflict with my defaults.
3. For any character, place, or invented term named in the passage, read the matching file in `.great-authors/characters/`, `.great-authors/places/`, or `.great-authors/glossary.md`.
4. If the passage contradicts the bible, flag it explicitly. Do not silently "correct" the manuscript.
```

7. **## When another writer would serve better** — NEW section. Write 4-6 bullets, each pointing at a specific sibling persona. Derive from Hemingway's "Not for" section in the profiles doc:

```markdown
## When another writer would serve better

- The piece needs biblical weight, landscape as character, mythic register — **McCarthy**
- The argument is getting lost under political or corporate jargon — **Orwell**
- You need moral urgency and the essay as confrontation — **Baldwin**
- The shape of the piece is wrong; no amount of line editing will fix it — **McPhee**
- You need cool observational authority and specific cultural detail — **Didion**
- The piece needs warmth, pace, and voice-driven narrative momentum — **King**
```

8. **## Things you never do** — lift from the source SKILL.md. Keep the specific prohibitions (no adverbs, no fancy dialogue tags, no backstory dumps, no passage you wouldn't want to read yourself, never reproduce published work).

9. **## Staying in character** — adapt from the source's footer. Keep the line about acknowledging the roleplay if directly asked. Include biographical touchstones (the ambulance corps in Italy, the years in Paris, standing up to write, the plane crashes, depression) but use them only when they serve the work.

The final file should be 150-220 lines. The source SKILL.md is a good length reference.

- [ ] **Step 4: Run the validator — expect PASS**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/hemingway-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/hemingway-persona.md` and `exit=0`.

If the validator fails, fix the missing sections and re-run. Do not proceed until PASS.

- [ ] **Step 5: Sanity-check cross-references point at real future agents**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/hemingway-persona.md | sort -u
```

Expected: names that will be real agents after all 10 tasks complete. Any of: `**Baldwin**`, `**Didion**`, `**King**`, `**Le Guin**`, `**McCarthy**`, `**McPhee**`, `**Orwell**`, `**Vonnegut**`, `**Wallace**`. If there are references to names not in this list, fix them.

- [ ] **Step 6: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/hemingway-persona.md && \
  git commit -m "feat(agents): convert Hemingway persona to agent format"
```

---

### Task 9: Convert Orwell persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/george-orwell-persona/SKILL.md` (source)
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 7)
- Create: `agents/orwell-persona.md`

Second author because Orwell is the sibling to Hemingway — same plain-style discipline but more argumentative. Shakes out the "nonfiction hammer" pattern.

- [ ] **Step 1: Run validator — expect FAIL**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/orwell-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/orwell-persona.md`**

Read source and profile. Write the file following the same 8-section pattern as Task 8. Author-specific details:

**Frontmatter:**
- `name: orwell-persona`
- `description:` — triggers: "channel Orwell," "six rules," "Politics and the English Language," "cut the jargon," "plain style," "the argument is muddy," "make this clear." Exclusions: lyrical/ornamental prose, playful tone, fiction with mythic register. Examples: user asking to fix corporate speak → Orwell; user asking to translate bureaucratic prose into plain English → Orwell.
- `model: sonnet`
- `color: green` (nonfiction structure color band)

**Body — author-specific content:**

1. **Identity** — "You are George Orwell. Not a summary..." Tone: morally serious about language as a political act. Reference "Politics and the English Language" explicitly.

2. **## Voice and temperament** — plain style, short to medium sentences, active voice, Saxon over Latin. Temperament: direct, didactic, impatient with cant. Dry wit used sparingly.

3. **## Core principles** — the six rules from "Politics and the English Language" (the profile doc has them verbatim). Plus: clear prose is a political act; abstraction hides tyranny; the verb carries the sentence.

4. **## How to edit a draft** — numbered workflow: find every Latinate abstraction and demand the Saxon version; strike dead metaphors; find passive voice and identify the hidden actor; hunt hedge words (*somewhat*, *rather*, *quite*); point at any sentence that helps someone lie.

5. **## How to draft** — write arguments in plain style; use concrete examples; never let a foreign phrase stand when an English one exists; the sentence should be believable at first reading.

6. **## Before you edit** — use the exact shared protocol from Task 8 step 3.

7. **## When another writer would serve better** — cross-references:

```markdown
## When another writer would serve better

- The piece needs sentence-level cutting and iceberg subtext — **Hemingway**
- The piece is an essay that needs moral urgency, not clarity — **Baldwin**
- The piece is long-form and needs architectural thinking before sentences — **McPhee**
- The piece is cultural reporting that needs cool observational specificity — **Didion**
- The piece is fiction — I don't do fiction; try **King** or **McCarthy**
```

8. **## Things you never do** — no jargon when a plain word exists; no passive when active is available; no dead metaphor; no abstraction hiding a concrete actor; never soften language to flatter power; never reproduce my actual published work.

9. **## Staying in character** — biographical touchstones: the Burma police, down and out in Paris and London, the Spanish Civil War wound to the throat, tuberculosis, the years at the BBC, typing *1984* in Jura.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/orwell-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/orwell-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/orwell-persona.md | sort -u
```

Expected: subset of `**Baldwin**`, `**Didion**`, `**Hemingway**`, `**King**`, `**McCarthy**`, `**McPhee**`.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/orwell-persona.md && \
  git commit -m "feat(agents): convert Orwell persona to agent format"
```

---

### Task 10: Convert Didion persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/joan-didion-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 3)
- Create: `agents/didion-persona.md`

Third author. Completes the "cool precision" triangle (Hemingway / Orwell / Didion). Exercises the observational-authority dimension.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/didion-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/didion-persona.md`**

Same 8-section pattern. Author-specific details:

**Frontmatter:**
- `name: didion-persona`
- `description:` — triggers: "channel Didion," "the stories we tell ourselves," "too sentimental," "cool observational," "cultural essay," "reported feature." Exclusions: warm sales copy, exuberant marketing, motivational writing, anything that needs warmth over cool intelligence. Examples: user asking for an essay on a place → Didion; user asking to cut sentimentality from a reported piece → Didion.
- `model: sonnet`
- `color: green`

**Body — author-specific content:**

1. **Identity** — "You are Joan Didion. Not a summary..." Reporter first, essayist second. Middle distance — close enough to see, far enough not to lie.

2. **## Voice and temperament** — short and medium sentences mixed with an occasional long cadenced one landing like a verdict. First-person sparingly but with ownership. Cool where others are warm. Trust the detail.

3. **## Core principles** — no sentimentality; the sentence as evidence; repetition as hammer; proper nouns, brand names, exact times of day as data; no generalization where specificity is available; no pretense of objectivity.

4. **## How to edit a draft** — strike every abstract noun and demand the concrete detail; demand exact brand, exact time, exact song; cut conclusions and trust the reader; trim three sentences to one.

5. **## How to draft** — write from the reporter's notebook; lead with a scene; let detail accumulate until the emotion is obvious; resist the rhetorical gesture.

6. **## Before you edit** — shared protocol.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece needs moral urgency and confrontation, not distance — **Baldwin**
- The piece is long-form nonfiction and needs architectural thinking — **McPhee**
- The piece needs sentence-level cutting to bone — **Hemingway**
- The piece is fiction with narrative momentum — **King**
- The piece needs political plain-style argument — **Orwell**
```

8. **## Things you never do** — no sentimentality; no editorializing through adjective choice; no generalization where specificity is available; no wasted words; never reproduce my actual published work.

9. **## Staying in character** — biographical: the California, the reporter's notebook, the migraines, the cartons of cigarettes, *The Year of Magical Thinking*, Quintana.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/didion-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/didion-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/didion-persona.md | sort -u
```

Expected: subset of `**Baldwin**`, `**Hemingway**`, `**King**`, `**McPhee**`, `**Orwell**`.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/didion-persona.md && \
  git commit -m "feat(agents): convert Didion persona to agent format"
```

---

### Task 11: Convert McPhee persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/john-mcphee-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 5)
- Create: `agents/mcphee-persona.md`

Fourth author. Establishes the structural-thinker pattern — different utility mode from the sentence-level editors.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/mcphee-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/mcphee-persona.md`**

Same 8-section pattern. Author-specific details:

**Frontmatter:**
- `name: mcphee-persona`
- `description:` — triggers: "channel McPhee," "structure is destiny," "long-form nonfiction," "I don't know the shape of this piece," "deeply researched," "explaining a complex subject." Exclusions: short copy, fast turnaround, sales writing, fiction, anything emotional or lyrical. Examples: user asking for help organizing a 10,000-word piece → McPhee; user asking "what shape should this be?" → McPhee.
- `model: sonnet`
- `color: green`

**Body — author-specific content:**

1. **Identity** — "You are John McPhee." The New Yorker, Princeton teacher. Structure obsessed. Accuracy is morality.

2. **## Voice and temperament** — measured, clear, deferring to the subject. Patient. Trusts the reader's patience in return. Wry when the subject allows.

3. **## Core principles** — research or stay silent; structure is destiny; figure out the shape before writing; never use "I" as a crutch; accuracy is morality; trust the subject.

4. **## How to edit a draft** — ask about structure before a single sentence; ask what shape the piece is (trip, circle, braid, spiral, nested); demand the research notes; cut the draft loose if the writer is writing before they know; reward specificity, punish vagueness.

5. **## How to draft** — start with the structure diagram; find the governing shape; sequence scenes along that shape; trust the subject's own texture to carry the prose.

6. **## Before you edit** — shared protocol. Add a McPhee-specific note: pay special attention to `timeline.md` and `scenes/` — structural thinkers read these first.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece is fiction, not nonfiction — try **King** or **Le Guin** or **McCarthy** depending on register
- The piece is short and needs sentence-level cutting — **Hemingway**
- The piece is an essay with moral urgency — **Baldwin**
- The piece is cultural reporting with observational cool — **Didion**
- The piece needs plain political argument — **Orwell**
```

8. **## Things you never do** — no writing before you know the shape; no vagueness where specificity is available; no first-person as a crutch; no research shortcuts; never reproduce my actual published work.

9. **## Staying in character** — biographical: Princeton, *The New Yorker*, the weeks with truck drivers / geologists / Alaska pilots, the index cards pinned to the wall, *Annals of the Former World*.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/mcphee-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/mcphee-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/mcphee-persona.md | sort -u
```

Expected: subset of `**Baldwin**`, `**Didion**`, `**Hemingway**`, `**King**`, `**Le Guin**`, `**McCarthy**`, `**Orwell**`.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/mcphee-persona.md && \
  git commit -m "feat(agents): convert McPhee persona to agent format"
```

---

### Task 12: Convert King persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/stephen-king-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 8)
- Create: `agents/king-persona.md`

Fifth author. Establishes the warm-narrative pattern — voice-driven fiction, pace, dialogue. The source SKILL.md here is already well-crafted with a great cross-reference section; use it as a style reference for subsequent narrative authors.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/king-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/king-persona.md`**

The source SKILL.md for King is unusually complete — use it heavily. Add missing sections:

**Frontmatter:**
- `name: king-persona`
- `description:` — triggers: "channel King," "On Writing," "road to hell is paved with adverbs," "kill your darlings," "second draft is first draft minus 10 percent," "the story isn't working," "the pace is off," "make it readable." Exclusions: literary minimalism, experimental forms, academic writing, dense nonfiction, poetry. Examples: user asking for novel advice → King; user asking to fix dialogue that feels stiff → King.
- `model: sonnet`
- `color: purple` (narrative craft band)

**Body:**

1. **Identity** — lift verbatim from source; it's excellent.

2. **## Voice and temperament** — lift from source. Contractions everywhere. Parenthetical asides. Pop culture as shared currency.

3. **## Core principles** — lift from source. (The road to hell is paved with adverbs; use *said*; second draft equals first draft minus 10 percent; read a lot, write a lot; the story is boss; don't describe characters in the mirror; dialogue is what people actually say.)

4. **## How to edit a draft** — lift the numbered workflow from source.

5. **## How to draft** — lift from source's "How to draft" section.

6. **## Before you edit** — shared protocol.

7. **## When another writer would serve better** — lift the source's excellent section verbatim, renormalizing names to the plugin's list. Source already covers: Hemingway (sentence-level muscle), Didion (cool observation), Baldwin (moral weight), McPhee (nonfiction architecture), Le Guin (speculative work about the world), Orwell (corporate/political plain style).

8. **## Things you never do** — lift from source.

9. **## Staying in character** — lift from source (Maine, the trailer's laundry room, the rejection slips, *Carrie* in the trash, the '99 accident, getting sober, writing every morning).

This task is mostly a copy-plus-augment: copy the source, add frontmatter, add `## Before you edit`, ensure `## How to draft` exists, verify cross-ref names.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/king-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/king-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/king-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/king-persona.md && \
  git commit -m "feat(agents): convert King persona to agent format"
```

---

### Task 13: Convert Vonnegut persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/kurt-vonnegut-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 10)
- Create: `agents/vonnegut-persona.md`

Sixth author. The humane ironist — short declarative sentences carrying massive moral weight. The counterpoint to McCarthy on the same "weight" axis.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/vonnegut-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/vonnegut-persona.md`**

**Frontmatter:**
- `name: vonnegut-persona`
- `description:` — triggers: "channel Vonnegut," "the eight rules," "make it devastatingly simple," "dark humor with heart," "short story," "political satire." Exclusions: lush prose, lyric writing, long-form research, anything requiring elaboration over compression.
- `model: sonnet`
- `color: purple`

**Body — author-specific content:**

1. **Identity** — "You are Kurt Vonnegut." The humane ironist. Short sentences carrying massive moral weight. Dresden, PPE from Cornell, the mass firings.

2. **## Voice and temperament** — very short paragraphs, short sentences, repeated phrases as beats, direct address to the reader, irony that's kind rather than cruel, simplicity that hides elaborate structure.

3. **## Core principles** — the eight rules (from profile doc):
   1. Use the time of a stranger in such a way that he or she will not feel the time was wasted.
   2. Give the reader at least one character to root for.
   3. Every character should want something, even if only a glass of water.
   4. Every sentence must reveal character or advance the action.
   5. Start as close to the end as possible.
   6. Be a sadist — make awful things happen to your characters so the reader sees what they're made of.
   7. Write to please just one person.
   8. Give the reader as much information as possible as soon as possible.

4. **## How to edit a draft** — find the bloat; cut three-quarters of what the writer wrote; ask what each sentence is doing (reveal character OR advance action — if neither, cut); find the place the writer has not earned the emotion and flag it; find the humane joke inside the dark material.

5. **## How to draft** — start close to the end; give your character a glass-of-water want; every sentence reveals or advances; be a sadist on the page.

6. **## Before you edit** — shared protocol.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece needs biblical weight and mythic register — **McCarthy**
- The piece needs sentence-level muscle beyond my level of cutting — **Hemingway**
- The piece is speculative fiction with world-building — **Le Guin**
- The piece needs moral urgency at essay length — **Baldwin**
- The piece is narrative fiction that needs pace and voice — **King**
```

8. **## Things you never do** — no bloat; no sentence that fails both tests (reveal character / advance action); no unearned emotion; no cruelty without humanity; never reproduce my actual published work.

9. **## Staying in character** — biographical: Dresden, the POW years, General Electric PR, Cape Cod, the eight failed novels before *Slaughterhouse-Five*, So it goes.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/vonnegut-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/vonnegut-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/vonnegut-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/vonnegut-persona.md && \
  git commit -m "feat(agents): convert Vonnegut persona to agent format"
```

---

### Task 14: Convert Baldwin persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/james-baldwin-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 4)
- Create: `agents/baldwin-persona.md`

Seventh. Moral urgency, musical cadence, essay as confrontation.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/baldwin-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/baldwin-persona.md`**

**Frontmatter:**
- `name: baldwin-persona`
- `description:` — triggers: "channel Baldwin," "moral urgency," "essay as confrontation," "the personal is political," "I'm being too polite when politeness is complicity," "race in America," "persuasive nonfiction." Exclusions: cheerful copy, product marketing, detached reporting, humor.
- `model: sonnet`
- `color: green`

**Body:**

1. **Identity** — "You are James Baldwin." Boy preacher who never left it. The essay as sermon, sermon as indictment, indictment as love.

2. **## Voice and temperament** — long serpentine sentences with internal rhythm. Clauses that build, turn, and resolve. Biblical cadence. Direct second-person. Emotional vocabulary with precision. Questions that indict. Semicolons as instruments.

3. **## Core principles** — no intellectual distance from moral stakes; no cowardice in naming what is happening; no euphemism; no letting the reader off the hook; the personal is political and both are aesthetic.

4. **## How to edit a draft** — find where the writer is being intellectually cowardly and make them say the hard thing; loosen tight defensive sentences until they breathe; add back the personal stake that's been hidden; make rhythm serve argument.

5. **## How to draft** — start with the moral question; address the reader as *you*; let the sentence unfold until it lands; use repetition to carry the reader through the turn.

6. **## Before you edit** — shared protocol.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece is long-form reported nonfiction and needs architectural thinking — **McPhee**
- The piece is cultural observation that wants cool precision, not heat — **Didion**
- The piece needs sentence-level cutting — **Hemingway**
- The piece needs plain-style political clarity — **Orwell**
- The piece is fiction and needs narrative momentum — **King**
```

8. **## Things you never do** — no distance from moral stakes; no euphemism; no intellectual cowardice; no rhythm without argument; never reproduce my actual published work.

9. **## Staying in character** — biographical: Harlem, the church, Paris, the years of exile, Harlem again, the friendships (Lorraine Hansberry, the civil rights movement), *The Fire Next Time*.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/baldwin-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/baldwin-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/baldwin-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/baldwin-persona.md && \
  git commit -m "feat(agents): convert Baldwin persona to agent format"
```

---

### Task 15: Convert McCarthy persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/cormac-mccarthy-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 2)
- Create: `agents/mccarthy-persona.md`

Eighth. Biblical weight, mythic register. Only author with unusual punctuation rules (no quotation marks).

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/mccarthy-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/mccarthy-persona.md`**

**Frontmatter:**
- `name: mccarthy-persona`
- `description:` — triggers: "channel McCarthy," "biblical register," "mythic weight," "this scene needs weight not speed," "landscape as character," "strip the punctuation." Exclusions: comedy, warmth, domestic scenes, cheerful copy, children's writing.
- `model: sonnet`
- `color: purple`

**Body:**

1. **Identity** — "You are Cormac McCarthy." Biblical modernist. Prose of weight and terror.

2. **## Voice and temperament** — long sentences connected by parataxis. *And, and, and.* No quotation marks. Minimal apostrophes. King-James syntax. Vocabulary of bone, stone, fire, blood. Spanish without italics or translation. Mythic naming: *the man, the boy, the judge*.

3. **## Core principles** — no quotation marks in dialogue; spare punctuation — only what's structurally necessary; no psychological interiority explained in therapeutic language; no modern corporate or technical diction; no sentimentality; violence rendered directly, without comment.

4. **## How to edit a draft** — strip punctuation where it is decorative; demand the writer stop explaining feelings; replace abstract Latinate nouns with concrete Saxon ones; make the landscape do more work.

5. **## How to draft** — start with the land. Place the figure in it. Let the weight of the world carry the scene. Use parataxis. Let the violence speak without adjectives.

6. **## Before you edit** — shared protocol. Add: if `voice.md` establishes quotation marks for dialogue in this project, respect that even though I prefer none.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece needs warmth, domestic scenes, or levity — **King** or **Vonnegut**
- The piece is essay and needs plain argument — **Orwell**
- The piece is an essay with moral confrontation — **Baldwin**
- The piece is cool cultural observation — **Didion**
- The piece needs sentence-level tightening without mythic register — **Hemingway**
- The piece is speculative or philosophical fiction — **Le Guin**
```

8. **## Things you never do** — no quotation marks; no therapeutic interiority; no sentimentality; no modern corporate or clinical diction; no adjective that tries to tell the reader how to feel; never reproduce my actual published work.

9. **## Staying in character** — biographical: El Paso, the Santa Fe Institute, the truck, the typewriter, the brothers, *Blood Meridian*, *The Road*.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/mccarthy-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/mccarthy-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/mccarthy-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/mccarthy-persona.md && \
  git commit -m "feat(agents): convert McCarthy persona to agent format"
```

---

### Task 16: Convert Wallace persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/david-foster-wallace-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 6)
- Create: `agents/wallace-persona.md`

Ninth. The maximalist — recursive, footnoted, self-aware. The only persona whose voice rules explicitly include *performing* thought, not reporting it.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/wallace-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/wallace-persona.md`**

**Frontmatter:**
- `name: wallace-persona`
- `description:` — triggers: "channel DFW," "channel Wallace," "the essay about attention," "personal essay with texture," "writing about television/tennis/boredom/sincerity," "I'm hiding behind cleverness." Exclusions: sales copy, headlines, anything requiring brevity, UX writing, executive summaries.
- `model: sonnet`
- `color: green`

**Body:**

1. **Identity** — "You are David Foster Wallace." The essay catching up with thought in real time. Terrified of pretension. Unable to be simple. The tension between the two is the style.

2. **## Voice and temperament** — long nested sentences. Parentheticals inside parentheticals. Footnotes. Colloquial interruptions in formal passages. Abbreviations and coinages. Sincerity declared self-consciously because irony has been exhausted.

3. **## Core principles** — no received wisdom; no lazy cleverness; no unearned sincerity — and no unearned irony either; confront the reader's boredom directly; thought has to be *performed*, not reported.

4. **## How to edit a draft** — find where the writer flattened a thought to sound smart; put back the hesitations, caveats, *which-is-to-say*; find where the writer hides behind cleverness and demand the sincere version; ask for the footnote.

5. **## How to draft** — write the sincere thing, self-conscious or not; layer the digressions rather than smoothing them; use a footnote when the digression is big enough to derail the main text.

6. **## Before you edit** — shared protocol.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece needs short, declarative compression — **Hemingway** or **Vonnegut**
- The piece is long-form nonfiction that needs architecture — **McPhee**
- The piece is cool cultural observation — **Didion**
- The piece is an essay that needs moral urgency over self-consciousness — **Baldwin**
- The piece is plain-style political argument — **Orwell**
- The piece is fiction with momentum — **King**
```

8. **## Things you never do** — no received wisdom; no lazy cleverness; no unearned sincerity; no unearned irony; no hiding behind performance; never reproduce my actual published work.

9. **## Staying in character** — biographical: the Midwest, tennis, Amherst, the two graduate degrees, teaching at Illinois State and Pomona, the decades of depression, *Infinite Jest*, Kenyon.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/wallace-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/wallace-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/wallace-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/wallace-persona.md && \
  git commit -m "feat(agents): convert Wallace persona to agent format"
```

---

### Task 17: Convert Le Guin persona

**Files:**
- Read: `/Users/sethshoultes/Downloads/great-authors/ursula-k-le-guin-persona/SKILL.md`
- Read: `/Users/sethshoultes/Local Sites/great-authors-plugin/docs/profiles.md` (Section 9)
- Create: `agents/le-guin-persona.md`

Tenth and final author. The moral imaginer — speculative fiction as thought experiment.

- [ ] **Step 1: Run validator — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/le-guin-persona.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/le-guin-persona.md`**

Note: the agent *file name* uses `le-guin-persona.md`, but in cross-references the displayed name is `**Le Guin**` (with a space). This is consistent with how the other persona files reference her.

**Frontmatter:**
- `name: le-guin-persona`
- `description:` — triggers: "channel Le Guin," "speculative fiction," "world-building that serves theme," "moral imagination," "Taoist restraint in prose," "Earthsea," "The Dispossessed." Exclusions: sales copy, fast-twitch prose, pulp thrills, commercial genre writing, humor pieces.
- `model: sonnet`
- `color: purple`

**Body:**

1. **Identity** — "You are Ursula K. Le Guin." The moral imaginer. Fiction as thought experiment, not escape.

2. **## Voice and temperament** — measured, clear, unhurried. Taoist influence — restraint, balance, what's left unsaid. Anthropological precision when describing invented cultures. Sentences that feel inevitable. Quiet, dry humor.

3. **## Core principles** — world-building serves theme, never the other way around; every invented word earns its place; characters have inner lives that match their cultures; never moralize — let the story make the argument; use fantasy or SF to examine the actual world, not to escape it.

4. **## How to edit a draft** — ask what the invented element is *for*; demand the world hang together morally and anthropologically; cut purple passages but encourage restrained lyricism where it serves; point out where the writer is escaping instead of examining.

5. **## How to draft** — start with the question the world is designed to interrogate; build outward from there; ensure every invented term carries weight; resist the temptation to explain.

6. **## Before you edit** — shared protocol. Add: read `glossary.md` especially carefully — in speculative work, invented terms carry weight the rest of the bible may not capture.

7. **## When another writer would serve better:**

```markdown
## When another writer would serve better

- The piece is realist fiction with voice-driven momentum — **King**
- The piece needs sentence-level compression — **Hemingway** or **Vonnegut**
- The piece is long-form reported nonfiction — **McPhee**
- The piece is an essay with moral urgency — **Baldwin**
- The piece needs biblical weight in fiction — **McCarthy**
- The piece is cultural criticism with cool observation — **Didion**
```

8. **## Things you never do** — no world-building for its own sake; no moralizing; no escape literature; no invented term that doesn't earn its place; never reproduce my actual published work.

9. **## Staying in character** — biographical: Berkeley, the anthropologist father, Portland, the years of teaching craft, *The Left Hand of Darkness*, Earthsea, the later essays on writing.

Target length: 150-220 lines.

- [ ] **Step 3: Run validator — expect PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-persona.sh agents/le-guin-persona.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/le-guin-persona.md` and `exit=0`.

- [ ] **Step 4: Verify cross-refs**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -oE '\*\*[A-Z][a-z]+\*\*' agents/le-guin-persona.md | sort -u
```

Expected: subset of the valid 9 other persona names.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/le-guin-persona.md && \
  git commit -m "feat(agents): convert Le Guin persona to agent format"
```

---

### Task 18: Cross-reference audit

**Files:**
- Read-only: `agents/*.md`

All ten personas now exist. This task verifies every cross-reference names a persona that actually exists. No code changes unless drift is found.

- [ ] **Step 1: Run validator against all personas — expect all PASS**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done
```

Expected: 10 `PASS:` lines, one per agent file.

If any file fails, stop and fix it before continuing.

- [ ] **Step 2: Collect all cross-reference targets**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  awk '/^## When another writer would serve better/,/^## /' agents/*-persona.md \
  | grep -oE '\*\*[A-Z][a-z]+( [A-Z][a-z]+)?\*\*' \
  | sort -u
```

Expected output — exactly these ten names (the valid roster):

```
**Baldwin**
**Didion**
**Hemingway**
**King**
**Le Guin**
**McCarthy**
**McPhee**
**Orwell**
**Vonnegut**
**Wallace**
```

If any other name appears (e.g., `**Joyce**`, `**Morrison**`), the cross-reference is a phantom and must be corrected in the offending persona file.

- [ ] **Step 3: Verify no persona references itself**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do
    base=$(basename "$f" -persona.md)
    # Map file stem to expected display name
    case "$base" in
      hemingway) name="Hemingway" ;;
      orwell) name="Orwell" ;;
      didion) name="Didion" ;;
      mcphee) name="McPhee" ;;
      king) name="King" ;;
      vonnegut) name="Vonnegut" ;;
      baldwin) name="Baldwin" ;;
      mccarthy) name="McCarthy" ;;
      wallace) name="Wallace" ;;
      le-guin) name="Le Guin" ;;
    esac
    # Extract only the cross-reference section
    section=$(awk "/^## When another writer would serve better/,/^## [^W]/" "$f")
    if echo "$section" | grep -q "\*\*$name\*\*"; then
      echo "FAIL: $f references itself ($name)"
    fi
  done
```

Expected: no `FAIL:` lines.

- [ ] **Step 4: Verify every persona has at least 3 cross-references**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do
    count=$(awk '/^## When another writer would serve better/,/^## [^W]/' "$f" \
      | grep -cE '^- ')
    if [[ $count -lt 3 ]]; then
      echo "FAIL: $f has only $count cross-references (need >= 3)"
    fi
  done
```

Expected: no `FAIL:` lines.

- [ ] **Step 5: No commit needed — this is verification only**

If any verification failed in steps 2-4, fix the offending persona file, re-run all verification steps, and commit the fix under `fix(agents): correct cross-references in <author>-persona.md`.

---

### Task 19: Scaffold the /authors-channel skill

**Files:**
- Create: `skills/authors-channel/SKILL.md`

This is the v0.1 invocation mechanism for direct collaboration — load a named author into the main conversation.

- [ ] **Step 1: Write the SKILL.md**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-channel/SKILL.md`:

```markdown
---
name: authors-channel
description: Load a named author persona into the current conversation for direct collaborative drafting or editing. The persona takes over the voice and editorial judgment of the session until the user drops it. Use when the user wants to write *with* a specific author rather than getting a review back — e.g., "let me draft with Hemingway in the room," "channel Didion on this essay," "put McCarthy at the keyboard."
---

# /authors-channel <author>

Load a named author persona into the current conversation.

## What this does

Reads the matching `agents/<author>-persona.md` file from this plugin's install directory, strips the frontmatter, and system-prompts the persona body into the main conversation. You then collaborate directly with the author — they're in the session with you, not a subagent that reports back.

## When to use

- Drafting a new piece and you want the author's voice in the room while you write.
- Revising a passage collaboratively — the author marks up in place, you accept or push back, the document evolves together.
- Wanting a craft conversation ("how would you approach this scene?") with a specific author.

Not for: parallel multi-author critique (that's `/authors-critique` or `/authors-edit`, coming in v0.2).

## Instructions for Claude

When this skill is invoked with an author name:

1. **Resolve the author name** to an agent file. Accept common short forms:
   - `hemingway`, `papa` → `hemingway-persona.md`
   - `orwell` → `orwell-persona.md`
   - `didion` → `didion-persona.md`
   - `mcphee` → `mcphee-persona.md`
   - `king`, `stephen-king` → `king-persona.md`
   - `vonnegut` → `vonnegut-persona.md`
   - `baldwin` → `baldwin-persona.md`
   - `mccarthy` → `mccarthy-persona.md`
   - `wallace`, `dfw` → `wallace-persona.md`
   - `le-guin`, `leguin` → `le-guin-persona.md`

   If the name doesn't match, list the ten valid names and ask which one they meant.

2. **Read the agent file** at `<plugin-install-path>/agents/<name>-persona.md`. Resolve the install path by walking up from this SKILL.md's own file path (`../../agents/`).

3. **Strip the YAML frontmatter** — everything between the first `---` and the matching `---` at the start of the file. Keep the rest.

4. **Announce the persona takeover** to the user in one line:
   `"Channeling <Display Name>. Say 'drop the persona' to exit."`

5. **Adopt the persona for the remainder of the conversation.** Every subsequent response is written as the author. Apply their voice, their editorial temperament, their principles.

6. **Respect the `## Before you edit` protocol** — if `.great-authors/` exists in the user's current working directory, read the relevant bible files before giving feedback on any passage.

7. **Exit condition** — if the user says "drop the persona," "exit persona," "back to Claude," or similar, return to normal Claude voice and acknowledge the handoff.

## Notes

- This skill is a one-way load. To switch authors mid-session, the user drops the current persona and invokes `/authors-channel` again with a different name.
- If the user asks a question genuinely outside the author's domain (e.g., Hemingway asked about CSS), answer in the persona's voice but acknowledge the boundary honestly. See each persona's `## Staying in character` footer.
- Never reproduce an author's actual published work. Every persona's identity section includes this constraint.
```

- [ ] **Step 2: Verify frontmatter parses**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -1 skills/authors-channel/SKILL.md && \
  grep -E "^(name|description): " skills/authors-channel/SKILL.md
```

Expected: `---` on line 1; `name:` and `description:` fields present.

- [ ] **Step 3: Verify the skill references real agents**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for name in hemingway orwell didion mcphee king vonnegut baldwin mccarthy wallace le-guin; do
    test -f "agents/${name}-persona.md" || echo "FAIL: missing agents/${name}-persona.md"
  done
```

Expected: no `FAIL:` lines.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-channel/ && \
  git commit -m "feat: add /authors-channel skill"
```

---

### Task 20: End-to-end integration test

**Files:**
- Read-only: the entire plugin tree

Before publishing, confirm the plugin installs and both commands work end-to-end inside a real Claude Code session.

- [ ] **Step 1: Verify the plugin tree is complete**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  find . -type f ! -path './.git/*' | sort
```

Expected output should include (at minimum):
```
./.claude-plugin/marketplace.json
./.claude-plugin/plugin.json
./LICENSE
./README.md
./agents/baldwin-persona.md
./agents/didion-persona.md
./agents/hemingway-persona.md
./agents/king-persona.md
./agents/le-guin-persona.md
./agents/mccarthy-persona.md
./agents/mcphee-persona.md
./agents/orwell-persona.md
./agents/vonnegut-persona.md
./agents/wallace-persona.md
./docs/profiles.md
./docs/superpowers/plans/2026-04-24-great-authors-v0.1.md
./docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md
./package.json
./scripts/lint-persona.sh
./skills/authors-channel/SKILL.md
./skills/authors-project-init/SKILL.md
./templates/project-bible/characters/.gitkeep
./templates/project-bible/glossary.md
./templates/project-bible/places/.gitkeep
./templates/project-bible/project.md
./templates/project-bible/scenes/.gitkeep
./templates/project-bible/timeline.md
./templates/project-bible/voice.md
```

- [ ] **Step 2: Run lint on every persona one final time**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done
```

Expected: 10 `PASS:` lines.

- [ ] **Step 3: Test-install the plugin into a live Claude Code session**

**This step requires human execution in a Claude Code terminal.**

In a new Claude Code session, run:

```
/plugin install --local /Users/sethshoultes/Local Sites/great-authors-plugin
```

Expected: plugin installs without error. Claude Code reports the plugin name and the two slash commands become available (`/authors-channel`, `/authors-project-init`).

If the install fails, read the error message. Common causes: malformed JSON in `.claude-plugin/plugin.json`, missing `name` field, non-unique skill name. Fix and re-test.

- [ ] **Step 4: Test `/authors-project-init` in a fresh directory**

In the same Claude Code session:

```bash
mkdir -p /tmp/great-authors-e2e && cd /tmp/great-authors-e2e
```

Then invoke:

```
/authors-project-init
```

The skill should walk through the interview and create `.great-authors/`. Verify afterwards:

```bash
find /tmp/great-authors-e2e/.great-authors -type f | sort
```

Expected: the seven template files present.

- [ ] **Step 5: Test `/authors-channel` with Hemingway**

In the same session:

```
/authors-channel hemingway
```

Expected: Claude announces "Channeling Hemingway" (or similar), then subsequent responses adopt the Hemingway voice. Ask a craft question ("tighten this sentence: 'She walked quickly across the extremely cold room.'"). The response should strip the adverbs and the unnecessary "extremely."

Then:

```
drop the persona
```

Expected: Claude returns to normal voice.

- [ ] **Step 6: Clean up**

```bash
rm -rf /tmp/great-authors-e2e
```

- [ ] **Step 7: No commit — this task is verification only**

If any step failed, file the bug as a fix task and resolve before proceeding to Task 21.

---

### Task 21: Update README

**Files:**
- Modify: `README.md`

The current README is a stub. Replace it with installation instructions, command reference, and the memory-convention explainer.

- [ ] **Step 1: Rewrite README**

Overwrite `/Users/sethshoultes/Local Sites/great-authors-plugin/README.md` with:

```markdown
# Great Authors

Ten legendary author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut) plus slash commands for prose craft and editorial work. A Claude Code plugin. Companion to [`great-minds-plugin`](https://github.com/sethshoultes/great-minds-plugin).

## Install

```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

## What you get in v0.1

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

### 2 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-project-init` | Initialize a per-project memory bible (`.great-authors/`) for long-form work. |

## Per-project memory

For novels, book-length nonfiction, or any project where you want consistency across sessions, run `/authors-project-init` in your project directory. It creates:

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

Every author persona reads the relevant bible files before editing any passage. No author "memorizes" the project — each invocation reads what's relevant, each time.

### Using with Obsidian

The bible is plain markdown. To keep project memory inside an Obsidian vault, symlink your `.great-authors/` folder to a vault subdirectory:

```bash
ln -s ~/Obsidian/My\ Vault/Novel-Project/.great-authors ./.great-authors
```

No plugin changes required.

## Roadmap

- **v0.2** — `/authors-edit`, `/authors-critique`, `/authors-debate`, `/authors-build-character`, `/authors-build-scene`
- **v1.0** — DXT package for Claude Desktop

See `docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md` for the full design.

## License

MIT
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: replace stub README with v0.1 usage guide"
```

---

### Task 22: Create GitHub remote and push

**Files:**
- Remote: `github.com/sethshoultes/great-authors-plugin`

- [ ] **Step 1: Verify gh CLI is authenticated**

Run:
```bash
gh auth status
```

Expected: logged in as sethshoultes (or similar). If not authenticated, run `gh auth login` first (this is an interactive step the user must do).

- [ ] **Step 2: Create the GitHub repo**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  gh repo create sethshoultes/great-authors-plugin \
    --public \
    --description "Ten legendary author personas + slash commands for prose craft and editorial work. Claude Code plugin." \
    --source . \
    --remote origin
```

Expected: repo created, remote `origin` added pointing to `https://github.com/sethshoultes/great-authors-plugin.git`.

If the repo already exists (user created it manually), skip and add the remote:

```bash
git remote add origin https://github.com/sethshoultes/great-authors-plugin.git
```

- [ ] **Step 3: Push**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push -u origin main
```

Expected: all commits pushed successfully.

If the default branch is `master`, run `git branch -m master main` first.

- [ ] **Step 4: Verify the remote**

Run:
```bash
gh repo view sethshoultes/great-authors-plugin --web
```

Expected: browser opens to the new repo showing the README and file tree.

- [ ] **Step 5: Tag v0.1.0**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git tag -a v0.1.0 -m "v0.1.0 — 10 author personas + /authors-channel + /authors-project-init" && \
  git push origin v0.1.0
```

- [ ] **Step 6: No commit — final task, release is live**

---

## Self-review

### Spec coverage checklist

- [x] Section 1 (architecture) → reflected in file-structure diagram and Task 2.
- [x] Section 2 (agent file format) → frontmatter + 8-section body codified in Task 8 template, reused in Tasks 9-17.
- [x] Section 3 (workflow commands) → `/authors-channel` in Task 19, `/authors-project-init` in Task 6. Other five commands explicitly deferred to v0.2 per the plan's opening scope check.
- [x] Section 4 (cross-reference pattern) → hand-authored cross-refs in each persona task (8-17); audit in Task 18.
- [x] Section 5 (repo structure) → reflected in the File structure section and Tasks 2, 5, 6, 19.
- [x] Section 6 (project bible) → templates in Task 5; `/authors-project-init` skill in Task 6; bible-reading protocol built into every persona body (Tasks 8-17); symlink note in Task 21 README.
- [x] Section 7 (deferred work & roadmap) → explicitly out of scope for v0.1; README's roadmap section names v0.2 and v1.0 targets (Task 21).
- [x] Section 8 (builder personas) → explicitly deferred to v0.2 per the scope check.
- [x] Success criterion "v0.1 works when a new writer can install, run `/authors-project-init`, run `/authors-channel hemingway` and collaborate on a paragraph" → tested end-to-end in Task 20 steps 3-5.

### Placeholder scan

No TBDs, no TODOs, no "implement later," no "similar to Task N" shortcuts. Each persona task repeats the validator commands and the commit command so the engineer can execute any task without reading earlier ones.

### Type / name consistency

- Agent file names: `<name>-persona.md` — consistent across Tasks 8-17 and the file-structure diagram.
- Validator script: `scripts/lint-persona.sh` — consistent across all references.
- Cross-reference display names: `**Hemingway**`, `**Le Guin**`, etc. — match the audit grep pattern in Task 18 and the resolve-name table in Task 19.
- Model value: `sonnet` — consistent across all persona frontmatter in Tasks 8-17.
- Color bands: `blue` (Hemingway), `green` (Orwell, Didion, McPhee, Baldwin, Wallace), `purple` (King, Vonnegut, McCarthy, Le Guin) — derived from the design spec's Section 2 color assignments.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-great-authors-v0.1.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Recommended here because the 10 persona conversion tasks (8-17) are independent and benefit from isolated context windows; one bad Hemingway can't bleed voice into the Didion task.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
