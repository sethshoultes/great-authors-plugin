# Great Authors v0.6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Ship v0.6 — model split. `/authors-critique` dispatches sub-agents with `model: "haiku"` override for cheaper, faster triage. Other commands keep Sonnet.

**Architecture:**
- No new files.
- No frontmatter changes on agent files (their default `model: sonnet` stays — `/authors-channel`, `/authors-edit`, `/authors-debate`, and all builders still use sonnet).
- Edit to `skills/authors-critique/SKILL.md` only: the dispatch instructions gain a `model: "haiku"` parameter for each Agent call. This leverages the Claude Code Agent tool's per-call model override.
- Version bump to 0.6.0.

**Rationale:** `/authors-critique` is the only command where (1) output is TERSE by design (3 bullets), (2) reasoning requirements are low (opinion-style verdict), and (3) the command runs often enough that cost matters. Switching critique to haiku should cut its cost significantly without degrading output quality. Per the [[model-selection-for-agents]] brain note: "Use the strongest model for code generation and the cheapest model for opinions."

---

## File structure for v0.6

```
great-authors-plugin/
├── skills/
│   └── authors-critique/SKILL.md     # Task 3 (modify dispatch to add model: haiku)
├── .claude-plugin/plugin.json        # Task 2 (version bump)
├── .claude-plugin/marketplace.json   # Task 2 (description)
├── package.json                      # Task 2 (version bump)
└── README.md                         # Task 4 (note model split in roadmap)
```

---

## Tasks

### Task 1: Verify state

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && git status && \
  git fetch origin && git log --oneline origin/main..main && \
  git tag --list | grep v0.5
```

Expected: clean main, `v0.5.0` tag exists.

---

### Task 2: Version bump

- [ ] **Step 1: Update manifests**

- `.claude-plugin/plugin.json`: `"version": "0.5.0"` → `"version": "0.6.0"`
- `package.json`: same bump
- `.claude-plugin/marketplace.json`: leave description (it's already generic at v0.5)

- [ ] **Step 2: Validate + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  git add .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 0.6.0"
```

---

### Task 3: Update /authors-critique dispatch instructions

**Files:** Modify `skills/authors-critique/SKILL.md`

The dispatch prompt block in step 4 needs a model-override instruction.

- [ ] **Step 1: Read current SKILL.md**

```bash
cat "/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-critique/SKILL.md"
```

- [ ] **Step 2: Edit the dispatch block**

Use Edit on `/Users/sethshoultes/Local Sites/great-authors-plugin/skills/authors-critique/SKILL.md`:

Replace:
```
4. **Fan out via Agent tool.** Dispatch all authors in parallel in a single message. For each:
   - `subagent_type: <author>-persona`
   - Prompt:
```

With:
```
4. **Fan out via Agent tool.** Dispatch all authors in parallel in a single message. For each:
   - `subagent_type: <author>-persona`
   - `model: "haiku"` (override — critique is opinion-style and tolerates the cheaper model; edit and debate stay on Sonnet)
   - Prompt:
```

- [ ] **Step 3: Add a note to the Notes section**

Use Edit on the same file:

Replace:
```
## Notes

- This skill is cheap by design. Resist the temptation to pad the output.
- If any author returns more than 3 bullets, trim their output to 3 in consolidation — report verbatim otherwise.
- Sub-agents inherit cwd; bible files are read automatically via each persona's protocol.
```

With:
```
## Notes

- This skill is cheap by design. Resist the temptation to pad the output.
- If any author returns more than 3 bullets, trim their output to 3 in consolidation — report verbatim otherwise.
- Sub-agents inherit cwd; bible files are read automatically via each persona's protocol.
- **Model:** each sub-agent dispatch includes `model: "haiku"` as an override. This is intentional — critique is opinion-style work that doesn't require Sonnet-level reasoning. If you find critiques losing quality on Haiku (e.g., personas drift off-voice, cross-references hallucinate), drop the override in the Agent call and the dispatch falls back to the agent's default `model: sonnet`.
```

- [ ] **Step 4: Verify frontmatter intact**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  head -3 skills/authors-critique/SKILL.md
```

Expected: `---`, name, description unchanged.

- [ ] **Step 5: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add skills/authors-critique/ && \
  git commit -m "feat(critique): dispatch sub-agents with model: haiku override"
```

---

### Task 4: README update

- [ ] **Step 1: Update section header**

Edit `README.md`: `## What's in v0.5` → `## What's in v0.6`

- [ ] **Step 2: Update roadmap**

Edit `README.md`. Replace:
```
## Roadmap

- **v0.6** — model split (TERSE + Haiku for critique; Sonnet stays for edit)
- **v1.0** — DXT package for Claude Desktop
```

With:
```
## Roadmap

- **v1.0** — DXT package for Claude Desktop
```

- [ ] **Step 3: Add a "Performance notes" section before License**

Insert this section just before `## License`:

```markdown
## Performance notes

- **`/authors-critique`** dispatches sub-agents on **Haiku** — triaging opinions doesn't need Sonnet, and the command is designed to run often.
- **`/authors-edit`**, **`/authors-debate`**, **`/authors-draft`**, **`/authors-channel`**, and all builder interviews stay on **Sonnet** — these involve actual reasoning about prose or extended dialog.
- **`/authors-continuity`** stays on Sonnet — the auditor has to read the full bible and hold multiple files in context.
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update README for v0.6 (model split)"
```

---

### Task 5: Push + tag v0.6.0

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git push origin main && \
  git tag -a v0.6.0 -m "v0.6.0 — model split: /authors-critique runs on Haiku" && \
  git push origin v0.6.0 && \
  gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -5
```

Expected: `v0.6.0` at top.

---

## Self-review

- **Spec coverage:** Section 7 "Phase 2 candidates" → "Model split (TERSE prefix + Haiku routing for critique-only personas)". Covered.
- **Risk:** if haiku-dispatched critique drifts off-voice, the override is removable in one edit. No permanent commitment to the cheaper model.
- **Not done:** no TERSE prefix change — the existing dispatch prompt already says "CRITIQUE MODE - TERSE OUTPUT ONLY." That's the TERSE prefix. Haiku honors it.
