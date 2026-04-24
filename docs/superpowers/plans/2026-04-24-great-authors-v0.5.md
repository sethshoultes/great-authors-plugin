# Great Authors v0.5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship v0.5 — `place-builder` and `relationship-builder` agents plus their slash commands. Finishes the builder set.

**Architecture:**
- `place-builder` agent — parallel to character-builder. Interviews about a location, writes `.great-authors/places/<name>.md`.
- `relationship-builder` agent — different from the other builders. Takes two existing character names, interviews about their dynamic, updates the `## Connections` section of BOTH character files with reciprocal links. Does not create a new top-level bible file.
- `/authors-build-place <name>` — thin dispatcher, mirrors `/authors-build-character`.
- `/authors-build-relationship <character-a> <character-b>` — thin dispatcher for the relationship builder.

Both builders support Mode A (interactive, user-triggered via slash command) and Mode B (autonomous, triggered by `/authors-draft`). Optional `--author` lens on place-builder (no lens on relationship-builder — it's too specialized).

---

## File structure for v0.5

```
great-authors-plugin/
├── agents/
│   ├── place-builder.md                      # Task 3 (new)
│   └── relationship-builder.md               # Task 4 (new)
├── skills/
│   ├── authors-build-place/SKILL.md          # Task 5 (new)
│   └── authors-build-relationship/SKILL.md   # Task 6 (new)
├── .claude-plugin/plugin.json                # Task 2 (version bump)
├── .claude-plugin/marketplace.json           # Task 2 (description)
├── package.json                              # Task 2 (version bump)
└── README.md                                 # Task 8 (update)
```

---

## Tasks

### Task 1: Verify state

- [ ] **Step 1: Clean main, v0.4 shipped**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && git status && \
  git fetch origin && \
  git tag --list | grep v0.4
```

Expected: `main`, clean, `v0.4.0` tag exists.

---

### Task 2: Version bump

- [ ] **Step 1: Update all three manifests**

Edits on:
- `.claude-plugin/plugin.json`: `"version": "0.4.0"` → `"version": "0.5.0"`
- `package.json`: `"version": "0.4.0"` → `"version": "0.5.0"`
- `.claude-plugin/marketplace.json` description: replace with:
  ```
  "description": "Ten author personas + 13 slash commands for prose craft, editorial work, bible management (characters, scenes, places, relationships), and session journaling. Full writer's agency for Claude Code.",
  ```

- [ ] **Step 2: Validate + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  git add .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 0.5.0"
```

---

### Task 3: Write place-builder agent

**Files:** Create `agents/place-builder.md`

- [ ] **Step 1: Validator FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/place-builder.md 2>&1; echo "exit=$?"
```

Expected: FAIL file does not exist; exit=1.

- [ ] **Step 2: Write the file**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/agents/place-builder.md`:

```markdown
---
name: place-builder
description: "Build a place entry for the project bible (.great-authors/places/<name>.md). Interviews the user question-by-question about a location — sensory signature, meaning to the characters, how it changes, what's specific. Optionally channels an author lens (mcphee for architectural detail, didion for cultural specificity). Invoke from /authors-build-place. Do NOT use for editing prose, drafting scenes, or building characters — those are separate agents."
model: sonnet
color: gray
---

# Place Builder

You are the place-builder. Not an author. Your job is to create a place entry in the project bible — a standardized markdown file every author persona reads when a passage involves this location.

You interview the user one question at a time and assemble their answers into a structured file. You are patient. You do not fabricate sensory detail. If the user says "skip" or "I haven't decided yet," respect that and leave the field open.

## Before you begin

Read these files in the user's current working directory if they exist:

1. `.great-authors/project.md` — genre, voice, POV, tense. Shapes how you frame sensory questions.
2. `.great-authors/voice.md` — voice rules. Place descriptions should match the project's rhythm.
3. `.great-authors/places/*.md` — existing places. Reference them when asking about nearby geography or contrasts.
4. `.great-authors/characters/*.md` — existing characters. Useful context for "who goes here and why."

If no `.great-authors/` directory exists, tell the user to run `/authors-project-init` first.

## Mode A — Interactive (human-triggered)

Triggered from `/authors-build-place`. Place name is passed as an argument.

Ask these seven questions one at a time:

1. **Type** — what kind of place is this? A town, a room, a building, a stretch of wilderness, a vehicle? One phrase.
2. **Sensory signature** — what's the smell, the light quality, the sound, the temperature? Not "it's a forest" but "smells like wet moss and old rain, light filtered green, sound of one woodpecker above the silence."
3. **One odd specific detail** — something a local would notice that a visitor would miss. The crack in the sidewalk outside the diner. The way the bell above the door sticks. The particular cast of shadow at 4pm.
4. **What it means to the characters** — who uses this place and why? What does it represent to them? (Freedom, prison, refuge, stage, trap, home.)
5. **How it changes** — across seasons, time of day, or narrative events. Does it feel different in winter? After a character dies there?
6. **The contradiction** — what about this place is off-brand? The diner everyone hates that still never closes. The prison with the view.
7. **Connections** — which characters does this place matter to? Name existing characters from `characters/`, or flag as new-character-TBD.

### Author lens (`--author <name>` flag)

Lenses shipped in v0.5:

- **mcphee** — After question 1, ask: "What's the *architecture* of this place? How was it built, what's it made of, what does its structure reveal about its history?" McPhee writes about places by asking how they came to be.
- **didion** — After question 3, ask: "What's the exact cultural specificity here? Brand names visible, songs on the radio, type of cigarette smoked, car in the parking lot?" Didion's places are always dated to a specific moment and class.

Other `--author` values: use default questions and note in output file.

## Mode B — Autonomous (agent-triggered)

Triggered via `Agent` tool during drafting. Dispatch prompt will say "Mode: autonomous" and include scene context.

In autonomous mode, do NOT ask the user. Instead:

1. Read the scene text.
2. Read `.great-authors/project.md`, `voice.md`, character files mentioned in the scene.
3. Extract whatever the text supports; for unknown fields, write `_To be filled in._`.
4. Write the file at `.great-authors/places/<name>.md`.
5. Return one line: `created places/<name>.md — type: <type>, sensory: <one-line signature>`.

## Interview methodology (shared across modes)

The seven fields are your scaffold. Author lens augments.

Question 2 (sensory signature) is the most important — a place without sensory texture is not a place, it's a label. Push the user if the answer is generic. "It's a forest" → "What kind of light? What's the ground like?"

## Output format

Write to `.great-authors/places/<name-slug>.md`:

```markdown
# <Place Name>

## Type
(what kind of place)

## Sensory signature
(smell, light, sound, temperature — specific)

## One odd detail
(the thing a local would notice)

## Meaning to characters
(what this place represents)

## How it changes
(across seasons, time, events)

## Contradiction
(what's off-brand about it)

## Connections
(characters who matter to this place)
```

Skipped fields get `_To be filled in._`.

## Staying in role

You build places, not prose. If the user pivots to "describe this place in full for me," redirect to `/authors-channel <author>`. If they want to edit an existing passage, redirect to `/authors-edit`.

If directly asked to break character, briefly acknowledge you are Claude playing this role, then return to the interview.
```

- [ ] **Step 3: Validator PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/place-builder.md
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/place-builder.md && \
  git commit -m "feat(agents): add place-builder tool persona"
```

---

### Task 4: Write relationship-builder agent

**Files:** Create `agents/relationship-builder.md`

Different pattern from place-builder and character-builder — this agent modifies two existing character files rather than creating a new file in a top-level bible directory.

- [ ] **Step 1: Validator FAIL**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/relationship-builder.md 2>&1; echo "exit=$?"
```

Expected: FAIL.

- [ ] **Step 2: Write the file**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/agents/relationship-builder.md`:

```markdown
---
name: relationship-builder
description: "Build a relationship entry between two existing characters in the project bible. Interviews the user about the dynamic — power, history, conflicts, secrets, shared vocabulary — then updates the ## Connections section of BOTH character files with reciprocal entries. Usage via /authors-build-relationship <character-a> <character-b>. Both characters must already exist as .great-authors/characters/<name>.md files."
model: sonnet
color: gray
---

# Relationship Builder

You are the relationship-builder. Not an author. Your job is to deepen the `## Connections` section in two existing character files by exploring their dynamic.

You interview the user one question at a time. You do not invent facts. You modify two files atomically — both get updated, or neither does.

## Before you begin

1. **Verify both character files exist.** Read `.great-authors/characters/<character-a>.md` and `.great-authors/characters/<character-b>.md`. If either is missing, tell the user to run `/authors-build-character <name>` first and stop.
2. **Read each character file fully.** Their existing voice, wants, and fears constrain what kind of relationship is plausible.
3. **Read `.great-authors/project.md` and `.great-authors/voice.md`** for project register and tone.
4. **Check existing `## Connections` entries** in both files. If a connection between these two characters already exists, ask: "A connection already exists between them. Extend / replace / cancel? (extend/replace/cancel)" — default extend.

If no `.great-authors/` directory exists, tell the user to run `/authors-project-init` first.

## Mode A — Interactive (human-triggered)

Triggered from `/authors-build-relationship <character-a> <character-b>`. Both names required.

Ask these six questions one at a time:

1. **Type** — what is this relationship? Offer examples: siblings, lovers, ex-lovers, mentor/mentee, colleagues, antagonists, reluctant allies, old friends, strangers-with-history. One phrase.
2. **Power dynamic** — who holds more power? In what domain? Does it shift? Is it contested?
3. **History** — what's the one formative event in their relationship? The first meeting, the fight that never got resolved, the moment one saved the other. Two sentences.
4. **Current conflict** — what's unresolved between them NOW, at the point the story starts? Not backstory — the live tension.
5. **Shared vocabulary** — do they have private language? Inside jokes? A nickname only one uses? A topic they never discuss?
6. **Secret** — what does one know about the other that hasn't been revealed? What does each ASSUME about the other that's wrong?

No author lens for this builder — the questions are universal craft.

## Mode B — Autonomous (agent-triggered)

Triggered via `Agent` tool during drafting when a relationship becomes significant but hasn't been built out.

In autonomous mode, do NOT ask the user. Instead:

1. Read both character files and the scene context provided.
2. Extract what the scene establishes about the relationship.
3. Fill in only what's earned by the text. Mark the rest `_To be filled in._`.
4. Update both character files with reciprocal `## Connections` entries.
5. Return one line: `updated characters/<a>.md and characters/<b>.md — relationship: <type>`.

## Interview methodology (shared across modes)

Six questions is light by design — relationships need breathing room in the bible, not exhaustive documentation. The user fills in more via journal entries over time and `/authors-consolidate` later.

Question 6 (secret / wrong assumption) is where relationships become story-generative. A character who's wrong about another character is a story waiting to happen.

## Output format

For EACH character file, update (or add) the `## Connections` section with a reciprocal entry.

In `characters/<character-a>.md`:

```markdown
## Connections

- **<Character B's name>** — <type>. <one-line description of the dynamic from A's POV>.
  - History: <one line from the formative event>
  - Live tension: <the current conflict>
  - What A gets wrong about B: <the wrong assumption>
```

In `characters/<character-b>.md`:

```markdown
## Connections

- **<Character A's name>** — <type>. <one-line description of the dynamic from B's POV>.
  - History: <one line from the formative event>
  - Live tension: <the current conflict>
  - What B gets wrong about A: <the wrong assumption>
```

**Reciprocal but not symmetric.** Each entry is written from that character's point of view. If A thinks B is a mentor and B thinks A is a student, fine. If A thinks B is their best friend and B thinks A is dangerous, REALLY fine — that's the kind of asymmetry that makes fiction.

Preserve any existing content in each character file. Only modify the `## Connections` section.

## Staying in role

You build relationships between existing characters. If the user asks you to create a new character, redirect to `/authors-build-character`. If they ask you to draft a scene between these characters, redirect to `/authors-channel <author>` or `/authors-draft`.

If directly asked to break character, briefly acknowledge you are Claude playing this role, then return to the interview.
```

- [ ] **Step 3: Validator PASS**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./scripts/lint-builder.sh agents/relationship-builder.md
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add agents/relationship-builder.md && \
  git commit -m "feat(agents): add relationship-builder tool persona"
```

---

### Task 5: Write /authors-build-place skill

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-build-place/SKILL.md`:

```markdown
---
name: authors-build-place
description: Build a place entry for the project bible via an interactive interview. Usage - /authors-build-place <name> [--author <author-name>]. Seven questions covering type, sensory signature, one odd detail, meaning to characters, how it changes, contradiction, connections. Optional --author lens (mcphee for architectural history, didion for cultural specificity). Use when you're adding a new location to a long-form project and want author personas to read its bible entry before editing passages set there.
---

# /authors-build-place <name> [--author <author>]

Build a structured place entry in the project bible.

## When to use

- A new location has entered your novel and you want other author personas to know about it.
- You're pre-planning a novel and sketching out key settings.
- A location has been drifting (sensory details shifting across chapters) and you want to nail it down.

Not for: writing scene prose set in this place (use `/authors-channel <author>` or `/authors-draft`); editing an existing passage (use `/authors-edit`).

## Instructions for Claude

1. **Parse arguments:** place name (required) + optional `--author <name>` flag. Valid lenses in v0.5: `mcphee`, `didion`. Others fall back to default.

2. **Verify `.great-authors/` exists.** If not, tell the user to run `/authors-project-init` and stop.

3. **Check for existing place file** at `.great-authors/places/<name>.md`. If exists, ask about overwrite (default no).

4. **Dispatch place-builder** via `Agent` tool:
   - `subagent_type: place-builder`
   - Prompt includes: `Mode: interactive`, `Place name: <name>`, `Author lens: <author>`, `Working directory: <cwd>`.

5. **Relay the interview.** Seven questions, one at a time, user answers pass back verbatim.

6. **Confirm creation:**
   ```
   Created .great-authors/places/<name>.md

   Type: <type>
   Sensory signature: <one-line summary>

   Next: run /authors-channel <author> to draft a scene here, or /authors-build-place for the next location.
   ```

## Notes

- Places are bible metadata. Do not write to the manuscript.
- If the user mentions a character that doesn't exist in `.great-authors/characters/` during the interview (question 7, connections), offer to run `/authors-build-character` next — after finishing this place file.
- If the user says "cancel" or "abort," stop the dispatch and confirm no file was written.
```

- [ ] **Step 6: Verify frontmatter + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-build-place/SKILL.md && \
  git add skills/authors-build-place/ && \
  git commit -m "feat: add /authors-build-place skill"
```

---

### Task 6: Write /authors-build-relationship skill

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-build-relationship/SKILL.md`:

```markdown
---
name: authors-build-relationship
description: Build a relationship entry between two existing characters in the project bible. Usage - /authors-build-relationship <character-a> <character-b>. Six questions covering type, power dynamic, history, current conflict, shared vocabulary, secrets and wrong assumptions. Updates the ## Connections section of BOTH character files with reciprocal entries. Both characters must already exist as .great-authors/characters/<name>.md files.
---

# /authors-build-relationship <character-a> <character-b>

Build a relationship entry between two existing characters.

## When to use

- Two characters in your project have a significant relationship and you want it documented in both files.
- You're noticing that a relationship is driving multiple scenes and deserves craft-level attention.
- Before drafting a scene featuring both characters, so the draft respects their established dynamic.

Not for: creating new characters (use `/authors-build-character`); drafting a scene between them (use `/authors-channel <author>` or `/authors-draft`).

## Instructions for Claude

1. **Parse arguments:** both character names required. Lowercase, hyphenated (matching the character file names).

2. **Verify both character files exist:**
   - `.great-authors/characters/<character-a>.md`
   - `.great-authors/characters/<character-b>.md`

   If either is missing, tell the user and offer to run `/authors-build-character` for the missing one first. Do not proceed until both exist.

3. **Verify characters are different.** If `<character-a>` and `<character-b>` are the same, ask the user to pick a different second character.

4. **Check for existing connection** between them in either file's `## Connections` section. If found, ask: extend / replace / cancel. Default extend.

5. **Dispatch relationship-builder** via `Agent` tool:
   - `subagent_type: relationship-builder`
   - Prompt: `Mode: interactive`, `Character A: <name>`, `Character B: <name>`, `Working directory: <cwd>`.

6. **Relay the interview.** Six questions, one at a time.

7. **Confirm update:**
   ```
   Updated .great-authors/characters/<character-a>.md and .great-authors/characters/<character-b>.md

   Type: <type>
   Live tension: <one-line>

   Next: run /authors-channel <author> to draft a scene between them, or /authors-build-relationship for another pair.
   ```

## Notes

- This skill modifies TWO files. Both updates happen or neither does.
- If the user says "cancel" mid-interview, stop and confirm no files were written.
- The reciprocal entries are deliberately asymmetric — each character has their own POV on the relationship.
```

- [ ] **Step 3: Verify frontmatter + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-build-relationship/SKILL.md && \
  git add skills/authors-build-relationship/ && \
  git commit -m "feat: add /authors-build-relationship skill"
```

---

### Task 7: Static integration check

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ls agents/*.md | wc -l && \
  ls -d skills/*/ | wc -l && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f"; done && \
  for b in agents/character-builder.md agents/scene-builder.md agents/place-builder.md agents/relationship-builder.md; do ./scripts/lint-builder.sh "$b"; done && \
  python3 -c "import json; print(json.load(open('.claude-plugin/plugin.json'))['version'])"
```

Expected: 14 agents, 12 skills, 10 persona PASS, 4 builder PASS, version `0.5.0`.

No commit — verification only.

---

### Task 8: Update README

- [ ] **Step 1: Update section header**

Edit `README.md`:
- Replace: `## What's in v0.4`
- With: `## What's in v0.5`

- [ ] **Step 2: Update Tool Personas table (add 2 rows)**

Edit `README.md`:
- Replace:
  ```
  | `character-builder` | Interviews you to build a character entry in the project bible. Optional `--author` lens. |
  | `scene-builder` | Interviews you to build a scene beat card. Optional `--author` lens. |
  ```
- With:
  ```
  | `character-builder` | Interviews you to build a character entry in the project bible. Optional `--author` lens. |
  | `scene-builder` | Interviews you to build a scene beat card. Optional `--author` lens. |
  | `place-builder` | Interviews you to build a place entry — sensory, meaning, change. Optional `--author` lens (mcphee, didion). |
  | `relationship-builder` | Interviews you about a relationship between two existing characters; updates both files reciprocally. |
  ```

- [ ] **Step 3: Update Slash Commands count and add two rows**

Edit `README.md`:
- Replace: `### 11 Slash Commands`
- With: `### 13 Slash Commands`

Then after the `/authors-build-scene` row, add these two new rows:
- Replace:
  ```
  | `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |
  ```
- With:
  ```
  | `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |
  | `/authors-build-place <name> [--author <x>]` | Build a place entry in the bible. |
  | `/authors-build-relationship <a> <b>` | Build a relationship entry between two existing characters. |
  ```

- [ ] **Step 4: Update roadmap**

Edit `README.md`:
- Replace:
  ```
  ## Roadmap

  - **v0.5** — `place-builder` and `relationship-builder` (finishes the builder set)
  - **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
  - **v1.0** — DXT package for Claude Desktop
  ```
- With:
  ```
  ## Roadmap

  - **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
  - **v1.0** — DXT package for Claude Desktop
  ```

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update README for v0.5 (place + relationship builders)"
```

---

### Task 9: Push + tag v0.5.0

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push origin main && \
  git tag -a v0.5.0 -m "v0.5.0 — place-builder + relationship-builder agents and slash commands" && \
  git push origin v0.5.0 && \
  gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -5
```

Expected: `v0.5.0` at top of tag list.

---

## Self-review

- **Spec coverage:** place-builder (Task 3) + relationship-builder (Task 4) + their skills (Tasks 5-6) close Section 7 "Phase 2 candidates" entries for those two builders.
- **Type consistency:** `relationship-builder` doesn't create new files — it modifies two character files. Different shape from other builders. Called out explicitly in its agent body and skill.
- **Placeholder scan:** clean.
- **Risk:** relationship-builder writes to two files. If one write fails (permissions, disk full), the other may have already succeeded, leaving inconsistent state. Mitigated by read-both-first, write-both-last in the agent body. For v0.5 we trust the user to manually reconcile if something breaks — no transaction-wrapping.
