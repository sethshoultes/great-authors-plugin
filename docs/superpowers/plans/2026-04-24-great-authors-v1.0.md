# Great Authors v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Ship v1.0 — DXT package for Claude Desktop. Users without a terminal can install Great Authors by double-clicking a `.dxt` file.

**Architecture:** Following the great-minds-plugin pattern verbatim. A `distribution/dxt/` directory at repo root contains a Node.js MCP server. The server bundles copies of the 14 agent files (10 personas + 4 builders) and exposes 14 tools that return structured prompts. When a Desktop user invokes a tool, the MCP server returns a prompt; Claude Desktop then runs that prompt using its own inference + built-in filesystem access for file operations.

**Key insight from the great-minds reference implementation:** the DXT server does not do persona reasoning itself, and it does not do filesystem operations. It is a prompt factory. Every tool handler reads the bundled persona files, interpolates them into a prompt template, and returns the prompt as the tool's text output. Claude Desktop handles everything else.

**Tech stack:**
- Node.js 18+ (for native fetch)
- `@modelcontextprotocol/sdk` npm package
- `@anthropic-ai/dxt` CLI for packaging
- Same markdown persona files already shipped in `agents/`

**Prerequisites:**
- v0.7 pushed (`origin/main` at `cc821c0` or later)
- Node.js and npm available on the build machine (user's, not necessarily the plugin author's — the build step `npx @anthropic-ai/dxt pack` runs locally when someone wants a `.dxt` bundle)

---

## File structure for v1.0

```
great-authors-plugin/
├── distribution/
│   ├── README.md                          # Task 10 (distribution explainer)
│   ├── sync-distribution.sh               # Task 8 (script: copy agents/ → dxt/server/personas/)
│   └── dxt/
│       ├── README.md                      # Task 9 (build instructions for DXT)
│       ├── manifest.json                  # Task 3 (DXT manifest with 14 tools)
│       ├── package.json                   # Task 4 (npm package with MCP SDK)
│       └── server/
│           ├── index.js                   # Task 5 (MCP server, ~500 lines)
│           └── personas/                  # Task 8 (14 agent files, synced from agents/)
│               ├── hemingway-persona.md
│               ├── orwell-persona.md
│               ├── didion-persona.md
│               ├── baldwin-persona.md
│               ├── mcphee-persona.md
│               ├── wallace-persona.md
│               ├── king-persona.md
│               ├── mccarthy-persona.md
│               ├── vonnegut-persona.md
│               ├── le-guin-persona.md
│               ├── character-builder.md
│               ├── scene-builder.md
│               ├── place-builder.md
│               └── relationship-builder.md
├── .claude-plugin/
│   ├── plugin.json                        # Task 2 (version bump to 1.0.0)
│   └── marketplace.json                   # Task 2 (add DXT as a plugin entry)
├── package.json                           # Task 2 (version bump)
└── README.md                              # Task 11 (add DXT install section)
```

**No changes to `agents/` or `skills/`.** v1.0 is packaging only — the underlying plugin content is unchanged from v0.7.

---

## The 14 DXT tools

Each tool mirrors an existing slash command from the Claude Code plugin. Tool handlers return prompts, not final output.

| Tool | Maps to | Description |
|------|---------|-------------|
| `list_authors` | (meta) | List the 10 author personas with one-line descriptions. |
| `authors_channel` | `/authors-channel` | Return a prompt that loads a named author persona. |
| `authors_draft` | `/authors-draft` | Return a prompt that drafts in a named author's voice, with save-to-file instructions. |
| `authors_edit` | `/authors-edit` | Return a prompt for multi-author marked-up edit. |
| `authors_critique` | `/authors-critique` | Return a prompt for fast 3-bullet verdicts. |
| `authors_debate` | `/authors-debate` | Return a prompt for 2-round debate between two authors. |
| `authors_continuity` | `/authors-continuity` | Return a prompt for bible-vs-draft continuity audit. |
| `authors_project_init` | `/authors-project-init` | Return a prompt with the project-init interview + file-write instructions. |
| `authors_build_character` | `/authors-build-character` | Return a prompt for character interview + file write. |
| `authors_build_scene` | `/authors-build-scene` | Return a prompt for scene card interview + file write. |
| `authors_build_place` | `/authors-build-place` | Return a prompt for place interview + file write. |
| `authors_build_relationship` | `/authors-build-relationship` | Return a prompt for relationship interview + two-file update. |
| `authors_journal` | `/authors-journal` | Return a prompt for session journal entry. |
| `authors_consolidate` | `/authors-consolidate` | Return a prompt for journal consolidation. |

---

## Tasks

### Task 1: Verify state

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git branch --show-current && git status && \
  git fetch origin && git log --oneline origin/main..main && \
  git tag --list | tr '\n' ' '
```

Expected: clean main, all tags v0.1.0-v0.7.0 exist, remote synced.

---

### Task 2: Bump to 1.0.0 + add DXT to marketplace

- [ ] **Step 1: Bump versions**

- `.claude-plugin/plugin.json`: `"version": "0.7.0"` → `"version": "1.0.0"`
- `package.json`: same bump

- [ ] **Step 2: Update marketplace.json to add a second plugin entry for DXT**

Edit `.claude-plugin/marketplace.json` to declare both the Claude Code plugin AND the DXT bundle as separate installable plugins. Replace the existing content with:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "great-authors",
  "description": "Ten author personas + 13 slash commands for prose craft and editorial work. Drafted prose lands in manuscript/ on disk by default. Full project-bible management.",
  "owner": {
    "name": "Seth Shoultes",
    "url": "https://github.com/sethshoultes"
  },
  "plugins": [
    {
      "name": "great-authors",
      "description": "Ten author personas + 13 slash commands for writing craft, editorial work, and long-form project management with a living bible. For Claude Code.",
      "source": "./",
      "category": "productivity"
    },
    {
      "name": "great-authors-dxt",
      "description": "Same personas and commands as great-authors, packaged as a Claude Desktop extension. Build: cd distribution/dxt && npm install && npx @anthropic-ai/dxt pack",
      "source": "./distribution/dxt",
      "category": "productivity"
    }
  ]
}
```

- [ ] **Step 3: Validate + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; json.load(open('.claude-plugin/plugin.json'))" && \
  python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))" && \
  python3 -c "import json; json.load(open('package.json'))" && \
  git add .claude-plugin/ package.json && \
  git commit -m "chore: bump version to 1.0.0 and register DXT entry in marketplace"
```

---

### Task 3: Write the DXT manifest

**File:** `distribution/dxt/manifest.json`

The manifest declares the DXT, the MCP server entry point, and the 14 tools with their input schemas.

- [ ] **Step 1: Create the directory**

```bash
mkdir -p "/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/dxt/server/personas"
```

- [ ] **Step 2: Write manifest.json**

Write `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/dxt/manifest.json`:

```json
{
  "dxt_version": "0.1",
  "name": "great-authors",
  "display_name": "Great Authors",
  "version": "1.0.0",
  "description": "Ten legendary author personas (Hemingway, McCarthy, Didion, Baldwin, McPhee, Wallace, Orwell, King, Le Guin, Vonnegut) plus 14 tools for prose craft, editorial work, and long-form project management.",
  "long_description": "Channel prose craft from ten canonical writers. Get multi-author markup on a draft, fast 3-bullet critiques, or 2-round debates between two author voices. Build a persistent project bible with characters, scenes, places, relationships, a timeline, and a session journal — every author reads the bible before editing, so long-form work stays consistent across sessions. Drafted prose lands in manuscript/ on disk by default, never stranded in chat.",
  "author": {
    "name": "Seth Shoultes",
    "email": "seth@caseproof.com"
  },
  "server": {
    "type": "node",
    "entry_point": "server/index.js",
    "mcp_config": {
      "command": "node",
      "args": ["${__dirname}/server/index.js"]
    }
  },
  "tools": [
    {
      "name": "list_authors",
      "description": "List the ten author personas plus four tool personas with one-line descriptions of each."
    },
    {
      "name": "authors_channel",
      "description": "Return a prompt that loads a named author persona into the conversation for direct collaborative drafting or editing. Supports short forms (papa, dfw, leguin). Valid authors: hemingway, orwell, didion, baldwin, mcphee, wallace, king, mccarthy, vonnegut, le-guin."
    },
    {
      "name": "authors_draft",
      "description": "Return a prompt that drafts new prose in a named author's voice, based on a brief. Saves output to a local file (manuscript/<path>) when Claude Desktop has filesystem access configured. Use when you want a first-draft pass in a specific voice."
    },
    {
      "name": "authors_edit",
      "description": "Return a prompt that fans out a draft to 1-2 author personas and consolidates their marked-up critique into a single view. The prompt takes the draft content as input, not a file path."
    },
    {
      "name": "authors_critique",
      "description": "Return a prompt for a fast 3-bullet verdict on a draft from 3 author personas in parallel. Cheaper and faster than authors_edit."
    },
    {
      "name": "authors_debate",
      "description": "Return a prompt for a 2-round craft debate between two named author personas on a specific passage or topic. Consolidation names the real tension and picks a winner or offers a third option."
    },
    {
      "name": "authors_continuity",
      "description": "Return a prompt for a bible-vs-draft continuity audit. Flags character detail drift, timeline contradictions, voice rule violations, invented-term misuse. Requires the user's bible files to be accessible via Claude Desktop's filesystem."
    },
    {
      "name": "authors_project_init",
      "description": "Return a prompt that interviews the user for their project's bible setup (working title, genre, premise, POV, tense, starting chapter) and writes .great-authors/ scaffold + manuscript/ directory. Requires filesystem access."
    },
    {
      "name": "authors_build_character",
      "description": "Return a prompt that conducts a seven-question character interview, with optional author-lens (king, le-guin), and writes the output to .great-authors/characters/<name>.md."
    },
    {
      "name": "authors_build_scene",
      "description": "Return a prompt that conducts an eight-question scene card interview, with optional author-lens (mcphee, vonnegut), and writes the output to .great-authors/scenes/<id>.md."
    },
    {
      "name": "authors_build_place",
      "description": "Return a prompt that conducts a seven-question place interview, with optional author-lens (mcphee, didion), and writes the output to .great-authors/places/<name>.md."
    },
    {
      "name": "authors_build_relationship",
      "description": "Return a prompt that conducts a six-question relationship interview between two existing characters and updates the Connections section in BOTH character files."
    },
    {
      "name": "authors_journal",
      "description": "Return a prompt that interviews the user for their session journal entry (what was worked on, decisions made, unresolved, next session) and writes it to .great-authors/journal/YYYY-MM-DD.md."
    },
    {
      "name": "authors_consolidate",
      "description": "Return a prompt that scans journal entries and offers to promote recurring decisions to the permanent bible files. Requires at least 3 journal entries."
    }
  ],
  "keywords": ["writing", "editing", "personas", "prose", "craft", "editorial", "novel", "bible"],
  "license": "MIT"
}
```

- [ ] **Step 3: Validate**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  python3 -c "import json; m=json.load(open('distribution/dxt/manifest.json')); print('OK tools:', len(m['tools']))"
```

Expected: `OK tools: 14`.

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/dxt/manifest.json && \
  git commit -m "feat(dxt): add DXT manifest with 14 tool declarations"
```

---

### Task 4: Write DXT package.json

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/dxt/package.json`:

```json
{
  "name": "great-authors-dxt",
  "version": "1.0.0",
  "description": "Great Authors MCP server for Claude Desktop",
  "main": "server/index.js",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  },
  "scripts": {
    "start": "node server/index.js",
    "pack": "npx @anthropic-ai/dxt pack"
  }
}
```

Commit:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/dxt/package.json && \
  git commit -m "chore(dxt): add package.json for MCP server"
```

---

### Task 5: Write the MCP server

**File:** `distribution/dxt/server/index.js`

The substantive task. Node.js MCP server that loads persona files and returns 14 prompt-generating tool handlers.

- [ ] **Step 1: Write the server**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/dxt/server/index.js`:

```javascript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERSONAS_DIR = join(__dirname, "personas");

// Load all bundled persona and builder files into a lookup map.
// Keys are slugs (e.g. "hemingway", "character-builder").
const PERSONAS = Object.fromEntries(
  readdirSync(PERSONAS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      // Strip -persona suffix for author files; keep -builder suffix for builders.
      const slug = f.replace(/\.md$/, "").replace(/-persona$/, "");
      const body = readFileSync(join(PERSONAS_DIR, f), "utf8");
      return [slug, body];
    })
);

const AUTHOR_BLURBS = {
  "hemingway": "Iceberg prose. Tightens bloated writing. Kills adverbs.",
  "orwell": "Plain-style hammer. Cuts political and corporate jargon.",
  "didion": "Cool observational authority. Cultural reporting and essays.",
  "baldwin": "Moral urgency. The essay as confrontation.",
  "mcphee": "Long-form nonfiction architecture. Structure is destiny.",
  "wallace": "Maximalist, self-aware. Essays about attention and sincerity.",
  "king": "Voice-driven narrative. Pace, dialogue, working novelist's toolbox.",
  "mccarthy": "Biblical weight, mythic register. Prose of terror and grace.",
  "vonnegut": "Humane irony. Devastating compression. Short stories and satire.",
  "le-guin": "Speculative fiction as thought experiment. World-building that serves theme.",
};

const BUILDER_BLURBS = {
  "character-builder": "Interviews you to build a character entry in the project bible.",
  "scene-builder": "Interviews you to build a scene beat card.",
  "place-builder": "Interviews you to build a place entry — sensory, meaning, change.",
  "relationship-builder": "Interviews you about a relationship between two existing characters.",
};

// Short-form aliases accepted in tool inputs.
const AUTHOR_ALIASES = {
  "papa": "hemingway",
  "ernest-hemingway": "hemingway",
  "stephen-king": "king",
  "dfw": "wallace",
  "david-foster-wallace": "wallace",
  "leguin": "le-guin",
  "ursula-k-le-guin": "le-guin",
  "joan-didion": "didion",
  "james-baldwin": "baldwin",
  "john-mcphee": "mcphee",
  "kurt-vonnegut": "vonnegut",
  "cormac-mccarthy": "mccarthy",
  "george-orwell": "orwell",
};

function resolveAuthor(name) {
  if (!name) throw new Error("Author name required.");
  const normalized = name.toLowerCase().trim();
  const slug = AUTHOR_ALIASES[normalized] || normalized;
  if (!PERSONAS[slug]) {
    throw new Error(
      `Unknown author: ${name}. Valid: ${Object.keys(AUTHOR_BLURBS).join(", ")}.`
    );
  }
  return { slug, body: PERSONAS[slug] };
}

function resolveBuilder(name) {
  if (!PERSONAS[name]) {
    throw new Error(
      `Unknown builder: ${name}. Valid: ${Object.keys(BUILDER_BLURBS).join(", ")}.`
    );
  }
  return PERSONAS[name];
}

const server = new Server(
  { name: "great-authors", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ---------- Tool listing ----------

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_authors",
      description:
        "List the ten author personas plus four tool personas with one-line descriptions of each.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "authors_channel",
      description:
        "Return a prompt that loads a named author persona for direct collaborative drafting or editing. Valid authors: hemingway, orwell, didion, baldwin, mcphee, wallace, king, mccarthy, vonnegut, le-guin (short forms: papa, dfw, leguin).",
      inputSchema: {
        type: "object",
        properties: {
          author: {
            type: "string",
            description: "Author slug or short form.",
          },
        },
        required: ["author"],
      },
    },
    {
      name: "authors_draft",
      description:
        "Return a prompt that drafts new prose in a named author's voice, based on a brief. Includes instructions for saving the output to a manuscript file.",
      inputSchema: {
        type: "object",
        properties: {
          brief: { type: "string", description: "The drafting brief." },
          author: { type: "string", description: "Author slug or short form." },
          target_path: {
            type: "string",
            description:
              "Optional target path for saved prose. If omitted, the prompt instructs Claude to resolve the path from the project bible.",
          },
        },
        required: ["brief", "author"],
      },
    },
    {
      name: "authors_edit",
      description:
        "Return a prompt that runs 1-2 author personas as editors on a draft. Produces a consolidated marked-up view.",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "The draft text to edit." },
          authors: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of 1 or 2 author slugs. If empty, the prompt instructs Claude to auto-select based on genre.",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "authors_critique",
      description:
        "Return a prompt for a fast 3-bullet verdict from 3 authors in parallel. Cheaper and faster than authors_edit.",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "The draft text to critique." },
          authors: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of author slugs. Defaults to 3 authors selected from genre signals if empty.",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "authors_debate",
      description:
        "Return a prompt for a 2-round craft debate between two named author personas.",
      inputSchema: {
        type: "object",
        properties: {
          passage_or_topic: {
            type: "string",
            description: "The passage or craft question to debate.",
          },
          author_a: { type: "string", description: "First author slug." },
          author_b: { type: "string", description: "Second author slug." },
        },
        required: ["passage_or_topic", "author_a", "author_b"],
      },
    },
    {
      name: "authors_continuity",
      description:
        "Return a prompt for a bible-vs-draft continuity audit. Flags character drift, timeline contradictions, voice rule violations.",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "The draft to audit." },
          author: {
            type: "string",
            description:
              "Optional auditor author slug. Defaults to king if omitted.",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "authors_project_init",
      description:
        "Return a prompt that interviews the user for project setup and writes the .great-authors/ bible scaffold + manuscript/ directory.",
      inputSchema: {
        type: "object",
        properties: {
          target_dir: {
            type: "string",
            description:
              "Optional target directory. The prompt instructs Claude to use the user's current working directory if omitted.",
          },
        },
      },
    },
    {
      name: "authors_build_character",
      description:
        "Return a prompt for a seven-question character interview, with optional author lens, and instructions to write the output to .great-authors/characters/<name>.md.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Character name." },
          author_lens: {
            type: "string",
            description:
              "Optional author lens (king, le-guin). Others fall back to default.",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "authors_build_scene",
      description:
        "Return a prompt for an eight-question scene card interview, with optional author lens, and instructions to write the output to .great-authors/scenes/<id>.md.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Scene ID." },
          author_lens: {
            type: "string",
            description: "Optional author lens (mcphee, vonnegut).",
          },
        },
      },
    },
    {
      name: "authors_build_place",
      description:
        "Return a prompt for a seven-question place interview, with optional author lens, and instructions to write the output to .great-authors/places/<name>.md.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Place name." },
          author_lens: {
            type: "string",
            description: "Optional author lens (mcphee, didion).",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "authors_build_relationship",
      description:
        "Return a prompt for a six-question relationship interview between two existing characters. Updates BOTH character files with reciprocal Connections entries.",
      inputSchema: {
        type: "object",
        properties: {
          character_a: {
            type: "string",
            description: "First character slug (must exist in .great-authors/characters/).",
          },
          character_b: {
            type: "string",
            description: "Second character slug.",
          },
        },
        required: ["character_a", "character_b"],
      },
    },
    {
      name: "authors_journal",
      description:
        "Return a prompt that interviews the user for a session journal entry and writes it to .great-authors/journal/YYYY-MM-DD.md.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "authors_consolidate",
      description:
        "Return a prompt that scans journal entries and offers to promote recurring decisions to the permanent bible. Requires at least 3 journal entries.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

// ---------- Tool call handlers ----------

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "list_authors") {
    const authorLines = Object.entries(AUTHOR_BLURBS).map(
      ([k, v]) => `- **${k}** — ${v}`
    );
    const builderLines = Object.entries(BUILDER_BLURBS).map(
      ([k, v]) => `- **${k}** — ${v}`
    );
    const text = `# Great Authors Roster\n\n## Author personas (10)\n\n${authorLines.join("\n")}\n\n## Tool personas (4)\n\n${builderLines.join("\n")}`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_channel") {
    const { slug, body } = resolveAuthor(args.author);
    const text = `You are now channeling the following author persona. Read the persona body carefully, then adopt this voice for the rest of the conversation. The user will draft, revise, or converse with you as this author.\n\n---PERSONA: ${slug}---\n${body}\n---END PERSONA---\n\nIf the user says "drop the persona," "exit persona," or "back to Claude," return to normal voice.\n\nIf the user says "save that," "commit," "add to chapter," or "save to manuscript," append the last prose block to the user's current manuscript file (resolve the path from .great-authors/project.md's ## Manuscript section, or ask if undefined). Confirm the save in one line: "(Appended to manuscript/<file> — <N> words.)"\n\nBegin as ${slug} now.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_draft") {
    const { slug, body } = resolveAuthor(args.author);
    const target = args.target_path || "<resolve from .great-authors/project.md's ## Manuscript > Current>";
    const text = `You are drafting new prose in the voice of ${slug}. Here is the persona:\n\n---PERSONA---\n${body}\n---END PERSONA---\n\n**Brief:** ${args.brief}\n\n**Save target:** ${target}\n\nInstructions:\n1. If .great-authors/ exists in the user's current working directory, read project.md, voice.md, and the most recent journal entry first. Respect the project's voice rules even when they conflict with the author's defaults.\n2. Save the drafted prose to the target path BEFORE displaying it in chat. If the file exists with content, ask the user: append / overwrite / save-as-next-chapter / cancel. Default: append.\n3. Write natural prose paragraphs in the author's voice — no headers, no meta-commentary.\n4. If new character or place names appear in the draft that don't have bible entries yet, note this in an aside but continue drafting. The user can build bible entries afterward.\n5. End with a footer: total paragraphs, word count, save path, and recommended next steps.\n6. Reminder: this is draft material, not final copy. The author you're channeling would tell the user to revise aggressively.\n\nBegin drafting now.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_edit") {
    const authorSlugs = Array.isArray(args.authors) && args.authors.length > 0
      ? args.authors.map((a) => resolveAuthor(a).slug)
      : null;
    const personaBlocks = authorSlugs
      ? authorSlugs.map((s) => `### ${s}\n\n${PERSONAS[s]}`).join("\n\n")
      : "(No authors specified — instruct the user or auto-select based on genre signals in the draft.)";

    const text = `You are conducting a multi-author editorial pass on a draft. ${authorSlugs ? `Authors selected: ${authorSlugs.join(", ")}.` : "Auto-select 1-2 authors based on genre signals in the draft (marketing → Hemingway+Orwell; fiction → King+Vonnegut; essay → Didion+Baldwin; long-form nonfiction → McPhee; speculative → Le Guin+King; literary/mythic → McCarthy+Hemingway; self-aware criticism → Wallace+Didion)."}\n\n---DRAFT---\n${args.content}\n---END DRAFT---\n\n${authorSlugs ? `---PERSONAS---\n\n${personaBlocks}\n---END PERSONAS---\n\n` : ""}For each selected author, produce:\n- **Verdict** (one sentence top-line reaction)\n- **Marked passages** (3-8 quoted excerpts with ~~strikethroughs~~ for cuts and [→ replacements] for substitutions)\n- **Start here** (if they'd cut everything above a line)\n- **Hand off** (if a different author would serve better)\n\nThen consolidate into a single view:\n- Verdicts from each author\n- Where they agree (1-3 points)\n- Where they disagree (1-2 points, or "no significant disagreement")\n- Highest-leverage change (pick ONE)\n- Combined marked passages\n- Any cross-reference handoffs\n\nIf .great-authors/ exists in the working directory, each author reads the bible before editing per their ## Before you edit protocol.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_critique") {
    const authorSlugs = Array.isArray(args.authors) && args.authors.length > 0
      ? args.authors.map((a) => resolveAuthor(a).slug)
      : ["hemingway", "orwell", "didion"];
    const personaBlocks = authorSlugs
      .map((s) => `### ${s}\n\n${PERSONAS[s]}`)
      .join("\n\n");

    const text = `You are conducting a fast 3-bullet critique from multiple author personas in parallel. Authors: ${authorSlugs.join(", ")}.\n\n---DRAFT---\n${args.content}\n---END DRAFT---\n\n---PERSONAS---\n\n${personaBlocks}\n---END PERSONAS---\n\nFor EACH author, produce EXACTLY 3 bullets. Each bullet is one sentence. No introduction. No markup of passages. No rewrites. Just the three most important things that author notices.\n\nEnd each author's block with: "If I'm not the right voice here, try <X>." — or omit if they are.\n\nThen consolidate in one block:\n- Consensus: one sentence naming what most/all authors flagged\n- Sharpest disagreement: one sentence, or "no significant disagreement"\n- Handoffs: any cross-references\n\nKeep it TERSE. The whole output should fit on one screen.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_debate") {
    const a = resolveAuthor(args.author_a);
    const b = resolveAuthor(args.author_b);
    if (a.slug === b.slug) {
      throw new Error(
        `Debate requires two different authors. Got ${a.slug} twice.`
      );
    }
    const text = `You are running a 2-round craft debate between two author personas.\n\n**Topic:** ${args.passage_or_topic}\n\n---PERSONA A: ${a.slug}---\n${a.body}\n---END PERSONA A---\n\n---PERSONA B: ${b.slug}---\n${b.body}\n---END PERSONA B---\n\n## Round 1 (parallel)\n\nEach author states their position in 3-5 sentences. What would you do with this? Why? What would be wrong with treating it another way? Be specific about craft reasoning. Do NOT respond to the other author — just state your own position.\n\n## Round 2 (parallel)\n\nEach author reads the other's Round 1 response and replies in 3-5 sentences:\n- What do you concede? (If nothing, say so and explain.)\n- Where do you hold your position?\n- If you'd revise your Round 1, how?\n\n## Consolidation\n\nNarrate (out of voice):\n- **The real tension:** one or two sentences naming what this dispute is actually about — usually a genre, register, or audience question.\n- **Verdict:** pick ONE: Winner (one author, one sentence reason), Third way (a synthesis neither author proposed), or Genre call (the choice depends on X; here's how to decide).\n\nProduce all three sections now. Label them clearly.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_continuity") {
    const { slug, body } = resolveAuthor(args.author || "king");
    const text = `You are conducting a continuity audit on a draft. This is NOT an editorial pass for craft — it's specifically checking the draft against the project bible for contradictions.\n\n---AUDITOR: ${slug}---\n${body}\n---END AUDITOR---\n\nIf .great-authors/ exists in the user's current working directory, read:\n- project.md\n- voice.md\n- all characters/*.md\n- all places/*.md\n- timeline.md\n- glossary.md\n- all scenes/*.md\n- most recent entry in journal/ (if any)\n\nThen audit the draft below for:\n- CHARACTER DRIFT: physical, voice, backstory, relationship details that contradict character files\n- TIMELINE CONTRADICTION: sequencing that conflicts with timeline.md\n- VOICE RULE VIOLATION: the draft breaks rules in voice.md\n- GLOSSARY MISUSE: invented terms used differently from their glossary definition\n- SCENE CONTRADICTION: contradicts a prior scene card\n\n---DRAFT---\n${args.content}\n---END DRAFT---\n\nOutput format:\n- **Violations found:** N (or "None — the draft is consistent with the bible.")\n- For each violation: Type | Draft says "..." | Bible says "..." (path) | Severity (high/low)\n- **Next step:** one sentence on which violation to fix first.\n\nBegin the audit.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_project_init") {
    const target = args.target_dir || "<user's current working directory>";
    const text = `You are initializing a project bible for a writing project. Target directory: ${target}.\n\n1. Confirm the target directory with the user (or ask if none is set).\n2. If .great-authors/ already exists there, ask whether to overwrite (default no).\n3. Ask seven questions one at a time:\n   a. Working title?\n   b. Genre? (specific, not "fiction" but "cozy small-town mystery")\n   c. Premise? (one or two sentences)\n   d. POV and tense?\n   e. Dominant tone?\n   f. One non-negotiable voice rule? (skippable)\n   g. Starting chapter filename? (default: chapter-01.md)\n4. Create two sibling directories:\n   - .great-authors/ with: project.md, voice.md, timeline.md, glossary.md, and empty subdirs characters/, places/, scenes/, journal/\n   - manuscript/ with an empty file at the starting chapter filename\n5. Write the user's answers into project.md (under Working title, Genre, Premise, POV and tense, Register and voice, and Manuscript > Current) and voice.md (the non-negotiable rule).\n6. Report what was created. Suggest next steps: /authors-channel to write, /authors-draft to generate, /authors-journal to close the session.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_build_character") {
    const builder = resolveBuilder("character-builder");
    const lensNote = args.author_lens
      ? `Author lens: ${args.author_lens}. Apply the lens described in the builder's Mode A section (lenses shipped: king, le-guin; others fall back to default).`
      : "No author lens — use the default seven-question interview.";
    const text = `You are the character-builder. Your job is to interview the user and write a character entry at .great-authors/characters/<name>.md.\n\n**Character name:** ${args.name}\n\n**${lensNote}**\n\n---BUILDER PERSONA---\n${builder}\n---END BUILDER---\n\nVerify .great-authors/ exists in the user's working directory. If not, tell them to run authors_project_init first and stop.\n\nCheck for an existing character file at .great-authors/characters/${args.name}.md. If it exists, ask about overwrite.\n\nThen conduct the interview per the builder's Mode A. One question at a time. Do not fabricate answers.\n\nAfter the interview, write the structured file. Optionally ask about relationships to existing characters at the end.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_build_scene") {
    const builder = resolveBuilder("scene-builder");
    const lensNote = args.author_lens
      ? `Author lens: ${args.author_lens}. Apply the lens described in the builder's Mode A section (lenses shipped: mcphee, vonnegut).`
      : "No author lens — use the default eight-question interview.";
    const sceneId = args.id || "<ask the user>";
    const text = `You are the scene-builder. Your job is to interview the user and write a scene card at .great-authors/scenes/<id>.md.\n\n**Scene ID:** ${sceneId}\n\n**${lensNote}**\n\n---BUILDER PERSONA---\n${builder}\n---END BUILDER---\n\nVerify .great-authors/ exists. Check for an existing scene file. Then conduct the interview per Mode A — one question at a time.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_build_place") {
    const builder = resolveBuilder("place-builder");
    const lensNote = args.author_lens
      ? `Author lens: ${args.author_lens}. Apply the lens described in the builder's Mode A section (lenses shipped: mcphee, didion).`
      : "No author lens — use the default seven-question interview.";
    const text = `You are the place-builder. Your job is to interview the user and write a place entry at .great-authors/places/<name>.md.\n\n**Place name:** ${args.name}\n\n**${lensNote}**\n\n---BUILDER PERSONA---\n${builder}\n---END BUILDER---\n\nVerify .great-authors/ exists. Check for an existing place file. Then conduct the interview per Mode A.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_build_relationship") {
    const builder = resolveBuilder("relationship-builder");
    if (args.character_a === args.character_b) {
      throw new Error(
        "Relationship requires two different characters."
      );
    }
    const text = `You are the relationship-builder. Your job is to interview the user about the dynamic between two existing characters and update BOTH character files.\n\n**Character A:** ${args.character_a}\n**Character B:** ${args.character_b}\n\n---BUILDER PERSONA---\n${builder}\n---END BUILDER---\n\nFirst, verify both character files exist at .great-authors/characters/${args.character_a}.md and .great-authors/characters/${args.character_b}.md. If either is missing, tell the user to run authors_build_character for the missing one first.\n\nThen conduct the six-question interview per Mode A. After the interview, update BOTH character files' ## Connections section with reciprocal (but asymmetric — each written from that character's POV) entries.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_journal") {
    const text = `You are writing a session journal entry. Your job is to capture what happened this session so future author personas have context.\n\nVerify .great-authors/ exists. Create .great-authors/journal/ if it doesn't.\n\nDetermine today's date in YYYY-MM-DD format. If an entry already exists for today, ask append / new / cancel.\n\nInterview the user with four questions, one at a time:\n1. Worked on — which chapter, scene, or section? One line.\n2. Decisions made — list any choices affecting the project going forward. 3-5 bullets or "None."\n3. Unresolved — what's in flux? Up to 3 bullets.\n4. Where you left off — one sentence, literal next step.\n\nWrite the entry to .great-authors/journal/YYYY-MM-DD.md in this format:\n\n# YYYY-MM-DD\n\n## Worked on\n...\n\n## Decisions made\n- ...\n\n## Unresolved\n- ...\n\n## Next session\n...\n\nConfirm in one line with the path and the next-session sentence.\n\nKeep it short. A journal entry that takes 20 minutes to write will never get written.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_consolidate") {
    const text = `You are consolidating journal entries — promoting recurring decisions into the permanent bible.\n\nVerify .great-authors/journal/ exists and contains at least 3 entries. If fewer, tell the user there's not enough history and stop.\n\nRead all journal entries in .great-authors/journal/*.md, sorted by date.\n\nExtract "Decisions made" bullets. Group similar decisions. A "recurring" decision appears in 2+ entries or is clearly a ratification of an earlier one.\n\nFor each recurring decision, propose a promotion to the appropriate bible file:\n- Character-related → .great-authors/characters/<name>.md\n- Voice/rule-related → .great-authors/voice.md\n- Timeline-related → .great-authors/timeline.md\n- Premise/POV/tense-related → .great-authors/project.md\n- Invented term / brand → .great-authors/glossary.md\n\nAsk the user to confirm each promotion individually (yes / no / edit first).\n\nAfter all processed, offer to add a "## Consolidated on YYYY-MM-DD" section to the most recent journal entry showing what was promoted.\n\nFinal report: N decisions promoted across M bible files. Journal remains intact — consolidation is additive.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ---------- Boot ----------

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("great-authors MCP server running on stdio");
```

- [ ] **Step 2: Syntax-check**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  node --check distribution/dxt/server/index.js && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/dxt/server/index.js && \
  git commit -m "feat(dxt): add MCP server with 14 tool handlers"
```

---

### Task 6: Verify the server boots (dry run without the SDK installed)

Since we haven't run `npm install` yet, we can't actually boot the server. But we can verify the file doesn't have obvious problems by running the Node syntax check (already done in Task 5 step 2).

If the user wants to actually build the DXT bundle, they'll need to run:

```bash
cd distribution/dxt && npm install && npx @anthropic-ai/dxt pack
```

That produces `great-authors.dxt` at the project root.

No commit for this task — verification only.

---

### Task 7: Write the sync script

**File:** `distribution/sync-distribution.sh`

Copies `agents/*.md` from root into `distribution/dxt/server/personas/`.

- [ ] **Step 1: Write the script**

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/sync-distribution.sh`:

```bash
#!/usr/bin/env bash
# Sync agent files from root agents/ into distribution/dxt/server/personas/.
# Root is the source of truth. Run after editing any agent.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/agents"
DXT="$ROOT/distribution/dxt/server/personas"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: source dir not found: $SRC" >&2
  exit 1
fi

mkdir -p "$DXT"

echo "Syncing agents from $SRC"
echo "  → $DXT"

# Clear stale files in the target, then copy fresh.
find "$DXT" -maxdepth 1 -name "*.md" -delete

cp "$SRC"/*.md "$DXT/"

count=$(find "$SRC" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')
dxt_count=$(find "$DXT" -maxdepth 1 -name "*.md" | wc -l | tr -d ' ')

echo "Synced $count agents."

if [[ "$count" != "$dxt_count" ]]; then
  echo "ERROR: count mismatch — source=$count dxt=$dxt_count" >&2
  exit 1
fi

echo "Done. Commit with:"
echo "  git add agents distribution/dxt/server/personas && git commit -m 'sync: agents to DXT bundle'"
```

- [ ] **Step 2: Make executable + commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  chmod +x distribution/sync-distribution.sh && \
  git add distribution/sync-distribution.sh && \
  git commit -m "chore(dxt): add sync script for agents → DXT bundle"
```

---

### Task 8: Run the sync to populate the personas/ dir

- [ ] **Step 1: Run sync**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ./distribution/sync-distribution.sh
```

Expected: "Synced 14 agents." — 10 personas + 4 builders copied.

- [ ] **Step 2: Verify the DXT personas dir**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  ls distribution/dxt/server/personas/
```

Expected: 14 markdown files.

- [ ] **Step 3: Commit the synced files**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/dxt/server/personas/ && \
  git commit -m "feat(dxt): bundle 14 agents (10 personas + 4 builders) in DXT server"
```

---

### Task 9: Write DXT-specific README

**File:** `distribution/dxt/README.md`

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/dxt/README.md`:

```markdown
# Great Authors — DXT (Claude Desktop Extension)

Local MCP server that exposes the great-authors personas and workflows as tools for Claude Desktop.

## Architecture

The server returns structured *prompts*, not LLM output. Claude Desktop runs the persona reasoning inside its own inference using your subscription — no API key, no hosting, no per-request cost. Filesystem operations (reading the bible, writing to manuscript files) are handled by Claude Desktop's built-in filesystem access; the MCP server only supplies prompts.

## Build

```bash
cd distribution/dxt
npm install
npx @anthropic-ai/dxt pack
```

Produces `great-authors.dxt`. Double-click to install in Claude Desktop.

## Tools (14)

| Tool | Purpose |
|------|---------|
| `list_authors` | List the 10 personas + 4 tool personas. |
| `authors_channel` | Load a named author persona. |
| `authors_draft` | Draft prose in an author's voice + save to a manuscript file. |
| `authors_edit` | Multi-author marked-up edit. |
| `authors_critique` | Fast 3-bullet verdicts in parallel. |
| `authors_debate` | 2-round craft dispute between two authors. |
| `authors_continuity` | Audit a draft against the bible. |
| `authors_project_init` | Scaffold `.great-authors/` + `manuscript/`. |
| `authors_build_character` | Interview-based character bible entry. |
| `authors_build_scene` | Interview-based scene beat card. |
| `authors_build_place` | Interview-based place bible entry. |
| `authors_build_relationship` | Interview + update two character files. |
| `authors_journal` | Session journal entry. |
| `authors_consolidate` | Promote recurring decisions to the bible. |

## Filesystem access

For tools that read or write files (`authors_draft`, `authors_project_init`, the builders, `authors_journal`, `authors_consolidate`, `authors_continuity`), Claude Desktop must have filesystem access to the user's project directory. Configure this via Claude Desktop's "Allowed Folders" setting.

If filesystem access isn't configured, the tools still return useful prompts — the user will simply be asked to read/paste content manually or copy outputs back by hand.

## Team distribution

Drop `great-authors.dxt` in a shared Drive / S3 / internal site. Teammates download once, double-click. Updates = new file + re-install.

## Sync from source

Persona files in `server/personas/` are copies of the root `agents/` directory. Keep them in sync with:

```bash
../sync-distribution.sh
```

Run this after editing any agent file.
```

Commit:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/dxt/README.md && \
  git commit -m "docs(dxt): add DXT-specific README with build instructions"
```

---

### Task 10: Write the distribution-level README

**File:** `distribution/README.md`

Create `/Users/sethshoultes/Local Sites/great-authors-plugin/distribution/README.md`:

```markdown
# Great Authors — Distribution formats

The plugin ships in two formats:

| Format | Install target | Best for | Source |
|--------|----------------|----------|--------|
| **`great-authors`** (Claude Code plugin) | Claude Code | Terminal users who want the full slash command experience | repo root |
| **`great-authors-dxt`** (Claude Desktop) | Claude Desktop app | Non-terminal users; one-click install | `./dxt/` |

Both ship the same 10 author personas and 4 tool personas. The DXT has 14 tools corresponding to the 13 Claude Code slash commands plus `list_authors`.

## Install

**Claude Code:**
```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

**Claude Desktop:**
```bash
cd distribution/dxt
npm install
npx @anthropic-ai/dxt pack
```

Share the generated `great-authors.dxt` — teammates double-click to install.

## Sync between formats

The Claude Code plugin is the source of truth. The DXT bundles a COPY of `agents/*.md`. Keep them in sync with:

```bash
./sync-distribution.sh
```

Run after any agent edit.
```

Commit:
```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add distribution/README.md && \
  git commit -m "docs(distribution): add distribution README covering both formats"
```

---

### Task 11: Update root README

Update the root README to mention the DXT option.

- [ ] **Step 1: Update "What's in v0.7" to "What's in v1.0"**

Edit `README.md`: `## What's in v0.7` → `## What's in v1.0`

- [ ] **Step 2: Update the Install section to cover both formats**

Replace:
```
## Install

```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```
```

With:
```
## Install

**Claude Code:**
```
/plugin marketplace add sethshoultes/great-authors-plugin
/plugin install great-authors@sethshoultes
```

**Claude Desktop** (DXT bundle):
```bash
cd distribution/dxt && npm install && npx @anthropic-ai/dxt pack
```
Share the generated `great-authors.dxt` — teammates double-click to install.
```

- [ ] **Step 3: Remove the v1.0 line from the roadmap**

The roadmap is empty now. Replace:
```
## Roadmap

- **v1.0** — DXT package for Claude Desktop
```

With:
```
## Roadmap

All v1.0 goals shipped. Future work is driven by user feedback — open an issue at https://github.com/sethshoultes/great-authors-plugin/issues.
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git add README.md && \
  git commit -m "docs: update root README for v1.0 (DXT install + empty roadmap)"
```

---

### Task 12: Static integration check

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  echo "=== manifests ===" && \
  python3 -c "import json; print('plugin:', json.load(open('.claude-plugin/plugin.json'))['version'])" && \
  python3 -c "import json; m=json.load(open('.claude-plugin/marketplace.json')); print('marketplace plugins:', len(m['plugins']))" && \
  python3 -c "import json; m=json.load(open('distribution/dxt/manifest.json')); print('dxt tools:', len(m['tools']))" && \
  echo "=== DXT files ===" && \
  find distribution/ -type f | sort && \
  echo "=== personas synced ===" && \
  ls distribution/dxt/server/personas/ | wc -l && \
  echo "=== syntax check ===" && \
  node --check distribution/dxt/server/index.js && echo OK && \
  echo "=== validators still pass ===" && \
  for f in agents/*-persona.md; do ./scripts/lint-persona.sh "$f" > /dev/null && echo "PASS $(basename $f)" || echo "FAIL $f"; done && \
  for b in agents/character-builder.md agents/scene-builder.md agents/place-builder.md agents/relationship-builder.md; do ./scripts/lint-builder.sh "$b" > /dev/null && echo "PASS $(basename $b)" || echo "FAIL $b"; done
```

Expected:
- plugin: 1.0.0
- marketplace plugins: 2
- dxt tools: 14
- personas synced: 14
- Node syntax: OK
- All 10 persona validators pass
- All 4 builder validators pass

No commit — verification only.

---

### Task 13: Push + tag v1.0.0

```bash
cd "/Users/sethshoultes/Local Sites/great-authors-plugin" && \
  git log --oneline origin/main..main && \
  git push origin main && \
  git tag -a v1.0.0 -m "v1.0.0 — DXT package for Claude Desktop; same personas and commands as great-authors plugin" && \
  git push origin v1.0.0 && \
  gh api repos/sethshoultes/great-authors-plugin/tags --jq '.[].name' | head -9
```

Expected: `v1.0.0` at top of tag list.

---

## Self-review

- **Spec coverage:** Section 7 "Phase 3 candidates" → DXT package. Shipped.
- **Architecture:** mirrors great-minds-plugin's DXT approach. Server is a prompt factory; Claude Desktop handles everything else.
- **Sync debt:** the sync script codifies the agents-to-DXT copy. This is the sync tax flagged in the [[plugin_great_minds]] memory — accepted as the pragmatic cost of shipping two formats. Alternative (symlink) wouldn't work because DXT packs the personas into a zip.
- **Placeholder scan:** clean.
- **Not tested:** we don't actually build the `.dxt` bundle in this plan. The user must have npm installed and run `npm install && npx @anthropic-ai/dxt pack` in `distribution/dxt/`. If the SDK install fails, that's a local environment issue, not a plan bug.
- **Risk:** the MCP server hasn't been functionally tested (we only did a syntax check). The prompts are derived from the existing SKILL.md content, so they're as correct as those skills are. The real test is running a DXT-built bundle in Claude Desktop and exercising each tool.
