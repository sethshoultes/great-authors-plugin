---
name: authors-edit
description: Mark up a draft with editorial feedback from one or more author personas. Usage - /authors-edit <file> [author1 author2 ...]. If no authors named, inspects the file and picks 1-2 based on genre (marketing copy → Hemingway + Orwell; fiction → King + Vonnegut; essay → Didion + Baldwin; long-form nonfiction → McPhee). Returns a consolidated marked-up view, not N separate critiques. Use when you want a real editorial pass on a piece of writing.
---

# /authors-edit <file> [author1 author2 ...]

The core editorial command. Fans out to selected authors, consolidates their markup.

## When to use

- You have a draft (any length) and you want editorial feedback from one or more author voices.
- You want marked-up passages with specific cuts and substitutions — not just opinions.
- You trust the fan-out-and-consolidate pattern: different authors will notice different things, and the consolidation will show consensus and productive disagreement.

Not for: real-time collaborative drafting (use `/authors-channel`); fast gut-check opinions (use `/authors-critique`); resolving a specific craft dispute (use `/authors-debate`).

## Instructions for Claude

When this skill is invoked:

1. **Parse arguments:**
   - First positional: file path (required). If missing, ask the user to provide a file.
   - Remaining positionals: zero or more author names. Valid names: `hemingway`, `orwell`, `didion`, `mcphee`, `king`, `vonnegut`, `baldwin`, `mccarthy`, `wallace`, `le-guin`. Short forms accepted (e.g., `papa` for Hemingway, `dfw` for Wallace).

2. **Verify the file exists.** If not, tell the user the path isn't valid and stop.

3. **If no authors were named,** auto-select 1–2 based on genre signals:
   - Inspect the first 500 words of the file. Look for signals.
   - **Marketing/landing page copy** (product names, calls-to-action, benefit language) → Hemingway + Orwell.
   - **Fiction** (dialogue tags, scene description, narrative prose) → King + Vonnegut.
   - **Personal essay or op-ed** (first-person reflection, cultural argument) → Didion + Baldwin.
   - **Long-form nonfiction / explanatory** (research-heavy, sustained exposition) → McPhee.
   - **Speculative fiction** (invented terms, alternate-world setting) → Le Guin + King.
   - **Literary / mythic fiction** (weighty prose, violence, landscape as character) → McCarthy + Hemingway.
   - **Self-aware cultural criticism** (footnote candidates, meta-commentary) → Wallace + Didion.
   - **Ambiguous:** default to Hemingway + Orwell (safe generalists).

   Announce your selection to the user in one line: "No authors specified — picking <A> and <B> based on <signal>. Ok, or override?" Accept "ok" or a new list.

4. **If `.great-authors/` exists in the file's parent directory,** note this in your dispatch prompts — the sub-agents will read bible files as part of the persona's `## Before you edit` protocol.

5. **Fan out via the Agent tool.** For each selected author, dispatch a sub-agent in parallel (use multiple Agent calls in a single message):
   - `subagent_type: <author>-persona`
   - Prompt should include:
     - The full text of the file to be edited.
     - Instructions: "You are editing this draft. Return your output in the following structured format:
       - **Verdict:** one sentence naming your top-line reaction to the draft.
       - **Marked passages:** 3–8 quoted excerpts from the draft, each with your specific suggested edits inline. Use `~~strikethrough~~` for cuts and `[→ replacement]` for substitutions.
       - **Start here:** if there's a line above which you'd delete everything, quote the first sentence after that line and label it 'START HERE:'. Otherwise omit this section.
       - **Hand off:** if a different author in the great-authors roster would serve this piece better, name them in one sentence. If not, omit.

6. **Consolidate the results.** After all sub-agents return, produce a single consolidated view:

   ```markdown
   # /authors-edit on <filename> — <author A> + <author B>

   **<Author A>'s verdict:** <one sentence>
   **<Author B>'s verdict:** <one sentence>

   ## Where they agree
   (list 1-3 concrete points both authors made)

   ## Where they disagree
   (list 1-2 concrete points they diverge on, or "No significant disagreement" if so)

   ## Highest-leverage change
   (pick ONE change that would most improve the draft. Name it in one sentence.)

   ## Marked passages

   (Show the marked-up passages, combining both authors' edits when they overlap. If they conflict on the same passage, show both versions labeled.)

   ## Start here (if any author flagged it)
   <first sentence after the cut line>

   ## Handoffs
   (Any cross-reference suggestions from individual authors, listed here. E.g., "McCarthy suggests Baldwin for the moral stakes in paragraph 3 — consider /authors-edit <file> baldwin.")
   ```

7. **Output to stdout.** Do not write to the manuscript. The human applies the edits.

## Notes

- All dispatched sub-agents inherit the current working directory. If `.great-authors/` exists, they will read it automatically per each persona's `## Before you edit` protocol. You do not need to explicitly pass bible context.
- Fan-out should be parallel — dispatch all Agent calls in a single message using multiple tool-use blocks.
- If any sub-agent reports BLOCKED or returns nothing useful, consolidate with whatever authors succeeded. Never fail the whole command on one author's failure.
- If the user passed >2 authors, dispatch all of them. Consolidation scales to N.
