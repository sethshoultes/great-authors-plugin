# Great Authors — User Manual

This is the operational guide. The [README](./README.md) tells you what's in the plugin; this document tells you how to use it. Read the quick start first to get to a useful output in fifteen minutes; come back to the rest as you need it.

For the design philosophy behind the plugin, see [ORCHESTRATING.md](./ORCHESTRATING.md). For per-release history, see [CHANGELOG.md](./CHANGELOG.md). For the canonical instructions Claude Code loads at runtime, see each skill's `SKILL.md`.

---

## Contents

1. [Quick start (15 minutes)](#quick-start-15-minutes)
2. [The mental model](#the-mental-model)
3. [Skills organized by goal](#skills-organized-by-goal)
4. [Five workflows](#five-workflows)
5. [The project bible](#the-project-bible)
6. [Working with the personas](#working-with-the-personas)
7. [Troubleshooting](#troubleshooting)
8. [Frequently asked questions](#frequently-asked-questions)
9. [Glossary](#glossary)

---

## Quick start (15 minutes)

You have the plugin installed. You want to write something. Here is the shortest path from zero to prose on disk.

### Install (if you haven't)

**Claude Code:**
```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
/reload-plugins
```

**Claude Desktop (DXT):**
```bash
git clone https://github.com/sethshoultes/great-authors-plugin
cd great-authors-plugin/distribution/dxt && npm install && npx @anthropic-ai/dxt pack
```
Double-click the resulting `great-authors.dxt` to install in Claude Desktop.

### Step 1 — make a project directory

```bash
mkdir ~/writing/my-first-project
cd ~/writing/my-first-project
```

### Step 2 — initialize the bible

```
/authors-project-init
```

Claude will ask seven short questions: working title, genre (be specific), premise (one or two sentences), POV and tense, dominant tone, one non-negotiable voice rule, and starting chapter filename. Answer briskly. You can refine answers later by editing the bible files directly.

What you'll see on disk:
- `.great-authors/` — the project bible (project.md, voice.md, voice-lints.md, CLAUDE.md, characters/, places/, scenes/, journal/, etc.)
- `manuscript/chapter-01.md` — empty, ready for your first prose

### Step 3 — channel an author and write

```
/authors-channel king
```

(Or `hemingway`, `didion`, `mccarthy`, `vonnegut`, `wallace`, `baldwin`, `mcphee`, `le-guin`, `orwell` — pick the voice closest to what you're trying to write.)

Then talk to the author the way you would talk to a writer in the room. *"Open chapter one. Sariah is found by the sheriff at sunrise."* The author will produce prose. The prose **auto-saves to `manuscript/chapter-01.md`** by default — you'll see a confirmation line at the top of the response.

To preview without saving, say *"preview only"* before requesting the prose.

### Step 4 — close the session

```
/authors-journal
```

Claude asks seven structured questions about what you worked on, what got decided, what's in flux, and where to pick up next time. Two minutes. The next session's author personas read the journal first to orient.

That's it. You've used four of the seventeen skills and produced prose on disk. Everything else is variations and refinements.

---

## The mental model

This plugin makes one assumption that, if you internalize it, makes everything else fall into place. If you don't internalize it, you'll fight the plugin instead of using it.

### Orchestrator vs. writer — different roles

**You** (or Claude on your behalf) are the **orchestrator**. The author personas are the **writers**. The plugin assumes these are separate roles, not the same role wearing two hats.

The orchestrator does these things:
- Reads the bible and prior chapters before any decision
- Briefs writers with focused, self-contained context
- Dispatches the writer (via `/authors-channel`, `/authors-draft`, `/authors-rewrite`, etc.)
- Reviews what comes back
- Integrates surgical edits or dispatches a follow-up
- Commits per logical unit
- Decides what comes next

The orchestrator does NOT:
- Write prose in-context (the prose comes out mechanical because coordination mode is not scene mode — see [ORCHESTRATING.md](./ORCHESTRATING.md) for the details of why)
- Pattern-match an author's voice without dispatching the actual persona
- Skip the bible read before dispatching
- Accept a chapter without verifying continuity
- Advance past a checkpoint without explicit approval

**When you (the human user) are using this plugin via Claude Code or DXT, Claude is your orchestrator.** Every project initialized by `/authors-project-init` ships with a `.great-authors/CLAUDE.md` file that tells Claude this. The file is auto-loaded at session start.

If you want the orchestrator role made explicit *as a persona in conversation*, channel Gottlieb:
```
/authors-channel gottlieb
```
Robert Gottlieb (the editor — Knopf, *The New Yorker*, edited Toni Morrison, Le Carré, Caro) is the persona that embodies the orchestrator. He reads everything, briefs writers, never drafts prose, surfaces tensions through debate, commits incrementally. Use him when you want the editorial voice in the room rather than implicit orchestrator behavior.

### Voice authors vs. critique authors

The same persona files (Hemingway, King, Didion, etc.) are dispatched in two different modes:

- **As voice authors** — they write or rewrite prose in their voice. King for voice-driven fiction. McCarthy for biblical weight. Didion for cool observation. Pick one for your manuscript and let them carry the voice.

- **As critique authors** — they read prose and return verdicts. The right critique author is often *not* the voice author. If King wrote your manuscript, dispatch Vonnegut for compression critique, Hemingway for cuts, Didion for cool-observation drift. Different temperaments see different things.

This is also why `/authors-critique` (multiple authors on one file) and `/authors-corpus-critique` (one author across many files) are different skills with different uses — they answer different questions.

### The bible is load-bearing

`.great-authors/` is not optional metadata. It is the spine that lets multiple author personas (and multiple sessions, possibly multiple writers) contribute to a coherent project. Every persona reads the relevant bible files **before** editing or drafting.

When the manuscript drifts from the bible, **the manuscript is wrong, not the bible**. Update the bible deliberately when the project changes. Don't let chapters silently overwrite established facts.

---

## Skills organized by goal

The seventeen skills, organized by what you're trying to do.

### "I'm starting a new project"

| Skill | What it does |
|---|---|
| `/authors-project-init` | Scaffolds `.great-authors/` and `manuscript/`. Interactive — seven questions. Creates `CLAUDE.md` (orchestrator-mode), `voice.md`, `voice-lints.md`, `project.md`, `timeline.md`, `glossary.md`, plus empty subdirectories for characters, places, scenes, journal. |
| `/authors-orchestrate-novel` | Top-level autonomous pipeline. Composes the other skills into seven phases (Concept → Architecture → First-draft skeleton → Continuity audit → Editorial pass → Debate → Final → Beta-reader package) with HUMAN CHECKPOINTS at every phase boundary. Use when you want the AI to drive the multi-day process and you'll review at gates. |

### "I want to write or generate prose"

| Skill | What it does |
|---|---|
| `/authors-channel <author>` | Loads the persona into the current conversation. You collaborate directly with the author. Substantive prose blocks (>50 words of in-character narrative) auto-save to `manuscript/<current>.md`. Opt out per block with *preview only*. |
| `/authors-draft <brief> <author>` | Dispatches the named author with a brief. Returns prose saved to disk. Different from channel — this is one-shot generation, not a conversation. |
| `/authors-rewrite <file> <author>` | Dispatches the named author to rewrite an existing manuscript file from scratch with full bible context. Use when a chapter isn't working — prose is mechanical, voice has slipped, or the chapter doesn't match established voice. Discards the existing prose's emotional choices but preserves architecture-level facts. |

### "I want feedback or critique"

| Skill | What it does |
|---|---|
| `/authors-critique <file> [authors...]` | Fast 3-bullet verdicts from N authors on ONE file. Default is 3 authors auto-selected from genre signals. Cheap, fast, directional. Use as a gut check before a full edit pass. |
| `/authors-edit <file> [authors...]` | Marks up a draft with consolidated edits from 1-2 authors. Returns specific cuts, replacements, and a verdict per author plus a synthesis. Use when you want a real editorial pass with line-level recommendations. |
| `/authors-corpus-critique <author> <paths...>` | Runs ONE editor across MULTIPLE files in parallel and consolidates into a corpus-level pattern report. Surfaces patterns that exist across the corpus but are invisible to per-file critique (voice drift, recurring tics, structural failures only visible across pieces). Different from `/authors-critique`. |
| `/authors-debate <topic> <author-A> <author-B>` | Two-round craft debate between two authors on a passage or topic. Round 1: each states position. Round 2: each responds to the other. Verdict supports Winner / Third way / Consensus / Genre call. Use when a craft question is genuinely open and you want the real tension surfaced. |

### "I want to verify continuity"

| Skill | What it does |
|---|---|
| `/authors-continuity <file> [author]` | Audits a draft against the project bible for character drift, timeline contradictions, voice rule violations, glossary misuse, and scene contradictions. Returns a structured violation list with severity ratings. Use before sharing a chapter externally or before merging into the main manuscript. |

### "I want to build out the bible"

| Skill | What it does |
|---|---|
| `/authors-build-character <name> [--author <lens>]` | Seven-question character interview. Optional author lens (king for small-town pop-culture questions, le-guin for social-position questions). Writes to `.great-authors/characters/<name>.md`. |
| `/authors-build-place <name> [--author <lens>]` | Seven-question place interview. Optional author lens (mcphee for architectural history, didion for cultural specificity). Writes to `.great-authors/places/<name>.md`. |
| `/authors-build-scene [<id>] [--author <lens>]` | Eight-question scene beat card. Optional author lens (mcphee for shape-first, vonnegut for start-close-to-end). Writes to `.great-authors/scenes/<id>.md`. |
| `/authors-build-relationship <a> <b>` | Six-question relationship interview between two existing characters. Updates the `## Connections` section of BOTH character files reciprocally. |

### "I want to capture progress between sessions"

| Skill | What it does |
|---|---|
| `/authors-journal` | Seven-question session journal. Writes to `.great-authors/journal/YYYY-MM-DD.md`. The structured fields (Worked on / Decisions made / Characters introduced / Plants laid / Plants paid off / Continuity flags / Unresolved / Next session) feed the consolidate skill. |
| `/authors-consolidate` | Scans journal entries for recurring decisions. Proposes promotions to permanent bible files (project.md, voice.md, character files, etc). Every promotion requires user confirmation. Run periodically — every 5+ sessions. |

### "I want the editorial voice in conversation"

| Skill | What it does |
|---|---|
| `/authors-channel gottlieb` | Channels the editor persona. Use when you want orchestration discipline made explicit, when you're running a complex multi-author phase, or when the user is asking for editorial judgment ("which author should write this?", "is this chapter ready?"). Gottlieb does not draft prose. |

---

## Five workflows

### Workflow 1: Start a novel from scratch

You have an idea. You want a complete first-draft skeleton.

```
cd ~/writing/my-novel
/authors-project-init                       # interactive — 7 questions
/authors-build-character protagonist        # interactive — 7 more
/authors-build-character antagonist
/authors-build-place primary-setting
/authors-build-relationship protagonist antagonist
```

Now your bible has the spine. Open `.great-authors/structure.md` and `.great-authors/suspense-architecture.md` and fill in your chapter outline and the audience-vs-character knowledge spine. Or:

```
/authors-orchestrate-novel
```

The orchestrate-novel skill runs Phase 1 (architecture) for you with checkpoints. After Phase 1 ends, you review the bible. Approve, and Phase 2 begins — chapter-by-chapter drafting via your chosen voice author. Phase 3 audits continuity. Phase 4 runs editorial pass. And so on through Phase 7 (beta-reader package).

If you'd rather drive manually:

```
/authors-channel king                       # or whichever voice
# write chapter 1 conversationally; auto-saves to manuscript/chapter-01.md
/authors-channel king
# write chapter 2; auto-saves to chapter-02.md
# (or close the persona and re-channel between chapters; same effect)
/authors-continuity manuscript/chapter-01.md
/authors-continuity manuscript/chapter-02.md
/authors-journal                            # at end of session
```

### Workflow 2: Editorial pass on an existing manuscript

You have drafted chapters and want to polish them.

```
/authors-critique manuscript/chapter-05.md   # 3-bullet verdicts, fast
# decide whether to do full edit
/authors-edit manuscript/chapter-05.md vonnegut hemingway
# review the consolidated markup
# apply the cuts you agree with (orchestrator-direct, mechanical edits)
# OR for substantive issues:
/authors-rewrite manuscript/chapter-05.md king
/authors-continuity manuscript/chapter-05.md
```

For multiple chapters at once, dispatch in sequence rather than all at once. Quality over throughput.

### Workflow 3: Corpus critique on a blog or essay collection

You suspect a voice drift or recurring tic across a body of work.

```
/authors-corpus-critique orwell blog/*.html
```

Orwell will read every file, return per-file verdicts plus a corpus-level pattern report. The pattern report is the value — it surfaces what no per-file critique catches.

If divergence rather than convergence, Orwell will say so explicitly. False patterns are worse than no patterns.

After the report, apply the per-file recommendations. For surgical cuts, orchestrator-direct via the Edit tool. For structural rewrites, dispatch:

```
/authors-rewrite blog/2025-01-thoughts.html orwell
```

### Workflow 4: Resume an in-progress project

You're returning to a project after a break.

```
cd ~/writing/the-novel
# Claude Code session starts; .great-authors/CLAUDE.md auto-loads
# Claude orients as orchestrator
```

Then ask Claude what comes next. Claude will read the most recent journal entry first (every author persona's `## Before you edit` protocol does this) and surface where the project stands and the recommended next move.

Or, more direct:

```
/authors-orchestrate-novel
```

The pipeline detects the project's current phase and resumes from the next checkpoint.

### Workflow 5: Run a craft debate

You're stuck between two craft choices and they're each defensible. You want the real tension named.

```
/authors-debate "Should chapter 10's rescue be clean or messy?" king vonnegut
```

The skill runs both rounds. Both authors state position in Round 1, respond to each other in Round 2. Verdict synthesis names the tension and picks Winner / Third way / Consensus / Genre call.

Apply the verdict by dispatching a writer:

```
/authors-rewrite manuscript/chapter-10.md king
# include the debate verdict in the brief
```

---

## The project bible

`.great-authors/` is the spine of any long-form project. Here's what's in it and how to maintain it.

### Files at the root of `.great-authors/`

| File | Purpose | Who edits it |
|---|---|---|
| `CLAUDE.md` | Tells Claude that for this project the role is orchestrator. Auto-loaded at session start. | Don't edit unless overriding the default orchestrator pattern. |
| `project.md` | Working title, genre, premise, POV/tense, register, non-negotiables, established facts, manuscript config, suspense-architecture pointer, film pointer (if applicable). | You. The `## Established facts` section is canonical — the manuscript respects it. |
| `voice.md` | Voice rules expressed as judgment (sentence rhythm, words to use, words to avoid, tone). | You. Personas read this before drafting. |
| `voice-lints.md` | Voice rules expressed as patterns (forbidden words, forbidden dialogue tags, punctuation conventions). | You. Designed to be read by automation, not just by personas. |
| `timeline.md` | Chronology of events. Year anchors. Pre-manuscript backstory. Anything ambiguous or flexible. | You. Update when the project's chronology changes. |
| `glossary.md` | Invented terms, brand names, slang, project-specific vocabulary, minor characters, "do not use" list. | You. Personas check before using a term. |
| `structure.md` | The plot. Chapter-by-chapter outline. Act breaks. What resolves and what doesn't. Phase status. | You and `/authors-orchestrate-novel`. |
| `suspense-architecture.md` | The audience-vs-character knowledge spine. Bombs planted, bombs paid off. Withheld register. Visual carriers across chapters. **Optional but powerful for genre fiction.** | You. The orchestrator's most leveraged document. |

### Subdirectories

| Directory | Purpose |
|---|---|
| `characters/` | One file per character. Build via `/authors-build-character`. Contains: role, vitals, wants, fears, backstory delivered in pieces, habits/tics, voice, where they appear, continuity flags. |
| `places/` | One file per location. Build via `/authors-build-place`. Contains: location, geography, why it matters, sensory signature, what to write / what NOT to write. |
| `scenes/` | One file per scene or beat card. Build via `/authors-build-scene`. Optional — most projects don't need this until they're plotting in detail. |
| `journal/` | Dated session entries (`YYYY-MM-DD.md`). Build via `/authors-journal`. |
| `edit-pass/` | Editor verdicts from `/authors-edit` and `/authors-corpus-critique`. Created automatically when those skills run. |

### What to commit to git

**Commit:** everything in `.great-authors/` and `manuscript/`. Yes including the journal — your future self (and future personas) want to read it.

**Don't commit:** anything in `.env*`, render artifacts (MP4s, exported videos), `node_modules/`, OS junk (.DS_Store, Thumbs.db). The `.gitignore` template that ships with `/authors-project-init` handles this.

### When the bible drifts from the manuscript

The manuscript is wrong, not the bible. Update the bible deliberately when the project changes — never let chapters silently rewrite established facts. The `/authors-continuity` skill catches drift; act on its verdicts.

---

## Working with the personas

Eleven personas. Pick deliberately.

### The ten author voices

| Persona | When to pick |
|---|---|
| `hemingway` | Iceberg prose. Sentence-level cuts. Dialogue with subtext. Short tight pieces. |
| `mccarthy` | Biblical weight, mythic register. Landscape as character. Existential stakes. |
| `didion` | Cool observational authority. Cultural reporting. Essays of cool intelligence. |
| `baldwin` | Moral urgency. The essay as confrontation. Prose that needs to land politically. |
| `mcphee` | Long-form nonfiction architecture. *Structure is destiny.* Deeply researched pieces. |
| `wallace` | Maximalist, self-aware. Footnotes. Personal essays with texture. |
| `king` | Voice-driven narrative fiction. Pace, dialogue, working novelist's toolbox. |
| `vonnegut` | Devastating compression. Humane irony. Short stories and satire. |
| `le-guin` | Speculative fiction as thought experiment. World-building that serves theme. |
| `orwell` | Plain-style hammer. Cuts cant and corporate jargon. Best at hunting robotic AI prose. |

### The eleventh — Gottlieb

| Persona | When to pick |
|---|---|
| `gottlieb` | The editor. Modeled on Robert Gottlieb. Use when you want orchestrator discipline made explicit in conversation, when you're running multi-phase work, or when the user is asking for editorial judgment. Gottlieb **does not draft prose**. He reads, briefs, dispatches, integrates. |

### Pairing personas for editorial work

Some pairings work better than others. Not all combinations are useful.

| Goal | Editor pairing |
|---|---|
| Tighten bloated prose | Hemingway + Vonnegut (both compression, different angles) |
| Catch robotic AI prose | Orwell (alone is enough; he's specifically tuned for this) |
| Check whether closes earn their weight | Didion (cool observational; sees performed feeling) |
| Verify weight in mythic/literary register | McCarthy + Hemingway (weight + cuts) |
| Personal essay register | Wallace + Didion (self-aware + observational) |
| Structural critique on long-form nonfiction | McPhee (alone) |
| Speculative fiction worldbuilding | Le Guin (alone, or paired with King for voice) |

### Don't reuse the writer as their own editor

The author who wrote the chapter is the wrong choice for the chapter's critique pass. They will see only what they intended to put on the page, not what's actually there. Always pick a different editor.

---

## Troubleshooting

### "Claude wrote prose for me when I expected it to dispatch a sub-agent."

The project's `.great-authors/CLAUDE.md` may not be loading. Check:
- Is `.great-authors/CLAUDE.md` present in the project root?
- Did you start the Claude Code session in the project directory (cd before opening)?
- Is the file readable?

If yes to all three: tell Claude explicitly *"You are the orchestrator for this project. Dispatch the writer."* The CLAUDE.md is the default; the explicit instruction is the override. If you're using DXT (Claude Desktop), the orchestrator-mode CLAUDE.md isn't auto-loaded — you'll need to instruct Claude per session.

### "The same author keeps making the same mistake across multiple drafts."

That's voice drift, and it's worth catching. Two moves:

1. Dispatch a different author for one rewrite. If the mistake disappears, it was an author-specific failure.
2. Run `/authors-debate` between the original author and a critic on the specific failure. Round 2's verdict often reveals the underlying tension.

If the mistake persists across authors, the issue is in the bible, not the prose. Read `voice.md` and `suspense-architecture.md` again — something there is producing the drift.

### "My continuity check returns nothing useful."

The bible is too thin to detect violations. A continuity check finds *contradictions between draft and bible*. If the bible has only the project.md skeleton and one character file, there's nothing for the auditor to find contradictions against.

Build out the bible: `/authors-build-character` for each major character, `/authors-build-place` for each named location, `/authors-build-scene` for any scene whose details you want frozen. The continuity check sharpens as the bible thickens.

### "Different editors give contradictory verdicts on the same chapter."

That's not a bug. That's the convergence test working as designed. See [the brain-vault learning on editor convergence](https://github.com/sethshoultes/brain/blob/main/learnings/distinct-editor-personas-converge-on-real-craft-problems.md): when distinct editors with different temperaments name the same problem, the problem is real. When they diverge, the editors are reading their own preferences into the prose and the prose is probably fine.

If you have time, run a third editor as a tiebreaker. If the third editor agrees with one of the first two, that's your signal. If the third diverges from both, the prose is doing too many different things and the question is structural, not editorial.

### "The DXT version is behind the Claude Code version."

Some skills exist in the Claude Code plugin but aren't yet wired into the DXT MCP server. Check `distribution/dxt/manifest.json`'s tools array — it's the canonical list of what the DXT exposes. As of v1.2, the DXT and Code plugin are at parity (17 tools each). If you encounter a missing skill in DXT, it's a bug worth filing.

### "I dispatched a sub-agent and it wrote prose into the wrong file."

The default save behavior is `manuscript/<current>.md`, where `<current>` is the `## Manuscript > Current` field in `.great-authors/project.md`. If that field is wrong or empty, the persona will ask before saving, OR fall back to `manuscript/chapter-01.md`. To change the default save target for a project, edit `project.md`'s Manuscript section.

### "I want to undo a sub-agent's edit."

Use git. Every persona's brief assumes you commit per logical unit, so undoing is `git restore <file>` or `git revert <commit>`. The plugin does not include a built-in undo because git is already the right answer.

### "The plugin marketplace doesn't show the new version."

After bumping versions in the plugin source, you need:
```
/plugin marketplace update sethshoultes
/plugin update great-authors@sethshoultes
/reload-plugins
```

### "A persona started reproducing a real published work."

Stop the dispatch. Every persona's identity section includes "never reproduce my actual published work" but if a persona slips, that's a persona file bug — file an issue. The fix is in the persona file, not in your prompt.

---

## Frequently asked questions

### Why is the persona dispatched as a sub-agent rather than running in the main conversation?

Because conflating orchestrator mode and writer mode produces mechanical prose. The orchestrator's brain is in coordination mode (routing, briefing, integrating); the writer's brain is in scene mode (inhabiting voice, finding the moment). When the orchestrator tries to write, the prose comes out as a pattern-match of the writer's surface without the substance.

The fix that this plugin codifies: dispatch the persona as a sub-agent in a clean context. The persona file is the foreground; nothing else competes. The voice emerges. See [ORCHESTRATING.md](./ORCHESTRATING.md) for the full argument.

### Should I commit `.great-authors/` to git?

Yes. The bible is the project. Future-you (and future-author-personas) want to read it. Commit per logical unit with descriptive messages.

### Can I write my own persona?

Yes — the `agents/` directory is plain markdown files with YAML frontmatter. Copy an existing persona file, change the frontmatter `name`, write the persona body in the same shape. Add it to `agents/`. Then either submit a PR to the plugin OR keep it as a local override (Claude Code will pick up local plugin overrides if you load the plugin from a local path).

The persona body should include: voice and temperament, core principles, how to draft / edit / critique in this voice, a `## Before you edit` protocol that reads the bible, a `## Things you never do` section, and a `## Staying in character` footer.

### Can I add my own voice rules?

Yes — edit `.great-authors/voice.md` and `.great-authors/voice-lints.md` directly. Personas read both before drafting. The split is deliberate: `voice.md` holds judgment calls (*"the prose should end paragraphs on a short beat"*), `voice-lints.md` holds rules a tool can check mechanically (*"no -ly adverbs as crutches; no fancy dialogue tags"*).

### What's the difference between `/authors-critique` and `/authors-corpus-critique`?

| | `/authors-critique` | `/authors-corpus-critique` |
|---|---|---|
| Files | One | Many (≥2, ≤20) |
| Authors | Multiple (default 3) | One |
| Output | Per-author verdicts on this file + consolidation | Per-file verdicts + corpus-level pattern report |
| Purpose | Multi-perspective critique on one piece | Single-perspective pattern detection across many pieces |

They answer different questions. `/authors-critique` asks *"what do different editors see in this one piece?"* `/authors-corpus-critique` asks *"what pattern does one editor see across all these pieces that no single piece would reveal?"*

### Why are some skills interactive and some autonomous?

Interactive skills (those that ask questions of the user) capture human judgment that the AI cannot fabricate without context — character motivations, project decisions, scene goals. Autonomous skills (those that just run) operate on already-established context.

You can usually tell from the skill description: skills with "interview" or "asks" in the description are interactive. Skills with "audit" or "consolidate" or "draft" can run autonomously.

### Can I skip phases of `/authors-orchestrate-novel`?

Yes. Pass `--phase <N>` to run a single phase, or use `--resume` to continue from the most recent journal entry's checkpoint. Phases are sequential by design (chapter 7 needs chapters 1-6) but resumable across sessions.

### How do I know when to channel an author vs. dispatch them via `/authors-rewrite` or `/authors-draft`?

Channeling (`/authors-channel`) loads the persona into your current conversation — you collaborate directly. Use when you want the back-and-forth of co-writing.

Dispatching (`/authors-draft`, `/authors-rewrite`) sends the persona off as a sub-agent in a clean context. Use when you want one-shot generation or rewriting without conversation.

Both produce prose on disk by default. The difference is dialog vs. dispatch.

### How do I configure hooks?

See `templates/project-bible/HOOKS.md` for recommended `.claude/settings.json` configurations. The plugin does not auto-install hooks — they're a per-project decision. Recommended hooks include: continuity-check reminder on manuscript saves, voice-lints pre-commit pattern scan, and journal reminder at session end.

The plugin's principle: **hooks surface signal; they don't act on it.** Acting is the orchestrator's job.

### Does the plugin send anything to a remote service?

No, beyond the standard Claude API call that any Claude Code or Claude Desktop session uses. The plugin is files (skills, personas, templates) plus a local MCP server (DXT only). It does not phone home, post telemetry, or call third-party APIs. All work happens in your Claude environment.

### How do I uninstall?

Claude Code:
```
/plugin uninstall great-authors
```

Claude Desktop: remove the DXT bundle from your extensions list.

The `.great-authors/` directories in your project repos are not affected — they're plain markdown files and remain readable without the plugin. You can re-install later and pick up where you left off.

---

## Glossary

**Architecture** — In this plugin, refers to the audience-vs-character knowledge spine of a project (typically `suspense-architecture.md` for genre fiction, `plot-architecture.md` for non-mystery fiction). Tracks what the audience knows that the protagonist doesn't, where bombs are planted, where they pay off, and the visual carriers connecting them across chapters.

**Bible** — `.great-authors/` directory at the root of a project. Holds project metadata, voice rules, characters, places, scenes, journal entries, structure, and suspense architecture. The spine that lets multiple author personas (and multiple sessions) contribute to a coherent project.

**Bomb register** — Section of `suspense-architecture.md` that lists every plant-and-payoff pair in the manuscript: what's planted in chapter X, what pays off in chapter Y, the hold span between, and the visual carrier that connects them.

**Brief** — The self-contained context an orchestrator gives a writer or editor before dispatching. Includes which files to read, which architecture beats must land, voice rules, length expectations, what to leave alone, and one concrete craft challenge. Briefs are the orchestrator's leverage.

**Channel (verb)** — To load a persona into the current Claude conversation via `/authors-channel`. Different from dispatching — channeled personas are in dialog with the user; dispatched personas run as isolated sub-agents.

**Checkpoint** — A pause point in a multi-phase workflow (especially `/authors-orchestrate-novel`) where the orchestrator surfaces a summary and waits for explicit human approval before continuing. Checkpoints are how the autonomous pipeline avoids autopilot.

**Continuity audit** — A read of a draft against the project bible to find contradictions: character drift, timeline conflicts, voice rule violations, glossary misuse, scene contradictions. Run via `/authors-continuity`.

**Convergence test** — When multiple distinct editors with different temperaments independently flag the same problem in the same prose, the problem is real (not editor bias). The pattern enforces signal in multi-editor critique.

**Dispatch (verb)** — To send a sub-agent (typically an author persona) off to do focused work in an isolated context. Different from channel — dispatched personas don't see the orchestrator's conversation; they only see the brief.

**Editor (role)** — The orchestrator role formalized as a persona. The Gottlieb persona embodies this. The editor reads everything, briefs writers clearly, never drafts prose, surfaces tensions through debate, commits incrementally.

**Hook (`.claude/settings.json`)** — Per-project configuration that runs commands on Claude Code events (PostToolUse, PreCommit, Stop, etc.). Used to surface signal (continuity reminders, voice-lint warnings) but not to act autonomously on prose.

**Mechanical edits exception** — The narrow case where the orchestrator may produce text directly: surgical fixes (typos, name continuity, count adjustments) and explicit user requests. Everything else: dispatch the writer.

**Orchestrator** — The role of coordinator in a multi-author workflow. Reads bible and prior chapters, briefs writers, dispatches them, reviews output, integrates surgical edits or dispatches follow-ups, commits per logical unit. Does NOT write prose in-context.

**Persona** — A markdown file in `agents/` that encodes a writer's or editor's voice, temperament, principles, working method, and constraints. Personas are dispatched as sub-agents (in Claude Code) or invoked as MCP tools (in DXT).

**Phase** — One of the seven stages in `/authors-orchestrate-novel`: Concept, Architecture, First-draft skeleton, Continuity audit, Editorial pass, Debate, Final, Beta-reader package. Each phase ends in a HUMAN CHECKPOINT.

**Plant / Pay-off** — A unit of suspense engineering. A plant is information given to the reader (or withheld from the protagonist) early. The pay-off is when the planted information lands as recognition or revelation. The bomb register tracks plant chapters, pay-off chapters, and hold spans.

**Pressure-test** — Validating a persona by dispatching it on a real scenario and checking whether its behavior matches its design. The Gottlieb persona was pressure-tested in the v1.2 release — see CHANGELOG.

**Sub-agent** — An isolated Claude context dispatched via the `Agent` tool with a specific `subagent_type`. The sub-agent has no shared memory with the orchestrator; everything it knows must come from its prompt. Sub-agents are how dispatch produces clean voice work.

**Voice author** — An author persona dispatched in writing or rewriting mode. The voice author writes prose. Pick one for your manuscript and let them carry the voice across chapters.

**Voice rules** — Rules specific to a project's voice, in `.great-authors/voice.md` (judgment calls) and `.great-authors/voice-lints.md` (mechanical patterns). Author personas respect these even when they conflict with their default preferences.

**Withheld register** — Section of `suspense-architecture.md` listing what the picture deliberately never reveals (or reveals only at the latest possible moment). Counterpart to the bomb register.

---

## Where to go next

- Run `/authors-orchestrate-novel` and try a fresh project end-to-end. The pipeline runs in a few sessions if you hold the checkpoints.
- Read [ORCHESTRATING.md](./ORCHESTRATING.md) to internalize the orchestrator pattern more deeply.
- Read each individual `skills/<name>/SKILL.md` for the canonical instructions Claude Code follows when invoking each skill.
- File issues at [github.com/sethshoultes/great-authors-plugin/issues](https://github.com/sethshoultes/great-authors-plugin/issues).

This manual covers v1.2. See [CHANGELOG.md](./CHANGELOG.md) for version history.
