---
name: authors-rewrite
description: Dispatch a named author persona as a sub-agent to rewrite an existing manuscript file from scratch with full bible context. Usage - /authors-rewrite <file> <author>. Use when an existing chapter or scene needs more than a critique pass — when the prose itself isn't working and a clean rewrite by the named author is required. The skill assembles a self-contained brief (bible files, prior/next chapters, architecture beats, voice rules), dispatches the author, and confirms save.
---

# /authors-rewrite <file> <author>

Dispatch a named author to rewrite an existing manuscript file from scratch.

## When to use

- An existing chapter is not working — the prose is mechanical, the voice has slipped, or the chapter doesn't match the established voice of the rest of the manuscript
- A chapter was drafted in autonomous mode or by an orchestrator pattern-matching a voice, and a clean rewrite by an actual author persona is needed
- A chapter exists but doesn't honor the architecture (e.g., the architecture says *it is not clean* and the chapter is clean)

Not for: line-level edits (use `/authors-edit`); critique without rewrite (use `/authors-critique`); drafting a chapter that doesn't exist yet (use `/authors-draft`).

## Instructions for Claude

When this skill is invoked with a file path and an author name:

### 1. Parse arguments

- `<file>` — required. Path to the manuscript file to rewrite. Resolve relative to the current working directory if relative; absolute path otherwise. Must exist.
- `<author>` — required. One of the valid author names accepted by `/authors-channel` (see the channel skill's resolution table — `king`, `vonnegut`, `hemingway`, `didion`, `baldwin`, `mccarthy`, `mcphee`, `le-guin`, `wallace`, `orwell`, plus short forms).

If the file doesn't exist, tell the user and stop.
If the author name doesn't resolve, list the valid names and ask.

### 2. Discover bible context

Walk up from the file path looking for `.great-authors/` (typically the file is at `<project>/manuscript/<chapter>.md` and the bible is at `<project>/.great-authors/`). If no bible is found, warn the user that the rewrite will not have project context and ask whether to proceed anyway.

If a bible is found, identify these files:

- `.great-authors/project.md`
- `.great-authors/voice.md` and `.great-authors/voice-lints.md` (if exists)
- `.great-authors/structure.md` (if exists) — find the entry for this file
- `.great-authors/suspense-architecture.md` (if exists) — find the relevant architecture beats
- `.great-authors/timeline.md`
- The most recent journal entry under `.great-authors/journal/`
- Any character or place files referenced in the chapter

### 3. Discover continuity context

In the same `manuscript/` directory:

- The chapter immediately preceding this one (numerically, if filenames are `chapter-NN.md`)
- The chapter immediately following this one
- (Skip if not applicable, e.g., for prologue or epilogue)

### 4. Confirm before dispatching

Before dispatching, briefly tell the user what's about to happen:

```
Rewriting <file> in <Author>'s voice.
Bible read: <list of bible files identified>
Continuity context: <preceding chapter>, <following chapter>
Dispatch in 5 seconds; say cancel to stop.
```

If the user cancels, stop. Otherwise proceed.

### 5. Dispatch the author

Use the `Agent` tool with `subagent_type: <author>-persona`. The brief must include:

- Project name and the chapter being rewritten
- The voice the author has established in other chapters (if applicable)
- Full list of files to read in order, with absolute paths
- A note that this is a FULL REWRITE, not a revision; discard the existing draft's emotional and dramaturgical choices
- The architecture beats the chapter must hit (extract from `suspense-architecture.md` if present, or from `structure.md`)
- Voice rules (hold what's in `voice.md`/`voice-lints.md`)
- Length expectations (compare to current draft; specify a target range)
- One concrete craft challenge specific to this chapter
- Constraints (don't change architecture-level facts; don't introduce contradictions to the bible)
- Where to save the output (overwrite the original file)
- Reporting back format ("under 200 words: what you did differently and why")

A self-contained brief is the leverage. Spend time on it.

### 6. Wait for the dispatch to return

The author sub-agent reads the bible, reads the existing chapter, decides what to keep and what to discard, writes a new draft, and saves it back to the original file. They return a brief report.

### 7. Confirm to the user

```
<Author> has rewritten <file>.
Words: <new word count> (was <old word count>).
Author's report:
> <quoted report>

Run /authors-continuity <file> to verify against the bible.
```

### 8. Suggest next moves

Based on what the author reported:

- If the rewrite touched architecture beats, suggest the user re-read the architecture for any drift
- If the rewrite introduced new characters or places, suggest `/authors-build-character` or `/authors-build-place`
- If the rewrite is significantly different in length, suggest `/authors-continuity` against neighboring chapters

## Notes

- This skill is a one-shot dispatch. It does not loop. If the rewrite needs another pass, the user (or orchestrator) runs `/authors-rewrite` again with adjusted brief.
- The named author's voice file is what the persona uses for register. If the project has its own voice rules in `voice.md`, the persona respects those over its defaults — that's already in each persona's `## Before you edit` protocol.
- Rewrites discard emotional/dramaturgical choices but preserve architecture-level facts. If a chapter says Audrey arrives at Yellow Knolls at 5:32 a.m., the rewrite preserves that. If a chapter has Audrey crying on page, the rewrite is free to make a different emotional choice if the architecture doesn't lock that in.
- For complex chapters, consider running `/authors-debate` between the named author and a second author *before* the rewrite, to surface craft questions the brief should address. The debate's verdict becomes part of the rewrite brief.
- Never reproduce an author's actual published work in the rewrite. Each persona's identity section enforces this.
