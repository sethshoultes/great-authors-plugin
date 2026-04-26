# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] — 2026-04-26

Adds Toni Morrison to the persona roster — a voice register no one else in the plugin currently covers.

### Added

- **`morrison-persona`** — lyric narrative grounded in Black American oral tradition. Polyphonic prose, non-linear time, beauty made out of survival. Distinct from Baldwin (essay confrontation), distinct from McCarthy (Biblical-male mythic register), distinct from Le Guin (speculative). Brings the voice of *Beloved*, *Song of Solomon*, *Jazz*, and *A Mercy* to the plugin — the moral lyric register, the writer who can address the dead and have them answer. Channel via `/authors-channel morrison` (aliases: `toni-morrison`, `toni`).

### Changed

- All persona-count references updated from "eleven personas" to "twelve personas" across README, MANUAL, marketplace.json, plugin.json, DXT manifest.
- DXT server registers `morrison` in `AUTHOR_BLURBS` and accepts `toni-morrison` / `toni` as aliases.
- `list_authors` description and `authors_channel` description updated to reflect the new persona count and add `morrison` to the valid-authors list.

### Source

The Morrison addition closes a gap surfaced when documenting the trilogy framing across great-authors / great-minds / great-filmmakers — the trilogy's prose plugin was missing the voice register that Morrison alone covers in the canon. Morrison also adds parity with the great-minds-plugin's expansion to include Buffett (capital allocation as a strategic register that no other great-minds persona covers).

## [1.2.0] — 2026-04-25 (later same day)

Closes the autonomous-orchestration story and brings the DXT distribution to parity with the Claude Code plugin.

### Added

- **`/authors-corpus-critique <author> <paths...>`** — new skill. Runs ONE editor across MULTIPLE files in parallel, then consolidates into a corpus-level pattern report. Surfaces patterns that exist across a body of work but are invisible to per-file critique (voice drift, recurring tics, structural failures only visible across pieces). Different from `/authors-critique` (N authors on 1 file). Source: a real session where Orwell critiquing 8 blog posts surfaced a unified *"openings land, closes reach"* pattern that no per-file pass would have caught.

- **`/authors-orchestrate-novel`** — new top-level skill (`skills/authors-orchestrate-novel/SKILL.md`). Composes the existing skills into the seven-phase autonomous pipeline (Concept → Architecture → First-draft skeleton → Continuity audit → Editorial pass → Debate → Final → Beta-reader package), with human checkpoints at every phase boundary.

- **`templates/project-bible/HOOKS.md`** — recommended hook configurations for projects using the plugin (continuity-check reminder on manuscript saves, voice-lints pre-commit, journal reminder on session end). Documents what NOT to put in hooks (auto-rewrites, auto-commits, anything that runs sub-agent dispatches).

- **`tests/`** — smoke-test scaffolding. `tests/smoke.sh` validates frontmatter on all SKILL and persona files, version coherence across config files, persona-file count alignment between `agents/` and DXT bundle, and DXT tool-definition / handler alignment.

### Changed

- **DXT distribution catch-up.** `distribution/dxt/server/index.js` now exposes 17 tools (was 14) — adds `authors_rewrite`, `authors_corpus_critique`, `authors_orchestrate_novel`. Server version bumped from 1.0.0 to 1.2.0. Manifest tools array updated. The DXT distribution is now at parity with the Claude Code plugin's slash-command surface.

- **README updated** to v1.2 surface area: 11 personas (Gottlieb is now in the table), 17 slash commands (with `(v1.1)` and `(v1.2)` markers on the new ones).

- **Marketplace descriptions** in `.claude-plugin/marketplace.json` updated to "11 personas + 17 slash commands."

## [1.1.0] — 2026-04-25

Field-tested update. Source: a multi-hour novel-writing session on a 17,500-word twelve-chapter project (`Murder on the Arizona Strip`) where the orchestrator (Claude as main agent) drifted into writing prose in-context instead of dispatching author personas. The user named the failure mode (*"those chapters you wrote are terrible and sound overly robotic. you should be using the authors to write and review not you."*), and the corrective dispatch via author sub-agents produced demonstrably better prose. This release codifies what the project learned so future users do not have to learn it the same way.

### Added

- **Robert Gottlieb persona** (`agents/gottlieb-persona.md`). The editor — modeled on the legendary literary editor (Knopf, *The New Yorker*; edited Toni Morrison, John Le Carré, Robert Caro, Joseph Heller). Embodies the orchestrator role: read everything first, brief writers clearly, never write prose, surface tensions through debate, commit incrementally. Channel via `/authors-channel gottlieb` when you want the editorial voice in the room rather than implicit orchestrator behavior. Adds an eleventh persona to the existing ten authors.

- **Project orchestration mode CLAUDE.md** (`templates/project-bible/CLAUDE.md`). New project bible file scaffolded by `/authors-project-init` alongside `project.md`. Auto-loaded at session start, tells Claude that for this project the role is orchestrator — dispatch author sub-agents, do not write prose in-context. Prevents the most common failure mode in multi-session writing projects.

- **Voice lints** (`templates/project-bible/voice-lints.md`). Companion to `voice.md`. Splits voice rules into judgment calls (`voice.md`) and mechanical rules (`voice-lints.md`, lintable). Patterns for forbidden words, forbidden dialogue tags, punctuation conventions. Designed to feed an automated continuity check.

- **`/authors-rewrite <file> <author>`** — new skill. Dispatches a named author sub-agent to rewrite an existing manuscript file from scratch with full bible context. Was a manual brief I wrote six times in the field session that produced this update; now codified. Discovers bible context, reads neighboring chapters for continuity, hands the author a self-contained rewrite brief.

- **`ORCHESTRATING.md`** at plugin root. Meta-doc on the orchestrator pattern. Explains the seven plugin skills by use case, how to write self-contained briefs, when to break the no-prose-in-context rule (mechanical edits and explicit user request only), the critique-vs-rewrite distinction, debate consensus.

### Changed

- **`/authors-channel` default save behavior.** Substantive prose blocks (>50 words of in-character narrative) now auto-save to `manuscript/<current>.md` with the path printed at the top of the response. Opt-out per-block via *preview only*; opt-out for a whole session via *channel mode: chat-only*. The previous default put the burden of capture on the user, who had to remember an incantation to keep their own work; the new default makes the artifact the deliverable.

- **`/authors-debate` adds Consensus verdict.** Alongside Winner / Third way / Genre call, Round 2 of a debate may now end in a Consensus verdict — when both authors converged in Round 1 and Round 2 produced a sharper joint position than either had alone. The consensus brief can pass directly to `/authors-rewrite` without further synthesis. Skill notes also clarify: always run Round 2 even when Round 1 reveals consensus — that is where the refinement happens.

- **`/authors-journal` structured fields.** Expanded from four interview questions to seven, with new fields for: Plants laid / Plants paid off / Continuity flags / Characters introduced. The structure feeds `/authors-consolidate`, which scans journals for recurring decisions and offers to promote them to the permanent bible.

- **`/authors-project-init` scaffolds new files.** Now drops in `CLAUDE.md` and `voice-lints.md` alongside the existing bible structure. Updated report message explains the orchestrator-mode setup.

- **`templates/project-bible/voice.md` header.** Now explicitly distinguishes voice rules (judgment) from voice lints (mechanical), and points the reader to `voice-lints.md` for the lintable side.

### Documentation

- The `ORCHESTRATING.md` doc and the `templates/project-bible/CLAUDE.md` template both define the no-prose-in-context rule with explicit narrow exceptions (mechanical edits, explicit user request). The Gottlieb persona's `## How you orchestrate a writing project` section is the long-form treatment of the same workflow.

### Source learning

The session that produced this release is captured in two brain-vault notes:
- `learnings/orchestrator-and-writer-are-different-ai-roles.md` — the underlying lesson; generalizes beyond writing to any persona-sub-agent workflow
- `runbooks/orchestrating-author-sub-agents.md` — day-to-day orchestration steps; companion to the existing `draft-a-novel-with-great-authors` runbook

## [1.0.0] — 2026-04-24

Initial public release.

### Added

- Ten author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut)
- Thirteen slash commands for prose craft and editorial work:
  - `/authors-project-init`, `/authors-channel`, `/authors-draft`, `/authors-edit`, `/authors-critique`, `/authors-debate`, `/authors-continuity`, `/authors-journal`, `/authors-consolidate`
  - `/authors-build-character`, `/authors-build-place`, `/authors-build-scene`, `/authors-build-relationship`
- Project bible scaffolding (`.great-authors/`) with characters, places, scenes, journal subdirectories
- Manuscript directory scaffolding for prose output
- DXT distribution for Claude Desktop compatibility
