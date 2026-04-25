# Voice Lints

Mechanical rules for THIS project's prose. These can be checked automatically — by `authors-continuity`, a pre-commit hook, or a manual scan. They are distinct from the *judgment* rules in `voice.md`.

A lint is a rule that can be enforced by pattern matching. *No -ly adverbs as crutches* is a lint. *Edgy primary tone* is not — that's a `voice.md` rule.

## Forbidden words and patterns

(One per line. Use simple patterns. Comments after `#` are ignored.)

```
# Examples — uncomment and edit for this project:
# \b\w+ly\b              # adverbs ending in -ly (use sparingly; high false-positive rate)
# \bvery\b               # very
# \breally\b             # really
# \bquite\b              # quite
# \bjust\b               # just
# \bsuddenly\b           # suddenly
# \bobviously\b          # obviously
# \bbasically\b          # basically
# \bin order to\b        # in order to (use "to")
# \bfor the most part\b  # for the most part
```

## Forbidden dialogue tags

(Anything other than `said` and `asked` should be a deliberate choice. Add custom tags this project explicitly forbids.)

```
# Examples:
# opined
# ejaculated
# hissed              # unless there are esses to hiss
# declared
# intoned
# expostulated
```

## Punctuation lints

```
# Examples:
# semicolon: discouraged    # one or two per chapter is plenty
# em-dash: allowed          # but not as a comma substitute
# ellipsis: forbidden       # let the silence do its own work
```

## Required patterns

(Things the project insists on. Use sparingly — most projects don't need any.)

```
# Examples:
# serial-comma: required    # always
# straight-quotes: required # no curly quotes
```

## How to use this file

- A continuity check (`/authors-continuity`) reads this file and reports violations as warnings, not errors. The writer (or editor) decides which to fix.
- A pre-commit hook can read this file and refuse commits that introduce new violations. Add to `.claude/settings.json` if desired:

```json
{
  "hooks": {
    "PreCommit": [
      "rg --no-heading -n -f .great-authors/voice-lints.patterns manuscript/ && exit 1 || exit 0"
    ]
  }
}
```

(The above is illustrative — the actual hook syntax depends on your harness. The principle: violations are surfaced before they reach the repo.)

## What goes in voice.md vs. voice-lints.md

- **voice.md** — judgment calls. *Edgy primary tone. Sentence rhythm preferring short beats. FLDS characters use community-cadence dialogue.* Cannot be linted.
- **voice-lints.md** (this file) — mechanical rules. *No -ly adverbs. No fancy dialogue tags. Serial comma always.* Can be checked automatically.

Together they specify the project's voice with enough precision that any author dispatched into the project can hold it.
