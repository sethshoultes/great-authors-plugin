---
name: authors-orchestrate-novel
description: Top-level autonomous workflow for writing a novel end-to-end with the great-authors plugin. Composes existing skills (project-init, build-character, build-place, build-relationship, draft, channel, rewrite, continuity, critique, edit, debate, journal, consolidate) into a multi-phase pipeline with human checkpoints. The human provides direction (premise, genre, characters, voice); the AI orchestrator dispatches author personas as sub-agents to do the work. Use when a user wants the full great-authors pipeline run for them with minimal hand-holding — analogous to great-minds-plugin's agency-* workflows. Usage - /authors-orchestrate-novel, optionally with --phase <N> to run a single phase or --resume to continue from the last checkpoint.
---

# /authors-orchestrate-novel

Autonomous end-to-end novel orchestration. Writes a novel from premise to beta-ready manuscript using the plugin's existing skills as building blocks, with human checkpoints at every phase boundary.

## When to use

- A human has a novel idea and wants the AI to handle the multi-phase pipeline (architecture → draft → continuity → edit → final).
- A project has been started and the human wants the AI to take it through the next phase.
- The human is comfortable with multi-day execution where the AI works through chapters at the AI's pace and the human reviews at checkpoints.

Not for:
- One-shot drafts (use `/authors-draft`).
- Single-chapter rewrites (use `/authors-rewrite`).
- Editorial pass on an existing project (use `/authors-edit`, `/authors-critique`, `/authors-debate` directly).
- Projects without a `.great-authors/` bible — the workflow assumes the bible-as-spine pattern.

## Inputs (human-supplied at session start)

The orchestrator collects these via interview at Phase 0. The human can provide them all at once or one at a time.

**Required:**
- Working title (string; placeholder OK)
- Genre (specific — *cozy small-town mystery*, not *fiction*)
- Premise (1-2 sentences)
- POV and tense
- Dominant tone (one phrase)
- Estimated chapter count (single number, or *"let the architecture decide"*)
- Major character roster — names and one-line role each (typically 3-7 characters)
- Key locations — names, one line each (typically 2-5 places)

**Recommended (the work goes deeper if these are answered):**
- Antagonist or central conflict (the audience-vs-character knowledge gap the picture is built on)
- Resolution character (happy / tragic / ambiguous)
- One non-negotiable voice rule for the project
- Author whose voice the manuscript should hold (King for voice-driven fiction, Hemingway for compression, Didion for cool observation, McCarthy for biblical weight, etc.)

**Optional:**
- Audience or target reader
- Publication intent (commercial, literary, online serial, private)
- Reference works (the human can list 1-3 books that share register or genre — the orchestrator uses these as voice anchors only, never reproduces them)

## The pipeline — seven phases with checkpoints

Each phase produces specific artifacts on disk. Each phase ends in a HUMAN CHECKPOINT — the orchestrator pauses, surfaces a summary, and waits for approval to continue. The human can revise or restart at any checkpoint.

### Phase 0: Concept

**Inputs:** the human-supplied list above.

**Work:**
- Conduct the interview, capturing answers into a temporary structure the orchestrator can pass to subsequent phases.
- For any *required* input the human skips, do NOT proceed. Ask again or stop.
- For *recommended* inputs the human skips, accept the gap but note it; the orchestrator will surface it at the next checkpoint as a follow-up question.
- If no project has been initialized at the working directory, run `/authors-project-init` here.

**Output:**
- `.great-authors/` scaffold with `project.md`, `voice.md` (one rule filled), `voice-lints.md` (skeleton), `CLAUDE.md` (orchestrator-mode auto-load), `timeline.md`, `glossary.md`, empty subdirs for `characters/`, `places/`, `scenes/`, `journal/`.
- `manuscript/` directory with first-chapter placeholder.
- A working *concept summary* in the orchestrator's context (not yet written to disk — that happens at Phase 1).

**Human checkpoint:** *Concept locked. Proceed to architecture?*

### Phase 1: Architecture

**Work — autonomous, but interview-driven:**

1. For each character in the human's roster, dispatch `/authors-build-character` (interactive — the orchestrator passes the character's name and role and answers builder questions on behalf of the human, OR asks the human to answer the questions if their roster was thin).
2. For each place in the human's roster, dispatch `/authors-build-place`.
3. For obvious major-character pairs (protagonist/antagonist, protagonist/love-interest, protagonist/foil), dispatch `/authors-build-relationship`.
4. The orchestrator drafts `structure.md` — a full chapter-by-chapter outline. This is a creative act and is the orchestrator's biggest non-prose decision. The orchestrator names the chapter count, the act breaks, the midpoint, the resolution shape. (The human approved the broad strokes at Phase 0; this phase makes them concrete.)
5. The orchestrator drafts `suspense-architecture.md` (or its genre-equivalent — *plot-architecture.md* for non-mystery fiction). The audience-vs-character knowledge spine. Bombs planted, bombs paid off, withheld registers, visual carriers across chapters.
6. Optional: the orchestrator dispatches an author (typically the project's chosen voice-author) to read the bible and offer one specific structural critique before the human review. The author returns a 5-bullet read.

**Output:**
- All character files for major cast
- All place files for named locations
- Top-tier relationship files
- `structure.md` (full outline)
- `suspense-architecture.md` (the spine)
- Updated `timeline.md` with year anchors and any pre-manuscript backstory
- Optional: a 5-bullet read from the chosen author

**Human checkpoint:** *Bible built. Proceed to first draft?* The human reads `structure.md` and `suspense-architecture.md` carefully. Revise or approve.

### Phase 2: First-draft skeleton

**Work:**

For each chapter in `structure.md`, in order:

1. Read the relevant bible entries (architecture chapter entry, character files for that chapter's cast, place files, prior chapter for continuity).
2. Construct a self-contained brief.
3. Dispatch `/authors-rewrite` (or, if the chapter is being created from scratch, dispatch the chosen voice-author via `Agent` tool with `subagent_type: <author>-persona` and an authors-draft-style brief).
4. Read the saved chapter.
5. Run `/authors-continuity <file>` against the bible.
6. If violations: dispatch a fix (surgical for low-severity, rewrite for high).
7. Update `structure.md` to mark the chapter drafted.
8. Commit per chapter.

**Output:**
- All chapters drafted in `manuscript/chapter-NN.md`
- `structure.md` with every chapter marked DRAFTED
- A growing `journal/` directory of session entries (one per chapter or per logical work unit)
- A clean git log with one commit per chapter

**Human checkpoint:** *First-draft skeleton complete (~XX,000 words). Proceed to continuity audit?* Human can read any/all chapters now. Revise or approve.

### Phase 3: Continuity audit

**Work:**

1. Dispatch a comprehensive continuity audit (one sub-agent reads ALL manuscript files + ALL bible files, returns a structured violation report). Do NOT use `/authors-continuity` 12 times — use the orchestrator-comprehensive dispatch pattern (one sub-agent, whole-manuscript, structured report).
2. Triage the report:
   - **Mechanical fixes** (typos, name collisions, date contradictions, count mismatches) — orchestrator-direct via Edit tool.
   - **Surgical chapter fixes** (one-line corrections in a chapter, planted-detail additions, tic insertions) — dispatch `/authors-rewrite` or a focused author-edit per chapter.
   - **Structural fixes** (a missing plant, a missing pay-off, an architectural gap) — dispatch the voice-author for a substantive insertion.
   - **Bible additions** (characters or places established on page but not in the bible) — orchestrator-direct or via `/authors-build-character` / `/authors-build-place`.
3. Apply all fixes.
4. Re-dispatch the comprehensive continuity audit (verification pass).
5. Confirm clean. If new issues introduced by the fixes, loop until the audit returns clean.

**Output:**
- Updated chapters reflecting all continuity fixes
- Updated bible reflecting any candidate bible additions
- Verification audit report saved as a journal entry or to `.great-authors/audit-log/`

**Human checkpoint:** *Continuity is clean. Proceed to editorial pass?*

### Phase 4: Editorial pass

**Work:**

1. For each chapter, dispatch one editor (rotating editor pairings across the manuscript so the same author isn't editing every chapter — typically Vonnegut for compression, Hemingway for cuts, Didion for cool observation, McCarthy for weight, Baldwin for moral weight). Each editor returns a tight verdict (one-line verdict, what's working, cuts to make, rewrite-or-surgical recommendation). Save each verdict to `.great-authors/edit-pass/chapter-NN-<author>.md`.
2. Compile the editor reports into a master editorial summary.
3. Triage:
   - **Surgical cuts** (specific lines or beats the editor flagged) — apply directly via Edit tool.
   - **Substantive rewrites** (whole-chapter problems) — dispatch `/authors-rewrite` with the editor's notes as part of the brief.
4. Re-run continuity verification on any rewritten chapters.

**Output:**
- `.great-authors/edit-pass/` with one verdict file per chapter-editor pairing
- A consolidated `editorial-pass-summary.md` in `.great-authors/`
- Any chapter rewrites that the editorial pass triggered

**Human checkpoint:** *Editorial pass complete. Proceed to debate / final?*

### Phase 5: Debate (conditional)

Only run this phase if Phase 4 surfaced an unresolved craft question — a place where two authors would genuinely disagree about the right move and the orchestrator cannot decide alone.

**Work:**

1. For each unresolved tension, run `/authors-debate <topic-or-passage> <author-A> <author-B>`. Always run both rounds.
2. Apply the verdict (Winner / Third way / Consensus / Genre call) via `/authors-rewrite` if a rewrite is implied.

**Output:**
- Debate transcripts saved to `.great-authors/debates/<YYYY-MM-DD>-<topic>.md`
- Any rewrites triggered

**Human checkpoint:** *Debates resolved. Proceed to final?*

### Phase 6: Final pass

**Work:**

1. Run one last comprehensive continuity audit. Confirm clean.
2. Run one last `/authors-critique` (3-bullet verdicts, all chapters, parallel) to catch anything the editorial pass missed.
3. Apply any final surgical cuts.
4. Run `/authors-journal` for the session.
5. Run `/authors-consolidate` to promote any in-flux journal decisions to permanent bible.

**Output:**
- Final clean continuity report
- Final critique pass results
- Final journal entry
- Updated bible with consolidated decisions

**Human checkpoint:** *Final pass complete. Generate beta-reader package?*

### Phase 7: Beta-reader package

**Work:**

1. Generate `manuscript/full-manuscript.md` — concatenated chapters with chapter headers, ready for export to Word/PDF/EPUB.
2. Generate a one-page synopsis (`.great-authors/exports/synopsis.md`) — typically dispatch a writer in the project's voice with a brief specifically targeting agent/publisher synopsis register.
3. Generate a query letter draft (`.great-authors/exports/query-letter.md`).
4. Generate a "what's resolved / what's not" document if the project has a structure.md "open arc" section (useful for series pitches).
5. Generate a one-page reader's guide if the project warrants discussion-question content.

**Output:**
- `manuscript/full-manuscript.md` — single-file manuscript
- `.great-authors/exports/` — synopsis, query letter, optional reader's guide
- A final session journal entry recording the project's completion state

**Phase 7 closing handoff (added v1.6):**

Before the final checkpoint, surface the publication path. The manuscript is now first-draft-to-beta-reader complete; the next move is publication form (cover, jacket copy, book site, threshold edit) and then marketing (positioning, launch copy across channels). These live in sibling plugins:

```
Phase 7 complete. Manuscript is at beta-reader package.

Next moves (separate from this pipeline; pick what fits):

1. Publication form (great-publishers-plugin):
   /publishers-project-init
   /publishers-channel maxwell-perkins   → threshold read of the manuscript
   /publishers-channel chip-kidd          → cover concept brief
   /publishers-channel tina-brown         → jacket copy + positioning
   /publishers-build-book-site <slug>     → Astro book-site scaffold (v0.2+)

2. Visual identity + chapter illustrations (great-filmmakers-plugin):
   /filmmakers-build-keyframes manuscript/full-manuscript.md \\
       --director hitchcock --include-prose-anchors
   # Produces structured PROMPTS.md; render via scripts/render_book_illustrations.py

3. Marketing + launch (great-marketers-plugin):
   /marketers-project-init
   /marketers-write-positioning <slug>
   /marketers-write-launch-copy <slug>    → email, social, press, web
```

Each downstream plugin reads `.great-authors/` as the shared spine. The manuscript at `manuscript/full-manuscript.md`, the synopsis at `.great-authors/exports/synopsis.md`, and any illustrations at `film/render/book-illustrations/` are the inputs publication and marketing work read from. None of those handoffs are required; surface them and let the human pick.

**Final human checkpoint:** *Beta-reader package ready. Project complete from a first-draft-to-beta-reader standpoint. Publication and marketing handoffs surfaced; pick your next move.*

## Decision points where the AI must pause for the human

The orchestrator does NOT make these calls without explicit human input. If forced, the orchestrator stops the pipeline and surfaces options.

1. **Antagonist or villain identity** — never invented by the AI without human approval. The killer in a mystery, the corporate enemy in a thriller, the family secret in a literary novel. Ask.
2. **Resolution shape** — happy / tragic / ambiguous. The book is a different book in each case. Ask.
3. **Major character motivations** — *why* a character does what they do is the picture's moral spine. Surface options, ask.
4. **Specific cultural or factual content** — real places, real institutions, real cultural specificity (FLDS communities, military culture, indigenous traditions, medical specifics). Where the AI lacks ground truth, surface what it does/doesn't know and ask.
5. **Voice author for the manuscript** — if the human didn't pick one in Phase 0, ask before Phase 2 begins.
6. **Whether to run Phase 5 (debate)** — surface what the editor flagged and ask whether the human wants the debate or wants to just take a side.

## The orchestrator's day-to-day pattern (for any phase)

For each unit of work in any phase (a chapter, a critique, a fix):

1. **Read** — bible files, prior/next chapters, prior phase artifacts. Reading is the work.
2. **Brief** — write the self-contained dispatch brief. Spend time here.
3. **Dispatch** — `Agent` tool with the right `subagent_type`. Use `run_in_background: true` for parallel work where independent.
4. **Read result** — when the sub-agent returns.
5. **Verify** — run continuity if the result touches the manuscript.
6. **Integrate** — surgical cuts or another dispatch, depending on the result.
7. **Commit** — per logical unit, with descriptive message.
8. **Move on** — to the next unit, or to the phase's checkpoint.

## What the orchestrator does NOT do

- The orchestrator does NOT write prose in-context. Ever. (Two exceptions: mechanical edits and explicit user request — see `ORCHESTRATING.md`.)
- The orchestrator does NOT skip phases to save time.
- The orchestrator does NOT skip Round 2 of debates even when authors converge in Round 1.
- The orchestrator does NOT skip continuity verification after substantive changes.
- The orchestrator does NOT advance past a checkpoint without explicit human approval.
- The orchestrator does NOT amend commits to fix inaccurate messages — stays accurate going forward.

## Failure modes and recovery

- **Author refuses to comply with the bible** (common at Phase 2 chapter dispatches): re-dispatch with sharper brief. If still wrong, dispatch a different author.
- **Voice drift across multiple chapters**: pause Phase 2, run a critique pass on the drifted chapters with a single editor, re-dispatch the chapters with a tightened voice brief.
- **Continuity errors keep recurring after fixes**: dispatch `/authors-debate` to surface the underlying tension. The drift is usually a real architectural disagreement that needs to be resolved at the bible level, not at the prose level.
- **Editor flags a structural problem the architecture didn't anticipate**: pause and surface to the human. Architecture changes are the human's call.
- **Resource exhaustion** (long pipeline, lots of dispatches): commit progress, write a journal entry naming where the pipeline is, and resume in a new session. The CLAUDE.md and journal/ make resumption clean.

## Comparison to great-minds-plugin

great-minds runs *parallel* agent swarms in tmux for code tasks where multiple specialists work independently. The agency-launch / agency-execute / agency-qa pattern is fundamentally parallel.

great-authors runs a *sequential* pipeline because chapter 7 requires chapters 1-6 to exist (architecturally and in the manuscript). Within each phase, sub-agents may work in parallel (12 chapters' worth of editor verdicts can be dispatched simultaneously), but the phases themselves are sequential. The orchestrator is the conductor; the authors are the section leaders.

Both share the principle that the human gives direction and the AI executes through specialists with clean context.

## When to skip phases

If the project arrives at the orchestrator already mid-pipeline (e.g., a manuscript exists but no editorial pass has been done):

- Read the existing state (`.great-authors/journal/` is the best starting point).
- Identify which phase the project is currently in.
- Resume from the next checkpoint.

If the human explicitly wants only a subset (e.g., *just run the editorial pass*):

- Skip to the named phase.
- Note in the session journal which phases were skipped.

The phases are designed to be resumable, not just runnable end-to-end.

## Session journal at end of pipeline

Whether the pipeline runs to completion or stops at a checkpoint, run `/authors-journal` at the end. The journal entry should record:

- Which phase ended where
- What checkpoints were passed
- What the human revised at each checkpoint
- Where the work picks up next session

The journal is what makes the pipeline restartable across days, sessions, and even AI agents.

## Notes

- This skill is primarily orchestration. It composes existing skills rather than introducing new functionality. If a sub-step needs new capability, build the capability as its own skill first, then reference it from this orchestration document.
- The skill name uses *novel* but the pipeline works for any long-form prose project — essay collections, narrative nonfiction, memoir. For shorter forms (a single short story, a single essay), use `/authors-channel` or `/authors-draft` directly; the pipeline is overkill.
- For projects with a screenplay companion (the `great-filmmakers-plugin` use case), Phase 6 of this pipeline can integrate with that plugin's `/filmmakers-project-init` for film pre-production. The two plugins compose.
- The orchestrator is encouraged to channel `gottlieb-persona` while running this pipeline. Gottlieb embodies the orchestrator role explicitly — read everything, brief writers clearly, never write prose, surface tensions through debate, commit incrementally.
