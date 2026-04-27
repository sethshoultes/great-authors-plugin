# Great Authors

Twelve personas (eleven author voices including Toni Morrison, plus Robert Gottlieb the editor) and seventeen slash commands for prose craft, editorial work, and long-form project management with a living memory bible. Includes the seven-phase autonomous-novel-orchestration pipeline. A Claude Code plugin. Companion to [`great-minds-plugin`](https://github.com/sethshoultes/great-minds-plugin) and [`great-filmmakers-plugin`](https://github.com/sethshoultes/great-filmmakers-plugin).

> **New to the Caseproof persona constellation?** Start with [`/constellation-start`](https://github.com/sethshoultes/great-minds-plugin) in `great-minds` — it asks 2-3 questions about your project shape and routes to the right plugin.

## Install

**Claude Code:**
```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

**Claude Desktop** (DXT bundle):
```bash
cd distribution/dxt && npm install && npx @anthropic-ai/dxt pack
```
Share the generated `great-authors.dxt` — teammates double-click to install.

## What's new in v1.4

- **Roster correction.** Toni Morrison joined in v1.3, but the plugin description still claimed "ten legendary author personas." Description and persona-count references are now consistent: eleven author voices plus Gottlieb the editor, twelve persona files in total.
- **Cross-plugin coordination with `great-filmmakers-plugin`.** When prose drafted here is adapted for video, the film side's four render paths (Veo 3.0 Fast, Veo 3.1 Fast preview, Kling 2.5 Turbo, Leonardo Motion 2.0) constrain shot duration, aspect ratio, and continuity mechanism. MANUAL has a new "When prose becomes film" subsection that signals the awareness and links the [filmmakers MANUAL Section 9](https://github.com/sethshoultes/great-filmmakers-plugin/blob/main/MANUAL.md#9-video-gen-production-constraints) — the canonical source. No constraint table is restated here; that's the filmmakers plugin's domain.

## What's in v1.3

### 12 Personas — 11 author voices plus the editor

| Agent | Strength |
|-------|----------|
| `hemingway-persona` | Iceberg prose. Tightens bloated writing. Kills adverbs. |
| `orwell-persona` | The plain-style hammer. Cuts political and corporate jargon. |
| `didion-persona` | Cool observational authority. Cultural reporting and essays. |
| `baldwin-persona` | Moral urgency. The essay as confrontation. |
| `morrison-persona` | Lyric narrative grounded in Black American oral tradition. Polyphonic prose, non-linear time, beauty made out of survival. **(v1.3)** |
| `mcphee-persona` | Long-form nonfiction architecture. Structure is destiny. |
| `wallace-persona` | Maximalist, self-aware. Essays about attention and sincerity. |
| `king-persona` | Voice-driven narrative. Pace, dialogue, working novelist's toolbox. |
| `mccarthy-persona` | Biblical weight, mythic register. Prose of terror and grace. |
| `vonnegut-persona` | Humane irony. Devastating compression. Short stories and satire. |
| `le-guin-persona` | Speculative fiction as thought experiment. World-building that serves theme. |
| `gottlieb-persona` | The editor. Modeled on Robert Gottlieb. Reads everything, briefs writers clearly, never writes prose. The orchestrator role made explicit. |

### 4 Tool Personas

| Agent | Role |
|-------|------|
| `character-builder` | Interviews you to build a character entry in the project bible. Optional `--author` lens. |
| `scene-builder` | Interviews you to build a scene beat card. Optional `--author` lens. |
| `place-builder` | Interviews you to build a place entry. Optional `--author` lens (mcphee, didion). |
| `relationship-builder` | Interviews about a relationship between two existing characters; updates both files reciprocally. |

### 17 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. Substantive prose auto-saves to manuscript. |
| `/authors-draft <brief> <author>` | Draft new prose in an author's voice. Auto-sketches new characters into the bible. |
| `/authors-rewrite <file> <author>` | Dispatch a named author to rewrite an existing manuscript file from scratch with full bible context. **(v1.1)** |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
| `/authors-critique <file> [authors...]` | Fast 3-bullet verdicts from N authors on ONE file. |
| `/authors-corpus-critique <author> <paths...>` | Run ONE editor across MULTIPLE files in parallel; consolidate into a corpus-level pattern report. Surfaces patterns no per-file critique catches. **(v1.2)** |
| `/authors-debate <topic> <author-A> <author-B>` | 2-round craft dispute between two authors. Verdict supports Winner / Third way / **Consensus** (v1.1) / Genre call. |
| `/authors-continuity <file> [author]` | Audit a draft against the bible for continuity violations. |
| `/authors-orchestrate-novel [--phase <N>]` | Seven-phase end-to-end novel orchestration: Concept → Architecture → First-draft skeleton → Continuity audit → Editorial pass → Debate → Final → Beta-reader package. Human checkpoints at every phase boundary. **(v1.2)** |
| `/authors-project-init` | Initialize a per-project bible (`.great-authors/`). Now scaffolds `CLAUDE.md` (orchestrator-mode) and `voice-lints.md` (mechanical voice rules) in addition to the original files. |
| `/authors-build-character <name> [--author <x>]` | Build a character entry in the bible. |
| `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |
| `/authors-build-place <name> [--author <x>]` | Build a place entry in the bible. |
| `/authors-build-relationship <a> <b>` | Build a relationship entry between two existing characters. |
| `/authors-journal` | Session journal — now seven structured fields including Plants laid / Plants paid off / Continuity flags. **(v1.1)** |
| `/authors-consolidate` | Promote recurring journal decisions to the permanent bible. |

For day-to-day usage with quick start, workflows, and troubleshooting, see [`MANUAL.md`](./MANUAL.md). For the orchestrator pattern this plugin is built around, see [`ORCHESTRATING.md`](./ORCHESTRATING.md). For per-release history, see [`CHANGELOG.md`](./CHANGELOG.md).

## Per-project memory and manuscript

For novels, book-length nonfiction, or any project where you want consistency across sessions, run `/authors-project-init` in your project directory. It creates two sibling directories:

**`.great-authors/`** — the project bible (metadata):
```
.great-authors/
├── project.md      # genre, voice, premise, POV, tense, manuscript config
├── voice.md        # voice rules for this project
├── timeline.md     # chronology
├── glossary.md     # invented terms, brands, dialect
├── characters/     # one file per character (use /authors-build-character)
├── places/         # one file per place (use /authors-build-place)
├── scenes/         # one file per scene or beat card (use /authors-build-scene)
└── journal/        # dated session entries (use /authors-journal)
```

**`manuscript/`** — the actual writing:
```
manuscript/
└── chapter-01.md   # (or whatever filename you chose at init)
```

Every author persona reads the relevant bible files — including the most recent journal entry — before editing any passage. Generated prose from `/authors-draft` lands in `manuscript/` automatically; prose from `/authors-channel` lands there when you say "save that."

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

# draft ch14.md as usual... or let an author start the draft:
/authors-draft "opening diner scene, Marcus confronts Elena about the letter" king
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

v1.0, v1.1, and v1.2 all shipped. v1.2 closes the autonomous-orchestration story (the seven-phase pipeline + corpus critique + Gottlieb persona) and brings the DXT distribution to parity with the Claude Code plugin.

Future work is driven by user feedback — open an issue at https://github.com/sethshoultes/great-authors-plugin/issues.

See `CHANGELOG.md` for the per-release history. See `ORCHESTRATING.md` for the orchestrator pattern this plugin assumes. See `docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md` for the v1.0 design and `docs/superpowers/plans/` for implementation plans.

## Performance notes

- **`/authors-critique`** dispatches sub-agents on **Haiku** — triaging opinions doesn't need Sonnet, and the command is designed to run often.
- **`/authors-edit`**, **`/authors-debate`**, **`/authors-draft`**, **`/authors-channel`**, and all builder interviews stay on **Sonnet** — these involve actual reasoning about prose or extended dialog.
- **`/authors-continuity`** stays on Sonnet — the auditor has to read the full bible and hold multiple files in context.

## License

MIT
