---
name: authors-corpus-critique
description: Run ONE editor across MULTIPLE files in parallel, then consolidate into a corpus-level pattern report. Surfaces patterns no per-file critique catches — voice drift, recurring tics, structural failures that only become visible across multiple pieces. Usage - /authors-corpus-critique <author> <path-or-glob> [<path-or-glob>...]. Different from /authors-critique (N authors on 1 file). This is 1 author on N files.
---

# /authors-corpus-critique <author> <path-or-glob>...

Multi-file critique pass with corpus-level pattern report.

## When to use

- A blog or essay collection where individual posts may be fine but the corpus has a recurring tic.
- A short-story collection where you suspect the same character or sentence-shape keeps reappearing.
- A novel where a single editor reading every chapter independently might surface a pattern (an ending shape, a recurring cliché, a structural rhythm) that per-chapter critique misses.
- A documentation set where you want one consistent voice across many files and need to find where it breaks.

Not for:
- Single-file critique (use `/authors-critique`).
- Multi-author critique on a single file (use `/authors-critique <file> <author1> <author2> <author3>`).
- Editorial markup with cuts (use `/authors-edit`).
- Continuity audit (use `/authors-continuity`).

## The principle

**Multi-editor dispatch validates whether a problem is real** (different temperaments naming the same problem = real signal — see brain learning `distinct-editor-personas-converge-on-real-craft-problems`). **Multi-file dispatch with one editor surfaces patterns that exist across the corpus but not within any single piece.** Different test, different value.

A single chapter or post may have a closing that drifts into principle. That's a per-file flag. Twelve posts where the same writer reaches for principle at every close — that's a corpus-level pattern, and it's invisible to single-file critique because each close is "fine" relative to its own piece. It's only when you read all twelve in sequence that the pattern shows.

The orchestrator's discipline: when the corpus pattern is named, the writer can fix it once for the whole body of work going forward.

## Instructions for Claude

When this skill is invoked:

### 1. Parse arguments

- First positional: `<author>` — one of the valid author personas (hemingway, orwell, didion, baldwin, mcphee, wallace, king, mccarthy, vonnegut, le-guin). Required. Pick deliberately:
  - **Orwell** — best for hunting cant, jargon, robotic AI prose, and corporate drift. The default for blog/tech corpus reads.
  - **Hemingway** — best for sentence-level cuts and adverb hunts across a corpus.
  - **Didion** — best for cool observation drift; checks whether the writer is performing feeling.
  - **McCarthy** — best for weight inconsistency; finds where some pieces hold and others don't.
  - **Baldwin** — best for moral-weight drift; checks whether the writer's stance has gone slack.
  - **McPhee** — best for structural drift across long-form nonfiction.
- Remaining positionals: file paths or glob patterns. Required, at least 2 files.

### 2. Resolve files

- Expand globs (`blog/*.html`, `chapters/chapter-*.md`).
- Verify every resolved file exists. If any don't, list them and ask whether to proceed without those.
- If fewer than 2 files resolve, tell the user this skill needs ≥2 files (use `/authors-critique` for single-file).
- Cap at 20 files per pass to avoid resource exhaustion. If more, recommend chunking.

### 3. Dispatch ONE editor per file in parallel

For each file, dispatch a sub-agent with `subagent_type: <author>-persona` and the following brief shape:

```
CORPUS CRITIQUE — file <N> of <total>: <filename>

You are part of a corpus pass — the orchestrator is dispatching you across <total> files in parallel. Your job for THIS file is the same tight per-file verdict as `/authors-critique`, plus one extra item: any pattern in THIS file that you suspect might also appear in the others. The orchestrator will collect all verdicts and synthesize the corpus-level pattern.

Read: <filename>

Apply your editorial frame. Output a tight verdict:

- **Per-file verdict:** HUMAN | ROBOTIC | MIXED — one-line reason
- **What's working** (max 2 bullets)
- **What's not** (max 2 bullets)
- **Pattern hypothesis** (1 sentence: what kind of failure-mode or strength might also appear in other pieces by this writer? Be specific — name the kind, not just "bad prose.")
- **Recommendation:** leave alone | light edit | full rewrite

Save to /tmp/corpus-critique/<basename>-<author>.md.
```

Run all dispatches in parallel via `Agent` tool with `run_in_background: true`. Each writes its verdict to disk independently.

### 4. Wait for all dispatches; compile

Once all sub-agents return, read every verdict file. Compile into a single corpus report.

### 5. Identify the pattern

This is the orchestrator's high-leverage step. Read all the per-file verdicts side by side. Look for:

- **Direct convergence** — the same pattern hypothesis named by multiple files (ideal signal).
- **Indirect convergence** — different language, same underlying problem (e.g., one verdict says "explains what the scene already shows," another says "names what the reader has already understood" — same problem, different framing).
- **Strong divergence** — different files have genuinely different problems. In this case, there is NO corpus pattern; the report should say so explicitly. False patterns are worse than no patterns.

### 6. Output the corpus report

Save to `/tmp/corpus-critique/SUMMARY-<author>-YYYY-MM-DD.md`:

```markdown
# Corpus Critique — <author> on <N> files

**Date:** YYYY-MM-DD
**Editor:** <author>
**Files audited:** <N>

## Per-file verdicts

(Compact table: file | HUMAN/ROBOTIC/MIXED | recommendation)

## The pattern (if convergence found)

(One paragraph: name the pattern, name the language each editor used, name where it appears most clearly. Cite specific files.)

If no pattern: state explicitly that the files show distinct problems, no corpus-level signal.

## Per-file recommendations

(For each file: one-line action — leave alone | specific surgical cut | rewrite needed.)

## Corpus-level recommendation

(One paragraph: what should the writer change going forward, beyond fixing the current corpus? The pattern, if real, is a habit — naming it lets the writer break it for future work.)
```

### 7. Show the report to the user

Display the SUMMARY to the user in chat. Offer next moves:

- Apply the per-file recommendations now (orchestrator-direct cuts or per-file `/authors-rewrite`)
- Save the corpus pattern as a brain-vault learning if it generalizes
- Stop here and let the user act on the report at their own pace

## Notes

- This skill scales sub-agent cost linearly with file count. 20-file cap is to keep budget predictable. For larger corpus reads, chunk by genre or theme.
- The pattern hypothesis at step 3 is what makes this different from running `/authors-critique` N times. The editor knows they're part of a corpus pass and is specifically asked to surface patterns. That framing changes the output — without it, each editor just gives a per-file verdict and the orchestrator has to find patterns from inference. With it, the editors do the pattern-spotting work themselves.
- For genre-mixed corpora (a writer with both essays AND short stories AND poetry), pick a genre-appropriate editor — or run two passes with different editors (one for each genre).
- The "no pattern" outcome is valuable — it means the writer doesn't have a habit, just a set of distinct problems. Don't manufacture a false pattern to satisfy the format.
- Corpus reports are useful inputs to brain-vault learnings. If the pattern is novel and the writer's craft might benefit from it being captured, suggest a `/brain` save.

## Source

This skill emerged from a real session where Orwell critiquing 8 blog posts in parallel surfaced a unified pattern (*"openings land, closes reach"*) that no per-file critique would have caught. The pattern existed across the corpus, not within any single post. See brain learning `distinct-editor-personas-converge-on-real-craft-problems` for the related multi-editor convergence pattern.
