# Great Authors v0.4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship v0.4 — `/authors-draft` voice-takeover drafting with Mode B builder activation.

**Architecture:** One new slash command. The skill loads an author persona into the main conversation (like `/authors-channel` but with a drafting brief) and instructs the drafting Claude to dispatch `character-builder` or `scene-builder` in Mode B when new bible entities appear in the draft. Builder Mode B was already documented in their agent bodies (v0.2); this is the first release that activates them.

**Tech stack:** Same as prior versions — markdown + YAML. No new dependencies. No agent files change.

---

## File structure for v0.4

```
great-authors-plugin/
├── skills/
│   └── authors-draft/SKILL.md       # Task 3 (new)
├── .claude-plugin/plugin.json       # Task 2 (version bump)
├── .claude-plugin/marketplace.json  # Task 2 (description update)
├── package.json                     # Task 2 (version bump)
└── README.md                        # Task 4 (add /authors-draft)
```

No agent changes. No other skill changes.

---

## Tasks

### Task 1: Verify state

- [ ] **Step 1: Clean main + v0.3 tag**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && git status && \
  git fetch origin && git log --oneline origin/main..main && \
  git tag --list | grep v0.3
```

Expected: `main`, clean, synced, `v0.3.0` tag exists.

---

### Task 2: Version bump

- [ ] **Step 1: Bump plugin.json**

Edit `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/plugin.json`:
- Replace: `  "version": "0.3.0",`
- With: `  "version": "0.4.0",`

- [ ] **Step 2: Bump package.json**

Edit `/Users/sethshoultes/Local Sites/great-authors-plugin/package.json`:
- Replace: `  "version": "0.3.0",`
- With: `  "version": "0.4.0",`

- [ ] **Step 3: Update marketplace description**

Edit `/Users/sethshoultes/Local Sites/great-authors-plugin/.claude-plugin/marketplace.json`:
- Replace: `      "description": "Ten author personas + 10 slash commands: /authors-channel, /authors-edit, /authors-critique, /authors-debate, /authors-project-init, /authors-build-character, /authors-build-scene, /authors-journal, /authors-consolidate, /authors-continuity.",`
- With: `      "description": "Ten author personas + 11 slash commands including /authors-draft for voice-takeover drafting with auto-sketched characters, /authors-edit, /authors-critique, /authors-debate, and full project-bible management.",`

- [ ] **Step 4: Validate JSON**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  echo OK
```

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 0.4.0"
```

---

### Task 3: Write /authors-draft skill

**Files:**
- Create: `skills/authors-draft/SKILL.md`

The substantive task. Voice-takeover drafting + Mode B builder activation.

- [ ] **Step 1: Write the SKILL.md**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-draft/SKILL.md`:

```markdown
---
name: authors-draft
description: Draft new prose in a named author's voice from a brief. Usage - /authors-draft <brief> <author>. Loads the author persona into the main conversation with a drafting directive, then writes prose in that voice. When new characters, places, or scenes appear in the draft, automatically dispatches the appropriate builder (character-builder, scene-builder) in Mode B to add them to the project bible. Use when you want a first-draft pass in a specific voice and you're OK with AI-generated prose as a starting point for your own revision.
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
   - Everything before the last token: `<brief>` (required, string). Can be long — a scene outline, a chapter summary, a character moment to render.
   - Last token: `<author>` (required). One of the ten personas. Short forms accepted (`papa`, `dfw`, `leguin`).

   If only one arg, ask the user to clarify which is the brief and which is the author.

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

5. **Announce the draft mode:**

   ```
   Drafting in <Author's Display Name>'s voice.

   Reminder: this is draft material, not final copy. Revise aggressively. The author you're channeling would tell you the same thing.

   Brief: <brief, echoed>
   ```

6. **Write the draft.** In the author's voice, respecting the project bible. Write in natural prose paragraphs. No headers, no commentary — just the prose.

7. **Mid-draft Mode B dispatches.** After writing each paragraph or scene beat, check: has a new entity appeared that isn't in the bible yet?

   - **New character name?** If a person is referred to by name and `.great-authors/characters/<name-slug>.md` doesn't exist, dispatch `character-builder` in Mode B:
     - `subagent_type: character-builder`
     - Prompt includes: `Mode: autonomous`, the recent paragraph(s) as context, instruction to write a minimal profile and return a one-line summary.
     - Note the auto-generation in a brief aside to the user: "(Sketched Marcus into `.great-authors/characters/marcus.md` — review later.)"
   - **New place?** Similar — dispatch place-builder if it exists (not yet shipped in v0.4 — skip silently if not installed).
   - **New scene structure?** Optional — if the draft is scene-shaped and the user hasn't built the scene card yet, dispatch scene-builder in Mode B with the drafted scene text as context.

   **Do not pause drafting for human input during these Mode B dispatches.** They're autonomous — fire and forget. The human reviews the auto-generated bible entries after the draft session.

8. **Continue drafting** until the brief is satisfied or the user says stop.

9. **End with a footer:**

   ```
   ---
   Draft complete. <N> paragraphs, approximately <N> words.

   Bible entries auto-generated this session:
   - characters/<name>.md (Marcus)
   - (etc.)

   Recommended next steps:
   - Revise the draft. Aggressively.
   - Review the auto-generated bible entries and fill in gaps.
   - Run /authors-edit on the revised draft for a second pass.
   - Capture decisions in /authors-journal before you close the session.
   ```

## Notes

- Drafts are written to stdout, NOT to a file. The user decides where prose lives.
- The author's constraint "never reproduce my actual published work" still applies — generate original prose in the voice, not pastiches of real books.
- If the user's brief is under-specified (one or two sentences), ask for more before drafting. A better brief produces a better draft.
- If the user requests a draft longer than ~2,000 words, break it into sections and pause for feedback between sections.
- The auto-generated bible entries from Mode B are intentionally minimal. They're hooks, not finished profiles. The user can flesh them out with `/authors-build-character` or `/authors-build-scene` later.

## Respecting project rules

If `voice.md` establishes a rule that conflicts with the author's defaults (e.g., "no adverbs ending in -ly" when the author normally allows them, or "quotation marks for dialogue" when the author prefers none), honor the project's rule. The author persona's `## Before you edit` protocol already codifies this — apply the same discipline when drafting.
```

- [ ] **Step 2: Verify frontmatter**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-draft/SKILL.md
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-draft/ && \
  git commit -m "feat: add /authors-draft skill (voice-takeover + Mode B activation)"
```

---

### Task 4: Update README

- [ ] **Step 1: Update the "10 Slash Commands" table to 11 and add /authors-draft**

Edit `/Users/sethshoultes/Local Sites/great-authors-plugin/README.md`:

Replace:
```
### 10 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
```

With:
```
### 11 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-draft <brief> <author>` | Draft new prose in an author's voice. Auto-sketches new characters into the bible. |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
```

- [ ] **Step 2: Update "What's in v0.3" → "What's in v0.4"**

Edit `/Users/sethshoultes/Local Sites/great-authors-plugin/README.md`:
- Replace: `## What's in v0.3`
- With: `## What's in v0.4`

- [ ] **Step 3: Update the roadmap**

Edit the Roadmap section. Replace:
```
## Roadmap

- **v0.4** — `/authors-draft` voice-takeover drafting + Mode B activation for builders (auto-sketch characters introduced mid-draft)
- **v0.5** — `place-builder` and `relationship-builder` (finishes the builder set)
- **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
- **v1.0** — DXT package for Claude Desktop
```

With:
```
## Roadmap

- **v0.5** — `place-builder` and `relationship-builder` (finishes the builder set)
- **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
- **v1.0** — DXT package for Claude Desktop
```

- [ ] **Step 4: Add a workflow-example line for /authors-draft**

Edit the Workflow example block. Find:
```
# draft ch14.md as usual...
```

Replace with:
```
# draft ch14.md as usual... or let an author start the draft:
/authors-draft "opening diner scene, Marcus confronts Elena about the letter" king
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update README for v0.4 (/authors-draft)"
```

---

### Task 5: Push + tag v0.4.0

- [ ] **Step 1: Push**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push origin main
```

- [ ] **Step 2: Tag + push**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git tag -a v0.4.0 -m "v0.4.0 — /authors-draft voice-takeover drafting with Mode B builder activation" && \
  git push origin v0.4.0
```

- [ ] **Step 3: Verify tag on remote**

```bash
gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -5
```

Expected: `v0.4.0` at top.

---

## Self-review

- **Spec coverage:** Section 7 "Phase 2 candidates" → `/authors-draft` (Task 3). Mode B activation of builders (already documented in agent bodies since v0.2; this release first exercises them via /authors-draft instructions).
- **Placeholder scan:** clean.
- **Risk:** the skill instructs Claude to auto-spawn builders mid-draft. If this behaves badly (too many spurious dispatches, builders get confused by fragmentary context), the fix is to tighten the "new entity detection" heuristic in step 7 or make Mode B spawning opt-in via a flag. Not pre-optimizing.

## Execution handoff

Execute directly. 5 tasks, mostly mechanical; Task 3 is the one substantive write.
