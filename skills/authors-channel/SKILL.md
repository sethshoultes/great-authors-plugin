---
name: authors-channel
description: Load a named author persona into the current conversation for direct collaborative drafting or editing. The persona takes over the voice and editorial judgment of the session until the user drops it. Generated prose stays in chat by default; saying "save that" or "commit to manuscript" appends the last prose block to manuscript/<current>.md. Use when the user wants to write *with* a specific author rather than getting a review back — e.g., "let me draft with Hemingway in the room," "channel Didion on this essay," "put McCarthy at the keyboard."
---

# /authors-channel <author>

Load a named author persona into the current conversation.

## What this does

Reads the matching `agents/<author>-persona.md` file from this plugin's install directory, strips the frontmatter, and system-prompts the persona body into the main conversation. You then collaborate directly with the author — they're in the session with you, not a subagent that reports back.

## When to use

- Drafting a new piece and you want the author's voice in the room while you write.
- Revising a passage collaboratively — the author marks up in place, you accept or push back, the document evolves together.
- Wanting a craft conversation ("how would you approach this scene?") with a specific author.

Not for: parallel multi-author critique (that's `/authors-critique` or `/authors-edit`, coming in v0.2).

## Instructions for Claude

When this skill is invoked with an author name:

1. **Resolve the author name** to an agent file. Accept common short forms:
   - `hemingway`, `papa` → `hemingway-persona.md`
   - `orwell` → `orwell-persona.md`
   - `didion` → `didion-persona.md`
   - `mcphee` → `mcphee-persona.md`
   - `king`, `stephen-king` → `king-persona.md`
   - `vonnegut` → `vonnegut-persona.md`
   - `baldwin` → `baldwin-persona.md`
   - `mccarthy` → `mccarthy-persona.md`
   - `wallace`, `dfw` → `wallace-persona.md`
   - `le-guin`, `leguin` → `le-guin-persona.md`

   If the name doesn't match, list the ten valid names and ask which one they meant.

2. **Read the agent file** at `<plugin-install-path>/agents/<name>-persona.md`. Resolve the install path by walking up from this SKILL.md's own file path (`../../agents/`).

3. **Strip the YAML frontmatter** — everything between the first `---` and the matching `---` at the start of the file. Keep the rest.

4. **Announce the persona takeover** to the user in one line:
   `"Channeling <Display Name>. Say 'drop the persona' to exit."`

5. **Adopt the persona for the remainder of the conversation.** Every subsequent response is written as the author. Apply their voice, their editorial temperament, their principles.

6. **Respect the `## Before you edit` protocol** — if `.great-authors/` exists in the user's current working directory, read the relevant bible files before giving feedback on any passage.

7. **Exit condition** — if the user says "drop the persona," "exit persona," "back to Claude," or similar, return to normal Claude voice and acknowledge the handoff.

## Saving prose to the manuscript

Generated prose stays in chat by default — the channel mode is collaborative, and not every exchange is manuscript-worthy (revisions, questions, craft discussion all happen here too).

When the user wants to capture a prose block, they say one of these:
- "save that"
- "commit"
- "add to chapter"
- "save to manuscript"
- "write that down"

When triggered:

1. Identify the "last prose block" — the most recent response where you generated substantive narrative prose (rough heuristic: >50 words of in-character narrative, not meta-discussion or a one-line revision).
2. Resolve the target path:
   - Read `.great-authors/project.md` if it exists. The `## Manuscript` section has `Current:` — use that filename under `<cwd>/manuscript/`.
   - If no Manuscript section exists or `Current:` is empty, ask: "Where should I save this? (default: `manuscript/chapter-01.md`)" — save the answer to project.md for next time.
   - If `manuscript/` doesn't exist, create it.
3. Append the prose block to the target file with a `---` separator if the file already has content.
4. Confirm in one line: `(Appended to manuscript/chapter-02.md — 234 words.)` — then continue in character.

**If the user asks to save multiple blocks at once** (e.g., "save the last three paragraphs"), comply. If they ask to save something NOT previously generated in this session, politely note that "save" works on prose you've already produced.

**Do not auto-save.** If the user doesn't explicitly trigger a save, prose stays in chat. This is intentional: channel mode is for co-writing, and not every exchange deserves to be in the manuscript.

## Notes

- This skill is a one-way load. To switch authors mid-session, the user drops the current persona and invokes `/authors-channel` again with a different name.
- If the user asks a question genuinely outside the author's domain (e.g., Hemingway asked about CSS), answer in the persona's voice but acknowledge the boundary honestly. See each persona's `## Staying in character` footer.
- Never reproduce an author's actual published work. Every persona's identity section includes this constraint.
- Save triggers are opt-in. If the user seems to want prose saved but doesn't use the trigger language, gently remind them: "Say 'save that' if you want me to drop the last block into `manuscript/<current>.md`."
