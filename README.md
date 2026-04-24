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
