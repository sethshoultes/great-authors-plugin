---
name: authors-channel
description: Load a named author persona into the current conversation for direct collaborative drafting or editing. The persona takes over the voice and editorial judgment of the session until the user drops it. Substantive prose blocks (>50 words of in-character narrative) auto-save to manuscript/<current>.md by default; saying "preview only" or "don't save" opts out for a single block. Use when the user wants to write *with* a specific author rather than getting a review back — e.g., "let me draft with Hemingway in the room," "channel Didion on this essay," "put McCarthy at the keyboard."
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

**Substantive prose blocks save automatically by default.** Generative skills whose deliverable is prose should not strand that prose in chat — that puts the burden of capture on the user, who has to remember an incantation to keep their own work. The default is the right behavior; opt-out is for the rare case.

A "substantive prose block" is the most recent response containing >50 words of in-character narrative prose (not meta-discussion, not a one-line revision, not a craft conversation).

### Auto-save behavior (default)

When you produce a substantive prose block:

1. Resolve the target path:
   - Read `.great-authors/project.md` if it exists. The `## Manuscript` section has `Current:` — use that filename under `<cwd>/manuscript/`.
   - If no Manuscript section exists or `Current:` is empty, ask once at session start: "Where should I save prose for this session? (default: `manuscript/chapter-01.md`)" — save the answer to project.md for the rest of the session.
   - If `manuscript/` doesn't exist, create it.
2. Append the prose block to the target file with a `---` separator if the file already has content.
3. Show the prose to the user immediately after the path confirmation. The path appears at the TOP of the response so the user knows where the work landed before they read it:
   ```
   📝 Saved to manuscript/chapter-02.md (234 words appended).
   
   <prose block here>
   ```

### Opt-out for a single block

When the user says one of these BEFORE you produce the block:
- "preview only"
- "don't save this one"
- "draft, don't commit"
- "just show me"

…produce the block in chat without saving. Note this in one line: `(Preview only — not saved.)`

### Opt-out persistently for the session

If the user wants the OLD behavior (chat-only, save on demand) for the whole session, they can say "channel mode: chat-only" or similar. Honor it for the rest of the session and require explicit save triggers (`save that`, `commit`, etc.) to write to disk.

### Save triggers (still respected)

Even with auto-save default, the user may explicitly trigger a save of a prior block:

- "save that"
- "commit"
- "add to chapter"
- "save to manuscript"
- "write that down"

These work the same way — identify the most recent substantive prose block, save to manuscript path, confirm.

### Never auto-save

- Meta-discussion, craft commentary, questions to the user
- One-line revisions (under 50 words)
- Lists or outlines that aren't prose
- Anything the user has explicitly opted out of in this session

If unsure, default toward saving (it's easier to delete a saved block than to recover prose lost to context).

## Notes

- This skill is a one-way load. To switch authors mid-session, the user drops the current persona and invokes `/authors-channel` again with a different name.
- If the user asks a question genuinely outside the author's domain (e.g., Hemingway asked about CSS), answer in the persona's voice but acknowledge the boundary honestly. See each persona's `## Staying in character` footer.
- Never reproduce an author's actual published work. Every persona's identity section includes this constraint.
- Auto-save is the default. The plugin previously required users to remember a trigger phrase to save their own prose, which put the burden of capture on the user. This was changed in v1.x — generative skills should persist their output by default, with explicit opt-out for previews. See the brain learning at `learnings/generative-skills-must-persist-by-default.md` for the underlying principle.
