---
name: authors-debate
description: Run a 2-round craft debate between two named author personas on a specific passage or topic. Usage - /authors-debate <passage-or-topic> <author-A> <author-B>. Round 1 - each states their position. Round 2 - each responds to the other. Consolidation names the real tension and picks a winner or offers a third option. Use when you genuinely don't know how to handle a craft choice (e.g., Hemingway vs. McCarthy on whether a scene needs muscle or weight).
---

# /authors-debate <passage-or-topic> <author-A> <author-B>

Two-round craft dispute resolution.

## When to use

- You have a craft choice and two authors would clearly disagree. You want the real tension surfaced, not a split-the-difference answer.
- You're deciding between two registers (compression vs. weight, cool observation vs. moral urgency, etc.) and want each position voiced honestly.

Not for: general critique (`/authors-critique`); marked-up editing (`/authors-edit`); collaborative drafting (`/authors-channel`).

## Instructions for Claude

1. **Parse arguments:**
   - First: `<passage-or-topic>` (required). Can be a quoted passage (string) or a file path (if the token resolves to an existing file, load it).
   - Then: `<author-A>` and `<author-B>` (both required). Valid author names from the roster. Must be two different authors.

2. **If passage is a file path,** read the file. If it's inline text, use as-is.

3. **Round 1 — parallel.** Dispatch both authors in parallel (single message, two Agent calls):
   - `subagent_type: <author-A>-persona` / `<author-B>-persona`
   - Prompt:
     ```
     DEBATE ROUND 1.

     The topic: <passage or topic, full text>

     State your position in 3-5 sentences. What would you do with this? Why? What would be wrong with treating it another way? Be specific about your craft reasoning. Do not hedge.

     Do NOT respond to other voices yet — you don't know what they'll say. Just state your own position.
     ```

4. **Round 2 — parallel.** Once both Round 1 responses are in, dispatch again in parallel:
   - Each author receives BOTH Round 1 responses (their own for reference + the opponent's to respond to).
   - Prompt:
     ```
     DEBATE ROUND 2.

     In Round 1 you said:
     <author's Round 1 response>

     <opposing author> said:
     <opposing author's Round 1 response>

     Respond in 3-5 sentences:
     - What do you concede? (If nothing, say so and explain.)
     - Where do you hold your position?
     - If you'd revise your Round 1 position, how?
     ```

5. **Consolidate.** Write the debate report:

   ```markdown
   # /authors-debate: <author-A> vs. <author-B>

   **Topic:** <passage or topic as given>

   ## Round 1

   ### <Author A>
   <their R1 position>

   ### <Author B>
   <their R1 position>

   ## Round 2

   ### <Author A>
   <their R2 response>

   ### <Author B>
   <their R2 response>

   ## The real tension

   (One or two sentences naming what this dispute is actually about — usually a genre, register, or audience question. E.g., "The tension is whether this scene's weight comes from compression (A) or accumulation (B). That's a register choice determined by the genre.")

   ## Verdict

   Pick ONE:
   - **Winner:** <author name> — <one sentence reason>
   - **Third way:** <a synthesis neither author proposed, if one exists>
   - **Consensus:** <synthesized brief — when both authors converge, with refinements from Round 2 incorporated. Use when authors agreed in Round 1 and Round 2 produced a sharper joint position than either had alone. The consensus brief should be specific enough that an orchestrator can pass it directly to a rewrite without re-synthesizing.>
   - **Genre call:** <the choice depends on <X>; here's how to decide>
   ```

6. **Output to stdout.** No manuscript changes.

## Notes

- Debate only works between two distinct authors. If the user passes the same author twice, ask them to pick a second.
- If either Round 1 response is thin or off-topic, ask the sub-agent to retry with clearer framing before moving to Round 2.
- The verdict section is the most valuable part. Don't skip it by hedging — if the tension is irreducibly genre-dependent, say so explicitly.
- Sub-agents inherit cwd; if `.great-authors/voice.md` establishes a house style for the project, both debaters should respect it in their reasoning (but they can argue for what the voice SHOULD be if the user is questioning it).
- **Always run Round 2, even when Round 1 reveals consensus.** Convergence in Round 1 is not the end of the work — Round 2 is where each author refines their position by reading the other's, and where the synthesized brief gets sharpened beyond what either author had alone. Skipping Round 2 produces weaker briefs. The protocol earns its turns.
- **The Consensus verdict is not a fallback.** It is the right outcome when both authors agreed in Round 1 and Round 2 added refinements. It produces a single coherent brief that can be passed directly to a rewrite (`/authors-rewrite`) without further synthesis. Use it when applicable; do not force a fake disagreement to satisfy the Winner / Third way framing.
