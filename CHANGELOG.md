# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
