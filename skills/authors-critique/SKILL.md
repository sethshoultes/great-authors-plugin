---
name: authors-critique
description: Get a fast, cheap gut-check critique of a draft from multiple author personas. Usage - /authors-critique <file> [author1 author2 ...]. Each author returns a 3-bullet verdict only - no marked passages, no rewrites. Defaults to 3 authors if none specified. Use when you want quick directional feedback before investing in a full /authors-edit pass.
---

# /authors-critique <file> [author1 author2 ...]

Fast, cheap gut-check critique.

## When to use

- You want a directional read on a draft before investing in a full edit pass.
- You're deciding which authors to run `/authors-edit` with — use critique to triage.
- You want to see which authors have the strongest reaction before committing to a markup pass.

Not for: marked-up passages (that's `/authors-edit`); craft debates between two authors (that's `/authors-debate`).

## Instructions for Claude

1. **Parse arguments:** file path (required) + optional author names. Same parsing as `/authors-edit`.

2. **Verify the file exists.**

3. **If no authors named, pick 3** using the same genre-signal logic as `/authors-edit`, but with a wider net. Default triad: Hemingway + Orwell + Didion for ambiguous cases (covers sentence-level, argument clarity, observational specificity).

4. **Fan out via Agent tool.** Dispatch all authors in parallel in a single message. For each:
   - `subagent_type: <author>-persona`
   - Prompt:
     ```
     CRITIQUE MODE - TERSE OUTPUT ONLY.

     Read this draft and respond with EXACTLY 3 bullets. Each bullet is one sentence. No introduction. No markdown markup of passages. No rewrites. Just the three most important things you notice.

     End with one line: "If I'm not the right voice here, try <X>." — or omit if you are.

     Draft:
     <full file contents>
     ```

5. **Consolidate:**

   ```markdown
   # /authors-critique on <filename> — <author A>, <author B>, <author C>

   ## <Author A>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## <Author B>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## <Author C>
   - <bullet 1>
   - <bullet 2>
   - <bullet 3>

   ## Consensus
   (one sentence naming what all or most authors flagged)

   ## Sharpest disagreement
   (one sentence naming the most productive disagreement, or "no significant disagreement" if so)

   ## Handoffs
   (if any author suggested a different voice, name them here)
   ```

6. **Output to stdout.** No manuscript changes.

## Notes

- This skill is cheap by design. Resist the temptation to pad the output.
- If any author returns more than 3 bullets, trim their output to 3 in consolidation — report verbatim otherwise.
- Sub-agents inherit cwd; bible files are read automatically via each persona's protocol.
