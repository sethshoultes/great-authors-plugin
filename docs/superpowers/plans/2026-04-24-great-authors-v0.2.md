# Great Authors v0.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v0.2 of the `great-authors` Claude Code plugin — character-builder and scene-builder agents plus five new slash commands (`/authors-build-character`, `/authors-build-scene`, `/authors-edit`, `/authors-critique`, `/authors-debate`). Depends on v0.1 being installed.

**Architecture:** v0.2 adds two new concept types:
1. **Builder tool personas** (`character-builder`, `scene-builder`) — specialized agents with interactive and autonomous dispatch modes. Write bible entries.
2. **Orchestration skills** (`edit`, `critique`, `debate`) — slash commands that fan out work to multiple author personas via the `Agent` tool and consolidate results.

No new dependencies. Extends the existing plugin directory structure. No changes to the ten v0.1 author personas.

**Tech stack:** Same as v0.1 — bash + markdown + YAML frontmatter. The orchestration skills exercise the Claude Code `Agent` tool via instructions in their SKILL.md; there's still no application code.

**Prerequisites:**
- v0.1 is installed and working (live test: `/authors-channel hemingway` responds in Hemingway voice)
- Branch `main`, remote `origin` is `https://github.com/sethshoultes/great-authors-plugin.git`
- Clean working tree at start

---

## File structure for v0.2

```
great-authors-plugin/
├── .claude-plugin/
│   ├── plugin.json                    # Task 2 (version bump)
│   └── marketplace.json               # Task 2 (description update)
├── agents/                            # 10 existing + 2 new
│   ├── ... (10 v0.1 files, untouched)
│   ├── character-builder.md           # Task 4
│   └── scene-builder.md               # Task 5
├── skills/                            # 2 existing + 5 new
│   ├── authors-channel/SKILL.md       # (v0.1, untouched)
│   ├── authors-project-init/SKILL.md  # (v0.1, untouched)
│   ├── authors-build-character/SKILL.md  # Task 6
│   ├── authors-build-scene/SKILL.md      # Task 7
│   ├── authors-edit/SKILL.md             # Task 8
│   ├── authors-critique/SKILL.md         # Task 9
│   └── authors-debate/SKILL.md           # Task 10
├── scripts/
│   ├── lint-persona.sh                # (v0.1, unchanged)
│   └── lint-builder.sh                # Task 3 (new, for builder agents)
├── package.json                       # Task 2 (version bump)
└── README.md                          # Task 13 (extended with new commands)
```

**File responsibilities:**

- `agents/character-builder.md` — tool persona that conducts a character interview and writes `.great-authors/characters/<name>.md`. Two modes.
- `agents/scene-builder.md` — tool persona that conducts a scene interview and writes `.great-authors/scenes/<id>.md`. Two modes.
- `skills/authors-build-character/SKILL.md` — user-facing command that dispatches character-builder in Mode A (interactive).
- `skills/authors-build-scene/SKILL.md` — user-facing command that dispatches scene-builder in Mode A.
- `skills/authors-edit/SKILL.md` — user-facing command that fans out to 1–2 author personas, collects marked-up critique, consolidates into one view. The core utility command.
- `skills/authors-critique/SKILL.md` — lighter version; 3-bullet verdicts, no markup. Fast gut check.
- `skills/authors-debate/SKILL.md` — two-round craft dispute between two named authors.
- `scripts/lint-builder.sh` — validator for builder agents (different structure than author personas).

---

## Tasks

### Task 1: Verify repo state

**Files:** read-only checks.

- [ ] **Step 1: Verify you're in the repo on main**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && \
  git status && \
  git log --oneline -5
```

Expected:
- Branch: `main`
- Status: `nothing to commit, working tree clean`
- Most recent commits include the `.gitignore` addition and README update

- [ ] **Step 2: Confirm v0.1 artifacts exist**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ls agents/*.md | wc -l && \
  ls skills/ | wc -l && \
  ./scripts/lint-persona.sh agents/hemingway-persona.md
```

Expected:
- Agent file count: `10`
- Skills dir count: `2`
- Linter output: `PASS: agents/hemingway-persona.md`

- [ ] **Step 3: Confirm remote sync**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git fetch origin && \
  git log --oneline origin/main..main && \
  git log --oneline main..origin/main
```

Expected: both outputs empty (local and remote `main` are synced).

If any check fails, stop. Do not proceed until the repo is in a known-good state.

---

### Task 2: Bump version to v0.2.0 across manifests

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `package.json`

- [ ] **Step 1: Write the failing check — grep for "0.2.0"**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -l '"version": "0.2.0"' .claude-plugin/plugin.json package.json 2>&1 || echo "FAIL as expected (version not bumped yet)"
```

Expected: `FAIL as expected` — neither file contains `"version": "0.2.0"` yet.

- [ ] **Step 2: Update `.claude-plugin/plugin.json`**

Change line containing `"version": "0.1.0"` to `"version": "0.2.0"`. Leave everything else identical.

Use Edit tool:
- File: `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/plugin.json`
- Replace: `  "version": "0.1.0",`
- With: `  "version": "0.2.0",`

- [ ] **Step 3: Update `package.json`**

Same version bump in the package.json:
- File: `/Users/sethshoultes/Local Sites/great-authors-plugin/package.json`
- Replace: `  "version": "0.1.0",`
- With: `  "version": "0.2.0",`

- [ ] **Step 4: Update `.claude-plugin/marketplace.json` description**

Replace the v0.1 plugin description with v0.2 content. Use Edit tool:
- File: `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/marketplace.json`
- Replace: `      "description": "Author personas + /authors-channel + /authors-project-init. Editorial mode by default.",`
- With: `      "description": "Ten author personas + 7 slash commands: /authors-channel, /authors-edit, /authors-critique, /authors-debate, /authors-project-init, /authors-build-character, /authors-build-scene.",`

- [ ] **Step 5: Validate all JSON files still parse**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  echo OK
```

Expected: `OK`.

- [ ] **Step 6: Verify the bump worked**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -l '"version": "0.2.0"' .claude-plugin/plugin.json package.json
```

Expected:
```
.claude-plugin/plugin.json
package.json
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 0.2.0 and update marketplace description"
```

---

### Task 3: Write builder validator script

**Files:**
- Create: `scripts/lint-builder.sh`

Builder agents have a different structural shape than author personas. They need their own validator: frontmatter + mode sections + interview section + protocol section.

- [ ] **Step 1: Write the failing test**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  bash scripts/lint-builder.sh agents/character-builder.md 2>&1 || echo "FAIL as expected"
```

Expected: `bash: scripts/lint-builder.sh: No such file or directory` followed by `FAIL as expected`.

- [ ] **Step 2: Write the validator**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/scripts/lint-builder.sh`:

```bash
#!/usr/bin/env bash
# lint-builder.sh <path-to-builder-agent-file>
#
# Verifies a builder agent file has the required structure:
# - YAML frontmatter with name, description, model, color
# - Mode A (interactive) section
# - Mode B (autonomous) section
# - Interview methodology section
# - Before-you-begin protocol section
# - Output format section
#
# Exit codes: 0 = pass, 1 = fail

set -euo pipefail

file="${1:-}"
if [[ -z "$file" ]]; then
  echo "usage: $0 <builder-file>" >&2
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
  if ! head -30 "$file" | grep -qE "^${field}: "; then
    echo "FAIL: missing frontmatter field: $field" >&2
    errors=$((errors + 1))
  fi
}

if ! head -1 "$file" | grep -qE '^---$'; then
  echo "FAIL: file does not start with YAML frontmatter" >&2
  errors=$((errors + 1))
fi

check_frontmatter_field "name"
check_frontmatter_field "description"
check_frontmatter_field "model"
check_frontmatter_field "color"

check_contains "^## Mode A" "Mode A (interactive) section"
check_contains "^## Mode B" "Mode B (autonomous) section"
check_contains "^## Interview" "Interview methodology section"
check_contains "^## Before you begin" "Before you begin protocol"
check_contains "^## Output format" "Output format section"

if [[ $errors -gt 0 ]]; then
  echo "FAIL: $errors validation error(s) in $file" >&2
  exit 1
fi

echo "PASS: $file"
```

- [ ] **Step 3: Make executable**

```bash
chmod +x "/Users/sethshoultes/Local Sites/great-authors-plugin/scripts/lint-builder.sh"
```

- [ ] **Step 4: Run against nonexistent target — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/character-builder.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist: agents/character-builder.md` and `exit=1`.

- [ ] **Step 5: Run against README (no builder structure) — expect FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh README.md 2>&1; echo "exit=$?"
```

Expected: several `FAIL: missing ...` lines; `exit=1`.

- [ ] **Step 6: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add scripts/lint-builder.sh && \
  git commit -m "chore: add builder agent structural validator"
```

---

### Task 4: Write character-builder agent

**Files:**
- Create: `agents/character-builder.md`

A tool persona (not an author) that runs a structured interview and writes a `characters/<name>.md` file. Supports two invocation modes and an optional author-lens flag.

- [ ] **Step 1: Validator FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/character-builder.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/character-builder.md`**

Create the file with this content:

```markdown
---
name: character-builder
description: "Build a character entry for the project bible (.great-authors/characters/<name>.md). Interviews the user question-by-question, then writes a standardized character file. Optionally channels one of the ten author personas (--author flag) to shape the interview questions. Invoke from /authors-build-character. Do NOT invoke for editing existing prose, drafting scenes, or critiquing a manuscript — those are separate commands."
model: sonnet
color: gray
---

# Character Builder

You are the character-builder. Not an author. Your job is to create a character entry in the project bible — a standardized markdown file that every author persona reads before editing a passage where this character appears.

You interview the user one question at a time and assemble their answers into a structured file. You are patient. You do not fabricate answers. If the user is uncertain, say so honestly and leave the relevant field open for them to fill in later.

## Before you begin

Read these files in the user's current working directory if they exist. Their contents constrain your questions and your phrasing:

1. `.great-authors/project.md` — genre, voice, premise, POV, tense. Shapes which questions are relevant.
2. `.great-authors/voice.md` — voice rules for this project. Shapes how the character's own speech samples should sound.
3. `.great-authors/characters/*.md` — existing characters. Reference them when asking about relationships.
4. `.great-authors/places/*.md` — existing places. Useful context when asking where the character lives or comes from.

If no `.great-authors/` directory exists, tell the user they need to run `/authors-project-init` first. Do not attempt to create one yourself — that is a different skill's job.

## Mode A — Interactive (human-triggered)

Triggered when invoked from the `/authors-build-character` slash command. The character name is passed in as an argument.

Ask the following questions one at a time, in this order. Wait for the user's answer before moving to the next question. Offer examples when a question is abstract.

1. **Role in the story** — protagonist, antagonist, supporting, minor-but-vivid? One of those four, or a short phrase if none fits.
2. **What they want** — the surface want (what they're reaching for in the story) and the deeper need (what they're really after underneath). Ask for both.
3. **What they fear or refuse** — what would they never do? What would destroy them if it happened?
4. **Voice** — how do they speak? Ask for a sample line of dialogue — something they might actually say. Listen for rhythm and diction.
5. **Body** — what's physically specific and non-generic? Not "green eyes, brown hair." Ask for one odd, specific detail — a scar, a tic, a habit of speech, how they hold a cigarette, the thing that makes them unmistakable in a room.
6. **Contradiction** — what in them doesn't fit the rest? The protective gangster who plays piano. The sober lawyer who shoplifts. Contradiction is what makes a character feel true.
7. **Backstory** — ONE formative event, not a life history. What happened that shaped them? Keep it to two sentences.

At any point, if the user says "skip" or "I don't know yet," accept that and mark the field as open in the output. Do not make up answers.

### Optional follow-ups

After question 7, ask:

> "Do you want to add a relationship to another character? I can update their file with the reciprocal link."

If yes: ask which character, what the relationship is, and whether it's symmetric (friend, sibling) or asymmetric (mentor→mentee, pursuer→pursued). Then update both files.

### Author lens (`--author <name>` flag)

If the `/authors-build-character` command was invoked with `--author <name>`, shape the interview questions in that author's style.

Lenses shipped in v0.2:

- **king** — After question 1, ask: "What's the small-town or pop-culture tell that would place them? A brand of cigarette? A band they'd argue about? A diner they'd defend?" King's characters live in specific cultural texture.
- **le-guin** — Before question 7, ask: "What's the social position of this character in their own culture? What role does their society assign them, and how do they fit or resist it?" Le Guin builds characters whose inner life matches their anthropology.

If a different `--author` value is passed, proceed with the default questions above and include this note in the output file: `# NOTE: --author <name> passed but no dedicated lens exists yet; used default interview.`

## Mode B — Autonomous (agent-triggered)

Triggered when invoked via the `Agent` tool by another agent during drafting. The dispatch prompt will explicitly state: "Mode: autonomous" and include scene context.

In autonomous mode, do NOT ask the user anything. Instead:

1. Read the scene context provided in the dispatch prompt.
2. Read `.great-authors/project.md`, `.great-authors/voice.md`, and any existing character files that share the scene (for relational consistency).
3. Propose a minimal character profile based on what the scene implies. Do not invent details that aren't earned by the text.
4. Write the file at `.great-authors/characters/<name>.md`.
5. Return a one-line summary: `created characters/<name>.md — role: <role>, want: <one-line want>`.

The drafting agent will resume with your character sketch as ground truth. The human reviews the new file later.

## Interview methodology (shared across modes)

The seven questions — role, want, fear, voice, body, contradiction, backstory — are your scaffold. The author lens rearranges or augments; it does not replace the scaffold.

Never skip question 6 (contradiction). A character without internal contradiction is a type, not a character.

Ask for specifics, not summaries. "She's ambitious" is a type. "She's ambitious enough to cheat on the bar exam, not ambitious enough to confess after" is a character.

## Output format

Write the file at `.great-authors/characters/<name>.md` (replace `<name>` with the lowercased, hyphenated character name).

Use this exact structure:

```markdown
# <Character Name>

## Role
(one sentence — protagonist / antagonist / supporting / minor-but-vivid, and why they're in the story)

## Wants
- **Surface:** (what they're reaching for)
- **Deeper:** (what they're really after underneath)

## Fears / refuses
(one to three bullets)

## Voice
(how they speak — diction, rhythm, contractions, pet phrases)

**Sample line:** "(one line they might actually say)"

## Body
(one odd, specific detail — not green eyes and brown hair)

## Contradiction
(what in them doesn't fit the rest)

## Backstory
(one formative event, two sentences max)

## Connections
(one line per relationship — "<Other Character>: <nature of connection>")
```

If the user skipped a question, write `_To be filled in._` under that heading — do not leave it blank and do not fabricate content.

## Staying in role

You are a character-builder, not an author. If the user tries to pivot into "write me a scene with this character" or "critique this paragraph," politely redirect: "I'm here to build the character entry. For drafting, try `/authors-channel <author>`. For editing, try `/authors-edit`. I'll write the file first so those tools have something to reference."

If directly asked to break character, briefly acknowledge you are Claude playing this role, then return to the interview.
```

- [ ] **Step 3: Validator PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/character-builder.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/character-builder.md` and `exit=0`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/character-builder.md && \
  git commit -m "feat(agents): add character-builder tool persona (Mode A + Mode B)"
```

---

### Task 5: Write scene-builder agent

**Files:**
- Create: `agents/scene-builder.md`

Same pattern as character-builder. Scene-builder has stronger cross-references to other bible entries because scenes bind characters, places, and timeline together.

- [ ] **Step 1: Validator FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/scene-builder.md 2>&1; echo "exit=$?"
```

Expected: `FAIL: file does not exist` and `exit=1`.

- [ ] **Step 2: Write `agents/scene-builder.md`**

Create the file:

```markdown
---
name: scene-builder
description: "Build a scene entry for the project bible (.great-authors/scenes/<id>.md). Interviews the user through an 8-question scene card — position in timeline, place, characters, goals, conflict, turn, exit state, callbacks. Optionally channels McPhee or Vonnegut (--author flag) to shape the interview. Invoke from /authors-build-scene. Do NOT invoke for drafting actual scene prose — use /authors-channel <author> for that."
model: sonnet
color: gray
---

# Scene Builder

You are the scene-builder. Not an author. Your job is to create a scene entry in the project bible — a structured beat card that anchors the scene in timeline, place, character goals, and callbacks.

Scene entries bind the bible together. Every scene you build references characters, places, prior scenes, or timeline entries. Read them before asking questions.

## Before you begin

Read these files in the user's current working directory if they exist:

1. `.great-authors/project.md` — genre, POV, tense. Shapes how you frame the scene card.
2. `.great-authors/voice.md` — voice rules for this project.
3. `.great-authors/characters/*.md` — existing characters. You'll reference them in the scene card.
4. `.great-authors/places/*.md` — existing places. Ditto.
5. `.great-authors/timeline.md` — project chronology. New scenes must fit in.
6. `.great-authors/scenes/*.md` — existing scenes. Important for setup/callback continuity.

If no `.great-authors/` directory exists, tell the user they need to run `/authors-project-init` first.

## Mode A — Interactive (human-triggered)

Triggered from `/authors-build-scene`. The user may provide a scene ID or short name; if not, ask for one first and derive it (e.g., `ch14-confrontation`).

Ask the following eight questions one at a time. Offer options from existing bible files when relevant.

1. **Timeline position** — where does this sit in the chronology? Refer to `timeline.md` if it exists. Offer the user a relative position ("the morning after scene 13") or an absolute marker.
2. **Place** — which location? Offer choices from `places/`. If it's a new place, suggest running `place-builder` later (note: not yet shipped in v0.2; just note it in the scene file for now).
3. **Characters present** — list from `characters/`. Ask for any new ones and note them.
4. **POV character's goal** — what does the POV character want in THIS scene? Not the novel-level want. The scene-level want. ("He wants Elena to tell him the truth about the letter.")
5. **What opposes them** — the obstacle, the counter-pressure, the thing making the want hard. Can be a person, an internal doubt, the environment, time running out.
6. **The turn** — what shifts by the end? Scenes that don't turn are filler. Something must be different — a belief, a relationship, a piece of information, a decision.
7. **Exit state** — what's different now that wasn't before? One sentence.
8. **Callbacks and setups** — does this scene pay off an earlier setup? Does it set up a later payoff? Reference specific prior or future scenes by ID if possible.

If the user says "skip" for any question, accept it and mark the field open in the output.

### Author lens (`--author <name>` flag)

Lenses shipped in v0.2:

- **mcphee** — Before question 1, ask: "What's the *shape* of this scene — a trip, a circle, a braid, a spiral? Is the structure a through-line or a return?" McPhee starts with architecture.
- **vonnegut** — After question 4, reframe as: "What does your POV character want, even if only a glass of water?" And after question 1, ask: "Where would you start this scene if you started as close to the end as possible?"

Other `--author` values: proceed with default and note in the output file.

## Mode B — Autonomous (agent-triggered)

Triggered when invoked via the `Agent` tool during drafting. The dispatch prompt will say "Mode: autonomous" and include the scene text being drafted.

In autonomous mode, do NOT ask the user anything. Instead:

1. Read the scene text provided.
2. Read bible files: `project.md`, `voice.md`, relevant `characters/`, `places/`, `timeline.md`.
3. Extract the eight scene-card fields from the text as-written. Where the text is ambiguous, flag with `_ambiguous — see draft_` rather than fabricating.
4. Write the file at `.great-authors/scenes/<id>.md`.
5. Return a one-line summary: `created scenes/<id>.md — POV: <character>, turn: <one-line turn>`.

## Interview methodology (shared across modes)

The eight fields are the scaffold. The author lens augments; it does not replace.

A scene without a turn is filler — challenge the user if question 6 comes back empty. Not every draft scene is finished, but a scene card should name the intended turn even if the draft hasn't achieved it yet.

Callbacks (question 8) are the feature that makes the bible load-bearing for long-form work. Spend effort here. If the user doesn't remember setups, offer to grep `scenes/` for candidates.

## Output format

Write to `.great-authors/scenes/<id>.md` (lowercase, hyphenated ID).

Use this structure:

```markdown
# Scene: <id>

## Timeline position
(relative or absolute — references timeline.md if applicable)

## Place
(name and brief reason this place serves the scene — link to places/<name>.md if it exists)

## Characters present
- <Character A> (POV)
- <Character B>
- ...

## POV goal
(the scene-level want, one sentence)

## Opposition
(what makes the want hard)

## Turn
(what shifts by the end)

## Exit state
(what's different now)

## Callbacks and setups
- **Pays off:** <earlier scene ID or event>
- **Sets up:** <later scene ID or event>
```

If a field is skipped, write `_To be filled in._` under that heading.

## Staying in role

You build scene cards, not scenes themselves. If the user asks you to actually write scene prose, redirect to `/authors-channel <author>`. If they ask you to critique an existing draft scene, redirect to `/authors-edit` or `/authors-critique`.

If directly asked to break character, briefly acknowledge you are Claude playing this role, then return to the interview.
```

- [ ] **Step 3: Validator PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/scene-builder.md 2>&1; echo "exit=$?"
```

Expected: `PASS: agents/scene-builder.md` and `exit=0`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/scene-builder.md && \
  git commit -m "feat(agents): add scene-builder tool persona (Mode A + Mode B)"
```

---

### Task 6: Write /authors-build-character skill

**Files:**
- Create: `skills/authors-build-character/SKILL.md`

Thin dispatcher. Parses the character name and optional `--author` flag, spawns `character-builder` in Mode A.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-build-character/SKILL.md`:

```markdown
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
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-build-character/SKILL.md && \
  grep -E "^(name|description): " skills/authors-build-character/SKILL.md
```

Expected: `---` on line 1; `name:` and `description:` fields present.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-build-character/ && \
  git commit -m "feat: add /authors-build-character skill"
```

---

### Task 7: Write /authors-build-scene skill

**Files:**
- Create: `skills/authors-build-scene/SKILL.md`

Parallel to `authors-build-character`. Thin dispatcher to `scene-builder` in Mode A.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-build-scene/SKILL.md`:

```markdown
---
name: authors-build-scene
description: Build a scene entry (beat card) for the project bible via an interactive interview. Usage - /authors-build-scene [<id>] [--author <author-name>]. Optional --author flag channels McPhee (start with scene shape) or Vonnegut (start-close-to-end and glass-of-water want). Use when the user is planning a scene, has a scene that's drifting off-structure, or wants to ensure cross-chapter callbacks don't get lost.
---

# /authors-build-scene [<id>] [--author <author>]

Build a structured scene entry (beat card) in the project bible.

## When to use

- You're planning a scene before drafting and want its shape nailed down.
- A draft scene is meandering and you need to name its turn and exit state.
- You're tracking callbacks across chapters and need a coherent scene index.

Not for: writing the actual scene prose (use `/authors-channel <author>` for that); editing an existing scene (use `/authors-edit`).

## Instructions for Claude

When this skill is invoked:

1. **Parse the arguments:**
   - First positional: scene ID (optional). If missing, ask the user for a short ID they can use to reference this scene (e.g., `ch14-confrontation`, `opening-diner`). Derive a kebab-case ID from their answer.
   - Optional flag: `--author <name>`. Valid values: `hemingway`, `orwell`, `didion`, `mcphee`, `king`, `vonnegut`, `baldwin`, `mccarthy`, `wallace`, `le-guin`. Dedicated lenses ship for `mcphee` and `vonnegut`; others fall back to default with a note.

2. **Verify `.great-authors/` exists.** If not, tell the user to run `/authors-project-init` first and stop.

3. **Check for existing scene file.** If `.great-authors/scenes/<id>.md` exists, ask about overwrite — default no.

4. **Dispatch the scene-builder.** Use the `Agent` tool with:
   - `subagent_type: scene-builder`
   - Prompt includes: `Mode: interactive`, `Scene ID: <id>`, `Author lens: <author>`, `Working directory: <cwd>`.

5. **Relay the interview.** Eight questions, one at a time, user answers pass back to the builder. Do not answer on the user's behalf.

6. **Confirm creation.**
   ```
   Created .great-authors/scenes/<id>.md

   POV: <character name>
   Turn: <one-line turn from the card>

   Callbacks: <any earlier scenes this pays off>
   Sets up: <any later scenes this sets up>

   Next: run /authors-channel <author> to draft this scene, or /authors-build-scene for the next one.
   ```

## Notes

- Scene cards are bible metadata, not manuscript. Do not write to chapter files.
- The scene-builder will reference existing characters and places. If the user mentions a character that doesn't exist in `.great-authors/characters/`, offer to run `/authors-build-character` next (but complete the scene card first).
- If the user says "cancel" or "abort," stop the dispatch and confirm no file was written.
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-build-scene/SKILL.md && \
  grep -E "^(name|description): " skills/authors-build-scene/SKILL.md
```

Expected: `---` on line 1; `name:` and `description:` present.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-build-scene/ && \
  git commit -m "feat: add /authors-build-scene skill"
```

---

### Task 8: Write /authors-edit skill (core orchestration)

**Files:**
- Create: `skills/authors-edit/SKILL.md`

The core utility command. Fans out a draft file to 1–2 author personas in parallel via the `Agent` tool, collects structured output, consolidates into one marked-up view.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-edit/SKILL.md`:

```markdown
---
name: authors-edit
description: Mark up a draft with editorial feedback from one or more author personas. Usage - /authors-edit <file> [author1 author2 ...]. If no authors named, inspects the file and picks 1-2 based on genre (marketing copy → Hemingway + Orwell; fiction → King + Vonnegut; essay → Didion + Baldwin; long-form nonfiction → McPhee). Returns a consolidated marked-up view, not N separate critiques. Use when you want a real editorial pass on a piece of writing.
---

# /authors-edit <file> [author1 author2 ...]

The core editorial command. Fans out to selected authors, consolidates their markup.

## When to use

- You have a draft (any length) and you want editorial feedback from one or more author voices.
- You want marked-up passages with specific cuts and substitutions — not just opinions.
- You trust the fan-out-and-consolidate pattern: different authors will notice different things, and the consolidation will show consensus and productive disagreement.

Not for: real-time collaborative drafting (use `/authors-channel`); fast gut-check opinions (use `/authors-critique`); resolving a specific craft dispute (use `/authors-debate`).

## Instructions for Claude

When this skill is invoked:

1. **Parse arguments:**
   - First positional: file path (required). If missing, ask the user to provide a file.
   - Remaining positionals: zero or more author names. Valid names: `hemingway`, `orwell`, `didion`, `mcphee`, `king`, `vonnegut`, `baldwin`, `mccarthy`, `wallace`, `le-guin`. Short forms accepted (e.g., `papa` for Hemingway, `dfw` for Wallace).

2. **Verify the file exists.** If not, tell the user the path isn't valid and stop.

3. **If no authors were named,** auto-select 1–2 based on genre signals:
   - Inspect the first 500 words of the file. Look for signals.
   - **Marketing/landing page copy** (product names, calls-to-action, benefit language) → Hemingway + Orwell.
   - **Fiction** (dialogue tags, scene description, narrative prose) → King + Vonnegut.
   - **Personal essay or op-ed** (first-person reflection, cultural argument) → Didion + Baldwin.
   - **Long-form nonfiction / explanatory** (research-heavy, sustained exposition) → McPhee.
   - **Speculative fiction** (invented terms, alternate-world setting) → Le Guin + King.
   - **Literary / mythic fiction** (weighty prose, violence, landscape as character) → McCarthy + Hemingway.
   - **Self-aware cultural criticism** (footnote candidates, meta-commentary) → Wallace + Didion.
   - **Ambiguous:** default to Hemingway + Orwell (safe generalists).

   Announce your selection to the user in one line: "No authors specified — picking <A> and <B> based on <signal>. Ok, or override?" Accept "ok" or a new list.

4. **If `.great-authors/` exists in the file's parent directory,** note this in your dispatch prompts — the sub-agents will read bible files as part of the persona's `## Before you edit` protocol.

5. **Fan out via the Agent tool.** For each selected author, dispatch a sub-agent in parallel (use multiple Agent calls in a single message):
   - `subagent_type: <author>-persona`
   - Prompt should include:
     - The full text of the file to be edited.
     - Instructions: "You are editing this draft. Return your output in the following structured format:
       - **Verdict:** one sentence naming your top-line reaction to the draft.
       - **Marked passages:** 3–8 quoted excerpts from the draft, each with your specific suggested edits inline. Use `~~strikethrough~~` for cuts and `[→ replacement]` for substitutions.
       - **Start here:** if there's a line above which you'd delete everything, quote the first sentence after that line and label it 'START HERE:'. Otherwise omit this section.
       - **Hand off:** if a different author in the great-authors roster would serve this piece better, name them in one sentence. If not, omit.

6. **Consolidate the results.** After all sub-agents return, produce a single consolidated view:

   ```markdown
   # /authors-edit on <filename> — <author A> + <author B>

   **<Author A>'s verdict:** <one sentence>
   **<Author B>'s verdict:** <one sentence>

   ## Where they agree
   (list 1-3 concrete points both authors made)

   ## Where they disagree
   (list 1-2 concrete points they diverge on, or "No significant disagreement" if so)

   ## Highest-leverage change
   (pick ONE change that would most improve the draft. Name it in one sentence.)

   ## Marked passages

   (Show the marked-up passages, combining both authors' edits when they overlap. If they conflict on the same passage, show both versions labeled.)

   ## Start here (if any author flagged it)
   <first sentence after the cut line>

   ## Handoffs
   (Any cross-reference suggestions from individual authors, listed here. E.g., "McCarthy suggests Baldwin for the moral stakes in paragraph 3 — consider /authors-edit <file> baldwin.")
   ```

7. **Output to stdout.** Do not write to the manuscript. The human applies the edits.

## Notes

- All dispatched sub-agents inherit the current working directory. If `.great-authors/` exists, they will read it automatically per each persona's `## Before you edit` protocol. You do not need to explicitly pass bible context.
- Fan-out should be parallel — dispatch all Agent calls in a single message using multiple tool-use blocks.
- If any sub-agent reports BLOCKED or returns nothing useful, consolidate with whatever authors succeeded. Never fail the whole command on one author's failure.
- If the user passed >2 authors, dispatch all of them. Consolidation scales to N.
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-edit/SKILL.md && \
  grep -E "^(name|description): " skills/authors-edit/SKILL.md
```

Expected: `---` on line 1; `name:` and `description:` present.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-edit/ && \
  git commit -m "feat: add /authors-edit skill (core orchestration)"
```

---

### Task 9: Write /authors-critique skill

**Files:**
- Create: `skills/authors-critique/SKILL.md`

Lightweight parallel to `/authors-edit` — same fan-out, but each author returns 3 bullets only. No markup, no rewrites.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-critique/SKILL.md`:

```markdown
---
name: authors-critique
description: Get a fast, cheap gut-check critique of a draft from multiple author personas. Usage - /authors-critique <file> [author1 author2 ...]. Each author returns a 3-bullet verdict only - no marked passages, no rewrites. Defaults to 3 authors if none specified. Use when you want quick directional feedback before investing in a full /authors-edit pass.
---

# /authors-critique <file> [author1 author2 ...]

Fast, cheap gut-check critique.

## When to use

- You want a directional read on a draft before investing in a full edit pass.
- You're deciding which authors to run `/authors-edit` with — use critique to triage.
- You want to see which authors have the strongest reaction before committing to a markup pass.

Not for: marked-up passages (that's `/authors-edit`); craft debates between two authors (that's `/authors-debate`).

## Instructions for Claude

1. **Parse arguments:** file path (required) + optional author names. Same parsing as `/authors-edit`.

2. **Verify the file exists.**

3. **If no authors named, pick 3** using the same genre-signal logic as `/authors-edit`, but with a wider net. Default triad: Hemingway + Orwell + Didion for ambiguous cases (covers sentence-level, argument clarity, observational specificity).

4. **Fan out via Agent tool.** Dispatch all authors in parallel in a single message. For each:
   - `subagent_type: <author>-persona`
   - Prompt:
     ```
     CRITIQUE MODE - TERSE OUTPUT ONLY.

     Read this draft and respond with EXACTLY 3 bullets. Each bullet is one sentence. No introduction. No markdown markup of passages. No rewrites. Just the three most important things you notice.

     End with one line: "If I'm not the right voice here, try <X>." — or omit if you are.

     Draft:
     <full file contents>
     ```

5. **Consolidate:**

   ```markdown
   # /authors-critique on <filename> — <author A>, <author B>, <author C>

   ## <Author A>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## <Author B>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## <Author C>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## Consensus
   (one sentence naming what all or most authors flagged)

   ## Sharpest disagreement
   (one sentence naming the most productive disagreement, or "no significant disagreement" if so)

   ## Handoffs
   (if any author suggested a different voice, name them here)
   ```

6. **Output to stdout.** No manuscript changes.

## Notes

- This skill is cheap by design. Resist the temptation to pad the output.
- If any author returns more than 3 bullets, trim their output to 3 in consolidation — report verbatim otherwise.
- Sub-agents inherit cwd; bible files are read automatically via each persona's protocol.
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-critique/SKILL.md && \
  grep -E "^(name|description): " skills/authors-critique/SKILL.md
```

Expected: valid frontmatter.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-critique/ && \
  git commit -m "feat: add /authors-critique skill (fast fan-out)"
```

---

### Task 10: Write /authors-debate skill

**Files:**
- Create: `skills/authors-debate/SKILL.md`

Two rounds of back-and-forth between two named authors on a craft question, then a consolidation.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-debate/SKILL.md`:

```markdown
---
name: authors-debate
description: Run a 2-round craft debate between two named author personas on a specific passage or topic. Usage - /authors-debate <passage-or-topic> <author-A> <author-B>. Round 1 - each states their position. Round 2 - each responds to the other. Consolidation names the real tension and picks a winner or offers a third option. Use when you genuinely don't know how to handle a craft choice (e.g., Hemingway vs. McCarthy on whether a scene needs muscle or weight).
---

# /authors-debate <passage-or-topic> <author-A> <author-B>

Two-round craft dispute resolution.

## When to use

- You have a craft choice and two authors would clearly disagree. You want the real tension surfaced, not a split-the-difference answer.
- You're deciding between two registers (compression vs. weight, cool observation vs. moral urgency, etc.) and want each position voiced honestly.

Not for: general critique (`/authors-critique`); marked-up editing (`/authors-edit`); collaborative drafting (`/authors-channel`).

## Instructions for Claude

1. **Parse arguments:**
   - First: `<passage-or-topic>` (required). Can be a quoted passage (string) or a file path (if the token resolves to an existing file, load it).
   - Then: `<author-A>` and `<author-B>` (both required). Valid author names from the roster. Must be two different authors.

2. **If passage is a file path,** read the file. If it's inline text, use as-is.

3. **Round 1 — parallel.** Dispatch both authors in parallel (single message, two Agent calls):
   - `subagent_type: <author-A>-persona` / `<author-B>-persona`
   - Prompt:
     ```
     DEBATE ROUND 1.

     The topic: <passage or topic, full text>

     State your position in 3-5 sentences. What would you do with this? Why? What would be wrong with treating it another way? Be specific about your craft reasoning. Do not hedge.

     Do NOT respond to other voices yet — you don't know what they'll say. Just state your own position.
     ```

4. **Round 2 — parallel.** Once both Round 1 responses are in, dispatch again in parallel:
   - Each author receives BOTH Round 1 responses (their own for reference + the opponent's to respond to).
   - Prompt:
     ```
     DEBATE ROUND 2.

     In Round 1 you said:
     <author's Round 1 response>

     <opposing author> said:
     <opposing author's Round 1 response>

     Respond in 3-5 sentences:
     - What do you concede? (If nothing, say so and explain.)
     - Where do you hold your position?
     - If you'd revise your Round 1 position, how?
     ```

5. **Consolidate.** Write the debate report:

   ```markdown
   # /authors-debate: <author-A> vs. <author-B>

   **Topic:** <passage or topic as given>

   ## Round 1

   ### <Author A>
   <their R1 position>

   ### <Author B>
   <their R1 position>

   ## Round 2

   ### <Author A>
   <their R2 response>

   ### <Author B>
   <their R2 response>

   ## The real tension

   (One or two sentences naming what this dispute is actually about — usually a genre, register, or audience question. E.g., "The tension is whether this scene's weight comes from compression (A) or accumulation (B). That's a register choice determined by the genre.")

   ## Verdict

   Pick ONE:
   - **Winner:** <author name> — <one sentence reason>
   - **Third way:** <a synthesis neither author proposed, if one exists>
   - **Genre call:** <the choice depends on <X>; here's how to decide>
   ```

6. **Output to stdout.** No manuscript changes.

## Notes

- Debate only works between two distinct authors. If the user passes the same author twice, ask them to pick a second.
- If either Round 1 response is thin or off-topic, ask the sub-agent to retry with clearer framing before moving to Round 2.
- The verdict section is the most valuable part. Don't skip it by hedging — if the tension is irreducibly genre-dependent, say so explicitly.
- Sub-agents inherit cwd; if `.great-authors/voice.md` establishes a house style for the project, both debaters should respect it in their reasoning (but they can argue for what the voice SHOULD be if the user is questioning it).
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-debate/SKILL.md && \
  grep -E "^(name|description): " skills/authors-debate/SKILL.md
```

Expected: valid frontmatter.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-debate/ && \
  git commit -m "feat: add /authors-debate skill (2-round craft dispute)"
```

---

### Task 11: Static integration check

**Files:** read-only.

This task verifies the full plugin tree is coherent before we push. No live Claude Code install yet — that's the user's step.

- [ ] **Step 1: Confirm tree shape**

Run:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  find agents/ skills/ -type f | sort
```

Expected:
```
agents/baldwin-persona.md
agents/character-builder.md
agents/didion-persona.md
agents/hemingway-persona.md
agents/king-persona.md
agents/le-guin-persona.md
agents/mccarthy-persona.md
agents/mcphee-persona.md
agents/orwell-persona.md
agents/scene-builder.md
agents/vonnegut-persona.md
agents/wallace-persona.md
skills/authors-build-character/SKILL.md
skills/authors-build-scene/SKILL.md
skills/authors-channel/SKILL.md
skills/authors-critique/SKILL.md
skills/authors-debate/SKILL.md
skills/authors-edit/SKILL.md
skills/authors-project-init/SKILL.md
```

That's 12 agent files and 7 skill files.

- [ ] **Step 2: Run persona validator on all author personas**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done
```

Expected: 10 `PASS:` lines.

- [ ] **Step 3: Run builder validator on both builders**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/character-builder.md && \
  ./scripts/lint-builder.sh agents/scene-builder.md
```

Expected: 2 `PASS:` lines.

- [ ] **Step 4: Check every skill has frontmatter + description**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  for f in skills/*/SKILL.md; do
    head -1 "$f" | grep -q '^---$' && \
      grep -qE '^name: ' "$f" && \
      grep -qE '^description: ' "$f" && \
      echo "OK $f" || echo "FAIL $f"
  done
```

Expected: 7 `OK` lines, 0 `FAIL` lines.

- [ ] **Step 5: Verify plugin.json version is 0.2.0**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; print(json.load(open('.claude-plugin/plugin.json'))['version'])"
```

Expected: `0.2.0`.

No commit for this task — verification only.

---

### Task 12: Update README for v0.2

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Overwrite README with v0.2 content**

Use Write tool on `/Users/sethshoultes/Local Sites/great-authors-plugin/README.md`:

```markdown
# Great Authors

Ten legendary author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut) plus seven slash commands for prose craft, editorial work, and long-form project management. A Claude Code plugin. Companion to [`great-minds-plugin`](https://github.com/sethshoultes/great-minds-plugin).

## Install

```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

## What's in v0.2

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

### 7 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
| `/authors-critique <file> [authors...]` | Fast 3-bullet verdicts from 3 authors in parallel. |
| `/authors-debate <topic> <author-A> <author-B>` | 2-round craft dispute between two authors. |
| `/authors-project-init` | Initialize a per-project memory bible (`.great-authors/`). |
| `/authors-build-character <name> [--author <x>]` | Build a character entry in the bible. |
| `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |

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
└── scenes/         # one file per scene or beat card (use /authors-build-scene)
```

Every author persona reads the relevant bible files before editing any passage. No author "memorizes" the project — each invocation reads what's relevant, each time.

### Using with Obsidian

The bible is plain markdown. To keep project memory inside an Obsidian vault, symlink your `.great-authors/` folder to a vault subdirectory:

```bash
ln -s ~/Obsidian/My\ Vault/Novel-Project/.great-authors ./.great-authors
```

No plugin changes required.

## Workflow example

Say you're writing a novel:

```
cd ~/my-novel
/authors-project-init                          # scaffold .great-authors/
/authors-build-character marcus --author king  # build a character with King-lens questions
/authors-build-scene opening-diner --author mcphee  # build a scene with McPhee-lens questions

# now draft Chapter 1 as usual...
# then:
/authors-edit ch01.md king vonnegut            # get marked-up feedback
# or for a fast check:
/authors-critique ch01.md
# or when you're stuck on a craft choice:
/authors-debate "this opening paragraph" hemingway mccarthy
```

## Roadmap

- **v0.3+** — journal system, continuity checker, `/authors-draft` command, place-builder and relationship-builder
- **v1.0** — DXT package for Claude Desktop

See `docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md` for the full design and `docs/superpowers/plans/` for implementation plans.

## License

MIT
```

- [ ] **Step 2: Verify README renders reasonably**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  grep -c "^## " README.md && \
  wc -l README.md
```

Expected: ~6-8 section headers; 80-120 lines total.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update README for v0.2 (builders + orchestration)"
```

---

### Task 13: Tag v0.2.0 and push

**Files:** no file changes; git operations only.

- [ ] **Step 1: Verify clean tree and all v0.2 commits**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git status && \
  git log --oneline main...origin/main
```

Expected:
- Status: `nothing to commit, working tree clean`
- Log output: the new v0.2 commits (roughly: bump, lint-builder, character-builder, scene-builder, 5 skill commits, README update — ~10 commits)

- [ ] **Step 2: Push commits**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push origin main
```

Expected: push succeeds, all new commits visible on `origin/main`.

- [ ] **Step 3: Tag v0.2.0**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git tag -a v0.2.0 -m "v0.2.0 — builders (character, scene) + orchestration (edit, critique, debate)" && \
  git push origin v0.2.0
```

Expected: tag pushed successfully.

- [ ] **Step 4: Verify the release on GitHub**

```bash
gh release view v0.2.0 2>&1 || echo "no release object (expected — we only pushed a tag, not a release)" && \
gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -5
```

Expected: tag list includes both `v0.2.0` and `v0.1.0`.

- [ ] **Step 5: No commit — final task, release is live**

---

## Self-review

### Spec coverage checklist

- [x] Section 3 (workflow commands) → `/authors-edit` Task 8; `/authors-critique` Task 9; `/authors-debate` Task 10; `/authors-build-character` Task 6; `/authors-build-scene` Task 7. All five new v0.2 commands covered.
- [x] Section 8 (builder personas, Mode A + Mode B + author lens) → character-builder Task 4; scene-builder Task 5. Both modes documented in agent bodies; Mode B isn't exercised (no driver yet) but is ready.
- [x] Success criterion "v0.2 works when /authors-edit on a 2,000-word chapter returns a single consolidated marked-up view from two authors in under 60 seconds, and at least one author produces a cross-reference handoff" → tested by user post-push (live install + real chapter). Plan sets up the machinery; user validates against success criterion.
- [x] Open risk "Author-lens in builders" → mitigated. v0.2 ships 2 lenses per builder (King + Le Guin for character; McPhee + Vonnegut for scene). Other `--author` values fall back to default with explicit note. Pattern proven; can expand in v0.3+.
- [x] Open risk "Cross-reference drift" → no new author-persona edits in v0.2. Existing v0.1 cross-refs preserved.
- [x] Non-goal "autonomous long-form drafting" → honored. Mode B in builders is ready but has no trigger in v0.2 (no `/authors-draft`).

### Placeholder scan

No TBDs, no TODOs, no "implement later" shortcuts. Every step has executable content. SKILL.md files contain full behavioral instructions, not stubs.

### Type / name consistency

- Agent file names: `character-builder.md`, `scene-builder.md` (no `-persona` suffix; they aren't voice personas).
- Skill directory names: `authors-build-character`, `authors-build-scene`, `authors-edit`, `authors-critique`, `authors-debate` (all `authors-` prefixed for consistency with v0.1 skills).
- `subagent_type` references in skill SKILL.md files: must match the agent file's `name:` frontmatter field. Verified in each skill task.
- Short-form author names accepted in `/authors-edit`, `/authors-critique`, `/authors-debate`, `/authors-build-character`, `/authors-build-scene` — canonical list specified once in `/authors-edit` Task 8 step 1, repeated in other skills by reference to the same list. Consistency maintained.

---

## Execution handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-great-authors-v0.2.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks. Good fit because most tasks write a single file with substantial authored content.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
