# Orchestrating great-authors

Notes for AI agents (or humans) running a writing project that uses this plugin's skills as sub-agents.

## The core distinction

The author personas in this plugin are *writers.* They bring a voice. They produce prose.

The orchestrator (you, when you are running a project) is *not a writer.* The orchestrator coordinates: reads, briefs, dispatches, reviews, integrates, commits.

**The single most consequential mistake an orchestrator can make is to write prose themselves.** When the orchestrator writes, the prose comes out mechanical because the orchestrator's brain is in coordination mode, not in scene mode. The fix is always to dispatch the actual writer.

If you find yourself reaching for the Write tool to put prose in `manuscript/`, stop. Ask: have I dispatched the writer for this? If not, that's the next move.

## The seven plugin skills, by orchestrator use case

| You want to... | Skill | What it does |
|---|---|---|
| Start a new project | `/authors-project-init` | Scaffolds `.great-authors/`, `manuscript/`, and the project CLAUDE.md |
| Have an author write/draft a new piece | `/authors-draft <brief> <author>` | Dispatches the author with a brief; saves prose to manuscript by default |
| Have an author rewrite an existing chapter | `/authors-rewrite <file> <author>` | Dispatches the author to rewrite a file from scratch with full bible context |
| Co-write with an author in the room | `/authors-channel <author>` | Loads the persona into your current conversation; saves prose to manuscript by default |
| Get gut-check feedback | `/authors-critique <file> [authors]` | Three-bullet verdicts from N authors |
| Get marked-up editorial | `/authors-edit <file> [authors]` | Consolidated markup from one or two authors |
| Surface a real disagreement | `/authors-debate <topic> <author-A> <author-B>` | Two-round structured debate; verdict |
| Check continuity against bible | `/authors-continuity <file> [author]` | Flags drift |
| End a session cleanly | `/authors-journal` | Captures decisions, plants laid/paid, where you left off |
| Promote in-flux decisions to permanent bible | `/authors-consolidate` | Reads journals, promotes recurring decisions |

## A typical orchestration flow

For a chapter that needs to be drafted from scratch:

```
1. Read .great-authors/suspense-architecture.md for the chapter's role
2. Read the chapter before and the chapter after for continuity
3. Read the relevant character files
4. Decide which author fits the work
5. /authors-draft "<brief>" <author>
6. Read what came back
7. If it works → /authors-continuity to verify, then commit
8. If it has a problem → /authors-rewrite with revised brief, OR /authors-debate if a craft question is at stake
9. Update .great-authors/structure.md to mark the chapter drafted
10. Commit with a descriptive message
```

For a chapter that exists but isn't working:

```
1. Read the chapter and identify the problem in one sentence
2. If the problem is line-level → /authors-edit
3. If the problem is structural → /authors-rewrite
4. If you can't tell which → /authors-critique first to surface the real problem
5. If two authors would handle the problem differently → /authors-debate
6. Commit incrementally
```

## Brief-writing as leverage

The single best investment you can make as an orchestrator is writing better briefs.

**A thin brief:**
> "Rewrite chapter 7."

**A self-contained brief:**
> "Rewrite chapter 7 of [project name] in third-person-limited past, [POV character] POV, [tone] register. Read these files in order: [list]. The chapter must hit these architecture beats: [list]. Voice: hold the established rules in voice.md and voice-lints.md. Length: ~1,800 words; the chapter is currently 1,200 and is rushed at the wait scene. Specific craft challenges: [one or two]. Don't change architecture-level facts. Save to manuscript/chapter-07.md when done. Report under 200 words on what you changed and why."

The thin brief produces a thin chapter. The self-contained brief produces a chapter that can be integrated.

## When to write prose yourself

Two narrow cases:

1. **Mechanical edits.** Surgical fixes — a typo, a name continuity fix flagged by `/authors-continuity`, a dependent edit when you change a count from "three" to "two." These are not creative; they are integration.
2. **The user explicitly asks you to.** *"Just write me a paragraph here."* Honor that.

In all other cases: dispatch.

## Architecture as spine

`.great-authors/suspense-architecture.md` (or whatever the project's master architecture document is called) is the spine. Every author dispatch should include the relevant architecture entry as part of the brief. When a chapter drifts from the architecture, the chapter is wrong, not the architecture.

Update the architecture deliberately, with the user, when the project changes. Don't let chapters silently overwrite the architecture.

## Critique vs. rewrite

These are not interchangeable.

- **Critique** is for prose that mostly works. Surface specific problems, recommend specific cuts. The writer's prose stays; the orchestrator integrates the cuts.
- **Rewrite** is for prose that doesn't work. Cutting bad prose tighter does not make it good. Discard and dispatch.

If you cannot tell which the chapter needs, run `/authors-critique` first. The verdict will tell you.

## Debate when authors should disagree

`/authors-debate` is most useful when you have a genuine craft question and two authors would honestly answer it differently. Examples:

- Hemingway vs. McCarthy on whether a scene needs muscle or weight
- King vs. Vonnegut on whether a rescue scene should be clean or messy
- Didion vs. Baldwin on whether an essay should hold cool authority or moral urgency

Even when authors converge in Round 1, run Round 2 — that's where the refinements emerge that produce a better synthesis than either author had alone.

When a debate concludes with consensus rather than disagreement, the verdict section of the report should say so explicitly: *Consensus: <synthesized brief>.* The plugin supports this verdict type alongside Winner / Third way / Genre call.

## Commit hygiene

- Commit per logical unit of work, not per chapter.
- Commit messages describe the WORK and the WHY, not just the file.
- A typical session might produce three to five commits: a draft, a critique-driven cut, a rewrite, a bible update, a journal entry.
- Don't amend; create new commits. Stay accurate going forward.

## The Gottlieb persona

When you want to formalize the orchestrator role in conversation, channel `gottlieb-persona`:

```
/authors-channel gottlieb
```

The persona embodies the orchestrator pattern — read everything first, brief writers clearly, never write prose, surface tensions through debate, commit incrementally. Use it when the user wants the editorial voice in the room rather than the implicit orchestrator behavior.

## Anti-patterns

These all produce robotic prose or broken architecture:

- Writing prose yourself instead of dispatching
- Pattern-matching an author's voice in your own context (em-dashes, declarative rhythm) without dispatching the actual persona
- Batching multiple chapters into a single autonomous run
- Skipping the read of the bible before dispatching
- Thin briefs ("rewrite this")
- Skipping `/authors-continuity` after substantial changes
- Letting chapters silently contradict the architecture
- Amending commits to "fix" inaccurate messages

The anti-pattern that catches most orchestrators is the first one. Watch for it.
