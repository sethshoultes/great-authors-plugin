---
title: Great Authors Plugin — Design Spec
date: 2026-04-24
status: approved-for-planning
author: Seth Shoultes
related:
  - "[[great-minds-plugin]]"
  - "[[model-selection-for-agents]]"
  - "[[pipeline-is-the-product]]"
  - "[[start-minimal-verify-expand]]"
  - "[[agents-hallucinate-apis]]"
  - "[[plugin_great_minds]]"
---

# Great Authors Plugin — Design Spec

A Claude Code plugin providing ten legendary author personas + workflow slash commands for prose craft and editorial work. Companion to `great-minds-plugin`, which focuses on strategic/product thinking. Where Great Minds shapes *what* to decide, Great Authors shapes *how the words land on the page*.

## Goals

1. Give writers a structured way to invoke author-specific editorial judgment on a draft.
2. Support long-form projects (novels, book-length nonfiction) via a lightweight per-project memory convention.
3. Be usable from day one — no daemon, no cron, no Agent SDK; just personas + slash commands in Claude Code.
4. Establish a single source of truth that avoids the distribution-sync debt observed in `great-minds-plugin`.

## Non-goals (v1)

- Autonomous long-form drafting (no daemon, no Ralph Wiggum loop). Writing stays human-in-the-loop.
- Cross-project memory. Each project is its own bible.
- Multi-format distribution (DXT, lite) at launch. Claude Code plugin only for v1; DXT in final phase.
- PRD-to-ship pipeline equivalent. Writing is not a manufacturing process.

## Informing learnings

The design is shaped by five captured lessons:

- **[[start-minimal-verify-expand]]** — phase the plugin so each version is independently useful.
- **[[pipeline-is-the-product]]** — invest in the infrastructure that compounds (bible convention, cross-references, consolidation logic), not in the one-off outputs.
- **[[model-selection-for-agents]]** — set `model:` per-agent; plan to split Sonnet (real editing) from Haiku (terse critique) once cost is real.
- **[[agents-hallucinate-apis]]** — authors must read the project bible, never trust training memory for a specific project's world.
- **[[plugin_great_minds]]** — single source of truth, no distribution forks on day one.

---

## Section 1 — Architecture overview

A standalone Claude Code plugin at `sethshoultes/great-authors-plugin`, structured as a sibling to `great-minds-plugin`. Content lives under three directories:

- `agents/*.md` — twelve dispatch files (ten authors + two tool personas).
- `skills/*/SKILL.md` — seven slash commands.
- `.claude-plugin/` — manifest.

No `daemon/`, `crons/`, `hooks/`, `distribution/`, or `memory-store/` in v1.

### Invocation paths

1. **Direct dispatch.** `/authors-channel hemingway` loads a persona into the main conversation. Claude also auto-recommends authors via description-matching when the user mentions their name or frames the problem in style terms ("tighten this," "make this plain").
2. **Orchestrated fan-out.** `/authors-edit`, `/authors-critique`, `/authors-debate` use the `Agent` tool to spawn personas in parallel, isolated contexts, then consolidate.

### Model strategy

All agents default to `sonnet` in v1. A follow-up pass in Phase 2 splits critique-only personas to `haiku` with TERSE output prefix per [[model-selection-for-agents]]. Splitting now would ship untested cost assumptions.

### Phasing

- **v0.1** — ten author agents + `/authors-channel` + `/authors-project-init`. Personas become usable for everyday editing. Ship. Use it.
- **v0.2** — add character-builder and scene-builder agents, plus `/authors-edit`, `/authors-critique`, `/authors-debate`, `/authors-build-character`, `/authors-build-scene`. Ship.
- **v1.0** — DXT package for Claude Desktop.

Each phase is independently shippable.

---

## Section 2 — Agent file format

Every author lives at `agents/<name>-persona.md`. Tool personas (builders) drop the `-persona` suffix.

### Frontmatter

```yaml
---
name: hemingway-persona
description: "Use for tightening bloated prose, cutting marketing copy to bone, opening paragraphs, dialogue that does work — anywhere the instinct is to overexplain. Invoke when user asks to 'channel Hemingway,' cites the iceberg theory, or asks to cut adverbs/adjectives/exclamation points. Do NOT use for playful tone, expansive lyricism, humor, or technical documentation. Examples:
- User: 'This paragraph is bloated' → 'Hemingway will cut every word that isn't doing work.'
- User: 'Tighten this email' → 'Hemingway will strike the adverbs and Latinate verbs.'"
model: sonnet
color: blue
---
```

### Body structure (seven sections)

1. **Identity** — first-person opening. ("You are Ernest Hemingway. Not a summary. Not an impression...")
2. **Voice and temperament** — the Voice DNA from the profile.
3. **Core principles / non-negotiables** — the iron rules.
4. **How to edit a draft** — numbered editorial workflow.
5. **How to draft** — voice-takeover mode with an explicit constraint: write new prose in the style; never reproduce the author's actual published work.
6. **Before you edit** — the bible-reading protocol (see Section 6).
7. **When another writer would serve better** — 3–6 cross-references to other personas (see Section 4).
8. **Staying in character** — standard footer: answer as the author; if directly asked to break character, briefly acknowledge the roleplay and resume.

### Conversion lift

Source material is `/Users/sethshoultes/Downloads/great-authors/*/SKILL.md` + `great-authors-profiles.md`. Sections 1–4 and 8 are already written in most files. The lift per author is: add frontmatter, add sections 5–7, reconcile with the profile doc. Hemingway must be written from scratch (his source dir is empty).

### Color assignments (for Claude Code UI)

Prose style: `blue`. Nonfiction structure: `green`. Narrative craft: `purple`. Tool personas: `gray`. Purely cosmetic.

---

## Section 3 — Workflow commands

Seven slash commands under `skills/`. Each is a Claude Code skill: directory with `SKILL.md`.

### `/authors-channel <author>`

Lightest command. Loads the named author into the current conversation.

- Reads `agents/<author>-persona.md`, strips frontmatter, system-prompts the rest into the session as "you are now X."
- Stays in main conversation. No subagent spawn. Drafting mode.
- Exit by saying "drop the persona" or starting a new thread.

### `/authors-edit <file> [author...]`

Core utility. Marks up a draft.

- If no authors named: inspects the file, picks 1–2 relevant authors from genre signals (marketing → Hemingway + Orwell; fiction → King + Vonnegut; essay → Didion + Baldwin; long-form nonfiction → McPhee; etc.).
- Fans out via `Agent` tool. Each author returns:
  - **Top-line verdict** (one sentence).
  - **Marked passages** — quoted excerpts with cuts/substitutions inline. `~~extremely~~` for strikes, `[→ said]` for replacements.
  - **Start here** marker if they'd delete everything above a line.
  - **One cross-reference** when a different author would do it better.
- Consolidates to one marked-up view — not N separate critiques to wade through.

### `/authors-critique <file> [author...]`

Fast, cheap gut check. Runs often.

- Same author-selection as `/authors-edit`; defaults to 3 authors.
- Each returns a **3-bullet verdict** only. No marked passages, no rewrites.
- TERSE prefix. Haiku-ready once Phase 2 splits models.
- Consolidation: one-line consensus + one-line sharpest disagreement.

### `/authors-debate <passage-or-topic> <author-A> <author-B>`

Craft dispute resolution. Two rounds.

- Round 1: each author states their position in 3–5 sentences.
- Round 2: each responds to the other — concessions and held positions.
- Consolidation names the real tension (usually genre or register), offers a third option if one exists, or picks a winner with reasoning.

Example: `/authors-debate "this opening paragraph" hemingway mccarthy`.

### `/authors-project-init`

Scaffolds `.great-authors/` in the current directory (see Section 6). One-shot interactive setup: fiction or nonfiction, long-form or short, POV, tense, working title. Writes the skeleton from `templates/project-bible/`.

### `/authors-build-character <name> [--author <author>]`

Builds a character entry (see Section 8, Mode A).

### `/authors-build-scene [--author <author>]`

Builds a scene entry (see Section 8, Mode A).

### Shared behavior

- All commands pass draft content via file reads, not inline — keeps invocations short.
- Dispatch via the `Agent` tool with `subagent_type: <agent-name>`.
- Authors never reproduce real published work. Constraint lives in every identity section.
- Output to stdout. No command writes to the manuscript; the human keeps control. Builder commands write to `.great-authors/`, which is bible metadata, not manuscript.
- Sub-agents inherit cwd so they can read `.great-authors/` themselves.

---

## Section 4 — Cross-reference pattern

The feature that makes consolidation non-dumb.

Every persona file ends with:

```markdown
## When another writer would serve better

- Bloated prose needs a sentence-level cut I can't do — **Hemingway**
- The piece needs moral weight, not tightness — **Baldwin**
- The argument is getting lost under the style — **Orwell**
- You're writing about a place and the observation is thin — **Didion**
- The shape of the piece is wrong and no amount of line editing will fix it — **McPhee**
```

Three to six handoffs per author, hand-authored from the profile doc's "Best for / Not for" sections.

### How consolidation uses it

When `/authors-critique` or `/authors-edit` consolidates, any cross-reference that appeared in an individual critique becomes a handoff suggestion: *"Hemingway and Orwell both tightened the prose, but McCarthy flagged that the real problem is tonal — Baldwin would serve better here. Want to run `/authors-edit <file> baldwin`?"*

Flat critique becomes a routing signal.

### Authoring discipline

Cross-refs are about *when to route*, not about what the target sounds like. They drift slowly — when Baldwin's voice evolves in his own file, his cross-refs in other files don't auto-update, and don't need to. Stephen King's existing SKILL.md is the reference template; its handoffs are specific and earned.

---

## Section 5 — Repo structure

```
great-authors-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── agents/
│   ├── hemingway-persona.md
│   ├── mccarthy-persona.md
│   ├── didion-persona.md
│   ├── baldwin-persona.md
│   ├── mcphee-persona.md
│   ├── wallace-persona.md
│   ├── orwell-persona.md
│   ├── king-persona.md
│   ├── le-guin-persona.md
│   ├── vonnegut-persona.md
│   ├── character-builder.md
│   └── scene-builder.md
├── skills/
│   ├── authors-channel/SKILL.md
│   ├── authors-edit/SKILL.md
│   ├── authors-critique/SKILL.md
│   ├── authors-debate/SKILL.md
│   ├── authors-project-init/SKILL.md
│   ├── authors-build-character/SKILL.md
│   └── authors-build-scene/SKILL.md
├── templates/
│   └── project-bible/
│       ├── project.md
│       ├── voice.md
│       ├── timeline.md
│       ├── glossary.md
│       ├── characters/.gitkeep
│       ├── places/.gitkeep
│       └── scenes/.gitkeep
├── docs/
│   ├── profiles.md
│   └── superpowers/specs/2026-04-24-great-authors-plugin-design.md
├── README.md
├── LICENSE
└── package.json
```

### What's deliberately absent

- No `daemon/`, `crons/`, `hooks/`.
- No `distribution/` — single format at launch; DXT comes later.
- No `sync.sh`. Per [[plugin_great_minds]], we add sync only when DXT forces it, and we isolate it.
- No `memory-store/`. Project memory lives in the user's working directory, not the plugin.

### Install

- Local path: `~/Local Sites/great-authors-plugin/`
- Remote: `github.com/sethshoultes/great-authors-plugin`
- Install command:
  ```
  /plugin marketplace add sethshoultes/great-authors-plugin
  /plugin install great-authors@sethshoultes
  ```

---

## Section 6 — Per-project memory (the project bible)

Long-form work needs persistent context. A novelist editing Chapter 14 needs every author they invoke to know who Marcus is, what Millbrook looks like, what was established in Chapter 8. Without it, every `/authors-edit` hallucinates or asks for clarification.

### The convention (v1)

A `.great-authors/` folder in the directory holding the manuscript. Plain markdown, human-editable, git-friendly:

```
your-novel/
├── chapter-01.md
├── chapter-02.md
└── .great-authors/
    ├── project.md              # top-level bible — genre, voice, premise, POV, tense
    ├── characters/
    │   ├── marcus.md
    │   └── elena.md
    ├── places/
    │   └── millbrook.md
    ├── scenes/                 # beat sheet / scene index
    ├── timeline.md             # chronology
    ├── glossary.md             # invented terms, slang, brand names
    └── voice.md                # voice rules for THIS project
```

### Why flat markdown

- Obsidian reads markdown natively. A user can symlink `.great-authors/` → an Obsidian vault subfolder.
- Future memory backends (a brain server, a custom MCP tool, SQLite) can export to this shape.
- Grep-friendly, git-friendly. Inspectable by hand with no tooling.
- [[start-minimal-verify-expand]] — folder-plus-convention is the smallest version that works.

### The protocol (in every persona)

Each author file contains a standardized pre-edit step:

```markdown
## Before you edit

If `.great-authors/` exists in the current working directory:
1. Read `.great-authors/project.md` for genre, voice, POV, tense.
2. Read `.great-authors/voice.md` for established voice rules — respect them.
3. For any character, place, or invented term named in the passage, read the matching file in `characters/`, `places/`, or `glossary.md`.
4. If the passage contradicts the bible, flag it explicitly — do not silently "correct" the manuscript.
```

No author memorizes the project. Each invocation reads what's relevant. Stateless, predictable.

### Scaffolding — `/authors-project-init`

One slash command. Asks: fiction or nonfiction, long-form or short, POV, tense, working title. Writes the skeleton from `templates/project-bible/`.

### Pluggability

- **Obsidian**: symlink `.great-authors/` → a vault subfolder. No plugin changes required.
- **Custom backends**: write an exporter that produces the `.great-authors/` shape. Plugin reads the folder; doesn't care how it got there.
- **MCP tool layer**: deferred until flat folder breaks down at scale (Phase 3).

---

## Section 7 — Deferred work & roadmap

Explicitly captured so features don't drift into v1 or get reinvented.

### Journal system (Phase 2)

`.great-authors/journal/YYYY-MM-DD.md` per session. Purpose: progress tracking + living bible.

- **Auto-appended** by a post-session skill (`/authors-journal`) or a `Stop` hook.
- **Read on resume**: each persona's pre-edit protocol gains a step — "read the last journal entry to understand what's in flux vs. settled."
- **Promotion**: decisions that survive multiple sessions get promoted from journal entries to `project.md` / `characters/` / `scenes/`. Manual at first; automated via `/authors-consolidate` later.
- **Velocity signal**: auto-generated "last session" summary on resume.
- Matches [[pipeline-is-the-product]] — infrastructure that compounds across every writing project.

### Phase 2 candidates (near-term, post-v1)

- Journal system (above).
- **`/authors-continuity <file>`** — cross-chapter consistency checker. Flags drifts in character detail, timeline contradictions, voice breaks against `voice.md`. Uses the bible as ground truth.
- **Asset authoring helpers** — `/authors-project-add-character`, `/authors-project-add-place`. Only if markdown-by-hand proves to be real friction.
- **`/authors-draft <brief> <author>`** — voice-takeover drafting. Deferred from v1 because editing has higher leverage and lower risk. Activates Mode B (autonomous spawn) of the character-builder and scene-builder.
- **`/authors-banned-patterns <file>`** — standalone linter for cant, passive voice, adverbs, purple prose. Likely folds into `/authors-edit --strict`, not its own command.
- **Model split** — TERSE prefix + Haiku routing for critique-only personas, per [[model-selection-for-agents]]. Revisit once cost is real.
- **`place-builder`** — parallel to character-builder and scene-builder. Interactive + autonomous modes. Writes `places/<name>.md`.
- **`relationship-builder`** — builds connection entries between two existing characters. Updates both character files with reciprocal links.

### Phase 3 candidates (bigger lifts)

- **DXT package for Claude Desktop** — user-flagged as "final phase." Wait until Phase 2 content is stable so sync cost hits once.
- **Custom memory backend / MCP tool layer** — abstracts the bible behind a query interface (vector search over scenes, backlink resolution). Worth it only when flat-folder convention breaks down at scale.
- **Obsidian first-class integration** — beyond the symlink story. Could include an MCP server reading `.great-authors/` from inside an Obsidian vault with backlinks resolved.
- **Lite distribution for Claude Cowork** — parallel to great-minds-lite. Only if Cowork becomes part of the writing flow.
- **Starter templates for writer's block** — pre-built bible skeletons per genre (literary thriller, cozy mystery, SF novella, essay, newsletter). Lives in `templates/starters/`.

### Intentionally out of scope

- **Daemon / cron / autonomous pipeline** — great-minds has this; writing does not need it.
- **Agent SDK headless swarm** — same reason. Writing is human-in-the-loop.
- **PRD-to-ship pipeline equivalent** — "outline → draft → edit → publish" is not parallel to great-minds. The author-in-the-loop is the entire point.
- **Multi-format distribution from day one** — solved by sequencing.
- **Cross-project memory** — each novel is its own bible. For cross-project craft learnings, use `~/brain`.

---

## Section 8 — Builder personas (character-builder, scene-builder)

A specialized sub-agent for *creating* bible entries — not channeling voice. Different enough from the ten author personas that it warrants its own agent type.

### Character-builder — `agents/character-builder.md`

**Two invocation modes, one agent.**

#### Mode A — Interactive (v1)

Command: `/authors-build-character <name> [--author <author-name>]`

- Spawned by the human. Character name required.
- Reads `.great-authors/project.md` and `voice.md` first — genre, tone, and register constrain the questions.
- Interviews one question at a time:
  1. Role in the story (protagonist / antagonist / supporting / minor-but-vivid).
  2. What they want (surface want + deeper need).
  3. What they fear or refuse.
  4. Voice — how they speak. Sample line of dialogue.
  5. Body — what's physically specific, not generic.
  6. Contradiction — what in them doesn't fit the rest.
  7. Backstory — one formative event, not a life history.
- Writes `.great-authors/characters/<name>.md` with a standardized structure (essence, voice, wants/fears, physical, contradictions, backstory, connections).
- Asks at the end: add a relationship to another character? Offers to update the other character's file with the reciprocal link.

**Author lens (`--author` flag):** same interview, but the *questions* are shaped by one of the ten author personas. King asks about pop-culture tells and small-town details. Le Guin asks about the character's place in their society. Didion asks what specific brand of cigarette they smoke. Output format is unchanged — a standard `characters/<name>.md`.

Default (no flag): craft-neutral interview. Good for most characters.

#### Mode B — Autonomous (activates naturally in v2 with `/authors-draft`)

Triggered by another agent mid-work, not by the human.

- An author persona drafting a chapter introduces a new character name.
- Before continuing, spawns `character-builder` with context: "This character just appeared in the scene [excerpt]. They need a minimal profile."
- `character-builder` runs non-interactive:
  1. Reads the scene context + `project.md` + `voice.md`.
  2. Reads any character files sharing the scene for relational consistency.
  3. Proposes a minimal profile — only what's needed for the current scene plus a hook for later development.
  4. Writes the file, returns "created characters/<name>.md."
- Drafting author resumes with the sketch as ground truth.
- Post-session journal entry flags any auto-generated characters for human review.

#### Mode detection

- Invoked via `/authors-build-character` → interactive.
- Invoked via `Agent` tool by another agent → autonomous.

The agent body carries both modes; dispatch injects a "Your mode is X" system-prompt addition.

### Scene-builder — `agents/scene-builder.md`

Same pattern as character-builder. Same interactive/autonomous duality. Same author-lens option.

Interview methodology is scene-specific:

1. Where does this sit in the timeline? (references `timeline.md`)
2. Which place? (references `places/`)
3. Which characters are present? (references `characters/`)
4. POV character's goal in this scene.
5. What opposes them.
6. What shifts by the end — the turn.
7. Exit state — what's different now that wasn't before.
8. Callbacks to prior scenes / setups for later scenes (references `scenes/`)

Scene-builder has stronger cross-references to other bible entries than character-builder does — it's the node that binds the bible together.

Author-lens differences:
- **McPhee** asks about the scene's *shape* first (trip, circle, braid, spiral).
- **King** asks where the hook is and where pace can't die.
- **Vonnegut** asks what the POV character wants "even if only a glass of water" and where to "start as close to the end as possible."
- **Le Guin** asks what the scene is *for* — what question it interrogates.

### Shared machinery

Both builders reuse the protocol defined in Section 6: read `.great-authors/` before doing anything. Interview methodologies are ~150 lines of persona body each. Workable in v1.

---

## Success criteria

- **v0.1 works when:** a new writer can install the plugin, run `/authors-project-init` in a fresh directory, run `/authors-channel hemingway` and collaborate on a paragraph in the persona's voice.
- **v0.2 works when:** `/authors-edit` on a 2,000-word chapter returns a single consolidated marked-up view from two authors in under 60 seconds, and at least one of the authors produces a cross-reference handoff.
- **v1.0 works when:** a Claude Desktop user installs the DXT and can invoke any of the seven commands without terminal access.
- **The real test**: the user can start a novel in `~/Local Sites/great-authors-plugin/` and build its bible, characters, scenes using only this plugin's commands, over at least one real writing session.

## Open risks

- **Hemingway from scratch.** The source `SKILL.md` is missing. Authoring it lives in the implementation plan, not the spec. Risk: voice drift — mitigated by the profiles doc's detailed Hemingway section as the source of truth.
- **Author-lens in builders.** Nine authors × two builders = eighteen possible interview variants. Only genuinely different questions merit lens treatment. Implementation plan must scope which lenses ship in v1 vs. which are "use default questions until proven necessary."
- **Cross-reference drift.** Hand-authoring 40+ cross-refs (4–5 per author, 10 authors) has a consistency risk. Mitigation: profile doc's "Not for" sections are the ground truth; cross-refs should lift from there verbatim where possible.
- **DXT later means ten authors need a second persona format.** Caught early — Phase 3 will pay this cost once, not across iterations.

## Next step

After user sign-off, hand off to the superpowers `writing-plans` skill to produce the implementation plan.
