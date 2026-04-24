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
