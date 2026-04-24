# Great Authors

Ten legendary author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut) plus ten slash commands for prose craft, editorial work, and long-form project management with a living memory bible. A Claude Code plugin. Companion to [`great-minds-plugin`](https://github.com/sethshoultes/great-minds-plugin).

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

## What's in v1.0

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
| `place-builder` | Interviews you to build a place entry — sensory, meaning, change. Optional `--author` lens (mcphee, didion). |
| `relationship-builder` | Interviews you about a relationship between two existing characters; updates both files reciprocally. |

### 13 Slash Commands

| Command | Purpose |
|---------|---------|
| `/authors-channel <author>` | Load an author into the main conversation for direct collaboration. |
| `/authors-draft <brief> <author>` | Draft new prose in an author's voice. Auto-sketches new characters into the bible. |
| `/authors-edit <file> [authors...]` | Mark up a draft with consolidated edits from 1-2 authors. |
| `/authors-critique <file> [authors...]` | Fast 3-bullet verdicts from 3 authors in parallel. |
| `/authors-debate <topic> <author-A> <author-B>` | 2-round craft dispute between two authors. |
| `/authors-continuity <file> [author]` | Audit a draft against the bible for continuity violations. |
| `/authors-project-init` | Initialize a per-project memory bible (`.great-authors/`). |
| `/authors-build-character <name> [--author <x>]` | Build a character entry in the bible. |
| `/authors-build-scene [<id>] [--author <x>]` | Build a scene beat card in the bible. |
| `/authors-build-place <name> [--author <x>]` | Build a place entry in the bible. |
| `/authors-build-relationship <a> <b>` | Build a relationship entry between two existing characters. |
| `/authors-journal` | Capture a session journal entry — decisions, unresolved threads, where you left off. |
| `/authors-consolidate` | Promote recurring journal decisions to the permanent bible. |

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

All v1.0 goals shipped. Future work is driven by user feedback — open an issue at https://github.com/sethshoultes/great-authors-plugin/issues.

See `docs/superpowers/specs/2026-04-24-great-authors-plugin-design.md` for the full design and `docs/superpowers/plans/` for implementation plans.

## Performance notes

- **`/authors-critique`** dispatches sub-agents on **Haiku** — triaging opinions doesn't need Sonnet, and the command is designed to run often.
- **`/authors-edit`**, **`/authors-debate`**, **`/authors-draft`**, **`/authors-channel`**, and all builder interviews stay on **Sonnet** — these involve actual reasoning about prose or extended dialog.
- **`/authors-continuity`** stays on Sonnet — the auditor has to read the full bible and hold multiple files in context.

## License

MIT
