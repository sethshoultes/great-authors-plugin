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
  { name: "great-authors", version: "1.2.0" },
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
    {
      name: "authors_rewrite",
      description:
        "Return a prompt that dispatches a named author to rewrite an existing manuscript file from scratch with full bible context. Use when a chapter is not working — prose is mechanical, voice has slipped, or the chapter doesn't match the established voice. Discards the existing draft's emotional/dramaturgical choices but preserves architecture-level facts.",
      inputSchema: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Path to the manuscript file to rewrite (typically manuscript/chapter-NN.md).",
          },
          author: {
            type: "string",
            description: "Author slug or short form (king, vonnegut, hemingway, etc).",
          },
          notes: {
            type: "string",
            description: "Optional editorial notes to fold into the rewrite brief (e.g., from a prior /authors-edit pass).",
          },
        },
        required: ["file", "author"],
      },
    },
    {
      name: "authors_corpus_critique",
      description:
        "Return a prompt that runs ONE editor across MULTIPLE files in parallel, then consolidates into a corpus-level pattern report. Surfaces patterns no per-file critique catches — voice drift, recurring tics, structural failures visible only across multiple pieces. Different from authors_critique (N authors on 1 file). This is 1 author on N files.",
      inputSchema: {
        type: "object",
        properties: {
          author: {
            type: "string",
            description: "Editor slug. Pick deliberately: orwell for cant/jargon/robotic-prose hunts; hemingway for sentence-level cuts; didion for cool-observation drift; mccarthy for weight inconsistency; baldwin for moral-weight drift; mcphee for structural drift in long-form.",
          },
          paths: {
            type: "array",
            items: { type: "string" },
            description: "Array of file paths or glob patterns. At least 2 required, max 20 per pass.",
          },
          focus: {
            type: "string",
            description: "Optional one-line framing to focus the editor's reading (e.g., 'check for AI-generated robotic copy', 'check whether closes earn their weight').",
          },
        },
        required: ["author", "paths"],
      },
    },
    {
      name: "authors_orchestrate_novel",
      description:
        "Return a prompt for the seven-phase autonomous-novel-orchestration pipeline: Concept → Architecture → First-draft skeleton → Continuity audit → Editorial pass → Debate → Final → Beta-reader package. Composes the existing skills into a workflow with HUMAN CHECKPOINTS at every phase boundary. The orchestrator dispatches author sub-agents; the human directs and reviews.",
      inputSchema: {
        type: "object",
        properties: {
          phase: {
            type: "string",
            description: "Optional phase to run (0-7) or 'all' for full pipeline. Default 'all'. The pipeline pauses at every checkpoint regardless.",
          },
          resume: {
            type: "boolean",
            description: "If true, read the most recent journal entry and resume from where the prior session left off.",
          },
        },
      },
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

  if (name === "authors_rewrite") {
    const { slug, body } = resolveAuthor(args.author);
    const notesBlock = args.notes
      ? `\n\n**Editorial notes to fold into the rewrite brief:**\n${args.notes}\n`
      : "";
    const text = `You are dispatching ${slug} to rewrite an existing manuscript file from scratch. This is a FULL REWRITE, not a revision. Discard the existing draft's emotional and dramaturgical choices but preserve architecture-level facts.\n\n**File to rewrite:** ${args.file}\n${notesBlock}\n---PERSONA: ${slug}---\n${body}\n---END PERSONA---\n\nInstructions:\n\n1. **Read the bible first.** If .great-authors/ exists in the user's working directory, read project.md, voice.md, voice-lints.md (if present), structure.md, suspense-architecture.md (if present), timeline.md, the most recent journal entry, all relevant character and place files, and the chapter immediately preceding and following the file being rewritten.\n\n2. **Read the existing file** to understand the architecture-level facts (named characters, named events, established locations, the chapter's required beats per structure.md). Note them.\n\n3. **Discard the existing prose's emotional choices.** Discard the existing prose's pacing. Discard the existing prose's voice if it has drifted. Hold to the established voice (per voice.md and prior chapters in the established voice).\n\n4. **Write a self-contained brief in your head** based on:\n   - Architecture beats from structure.md / suspense-architecture.md for this chapter\n   - Voice rules\n   - One concrete craft challenge specific to this chapter\n   - Length expectations (compare to existing draft; expand or compress as appropriate)\n   - The editorial notes above (if any)\n\n5. **Write the rewrite.** Save back to ${args.file}, OVERWRITING the existing draft.\n\n6. **Report under 200 words:** what you changed, what you kept, what you decided to leave alone.\n\nVoice and craft constraints come from your persona file and the project bible. The bible's voice rules override your default preferences.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_corpus_critique") {
    const paths = Array.isArray(args.paths) ? args.paths : [];
    if (paths.length < 2) {
      throw new Error("authors_corpus_critique requires at least 2 file paths. Use authors_critique for single-file critique.");
    }
    if (paths.length > 20) {
      throw new Error("authors_corpus_critique caps at 20 files per pass. Chunk by genre or theme for larger corpus.");
    }
    const { slug, body } = resolveAuthor(args.author);
    const focusBlock = args.focus
      ? `\n\n**Focus framing:** ${args.focus}\n`
      : "";
    const fileList = paths.map((p, i) => `${i + 1}. ${p}`).join("\n");
    const text = `You are running a corpus critique pass — ONE editor (${slug}) across MULTIPLE files in parallel, with consolidated corpus-level pattern report.\n\nThis is different from authors_critique (which runs N authors on 1 file). This is 1 author on N files. The value is surfacing patterns that exist across the corpus but not within any single piece.\n\n**Editor:** ${slug}\n**Files (${paths.length}):**\n${fileList}\n${focusBlock}\n---PERSONA: ${slug}---\n${body}\n---END PERSONA---\n\nInstructions:\n\n1. **Dispatch ${slug} on each of the ${paths.length} files in parallel** via the Agent tool. Each dispatch reads ONE file and returns:\n   - Per-file verdict: HUMAN | ROBOTIC | MIXED — one-line reason\n   - What's working (max 2 bullets)\n   - What's not (max 2 bullets)\n   - **Pattern hypothesis** (1 sentence: what kind of failure-mode or strength might also appear in OTHER pieces by this writer? Be specific — name the kind, not just "bad prose.")\n   - Recommendation: leave alone | light edit | full rewrite\n\n   Each dispatch saves its verdict to /tmp/corpus-critique/<basename>-${slug}.md.\n\n2. **Wait for all dispatches** to complete. Read every verdict file.\n\n3. **Identify the corpus pattern.** Look for:\n   - **Direct convergence** — same pattern hypothesis named by multiple files\n   - **Indirect convergence** — different language, same underlying problem\n   - **Strong divergence** — different files have genuinely different problems. NO corpus pattern. Say so explicitly. False patterns are worse than no patterns.\n\n4. **Output the corpus report** to /tmp/corpus-critique/SUMMARY-${slug}-<YYYY-MM-DD>.md:\n\n   - Per-file verdict table\n   - The pattern (if convergence found) — one paragraph naming it, citing specific files\n   - If no pattern: explicit statement that no corpus-level signal exists\n   - Per-file recommendations\n   - Corpus-level recommendation — what should the writer change going forward beyond fixing the current corpus?\n\n5. **Show the SUMMARY to the user.** Offer next moves: apply per-file recommendations, save the pattern as a brain-vault learning if novel, or stop and let the user act at their own pace.\n\nThe pattern hypothesis at step 1 is what makes this different from running authors_critique N times. Each editor knows they're part of a corpus pass and is asked to surface patterns. Without that framing, you'd have to find patterns from inference. With it, the editors do the pattern-spotting themselves.\n\nBegin.`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "authors_orchestrate_novel") {
    const phase = args.phase || "all";
    const resumeNote = args.resume
      ? "\n\n**Resume mode:** Read .great-authors/journal/ for the most recent entry. Identify which phase the project is currently in. Resume from the next checkpoint.\n"
      : "";
    const text = `You are orchestrating an end-to-end novel pipeline using the great-authors plugin's existing skills as building blocks. Your role is ORCHESTRATOR, not WRITER. Dispatch author sub-agents via the Agent tool. Do NOT write prose in-context yourself.\n\n**Phase to run:** ${phase}\n${resumeNote}\nIf you find yourself reaching for the Write tool to put prose in manuscript/, STOP. Ask: have I dispatched the writer for this? If not, that's the next move.\n\n## The seven phases\n\nEach phase produces specific artifacts. Each phase ends in a HUMAN CHECKPOINT — pause, surface a summary, wait for explicit approval before continuing.\n\n**Phase 0 — Concept (interactive).** Collect required inputs from the human: working title, genre, premise, POV/tense, dominant tone, estimated chapter count, major character roster (names + roles), key locations. Recommended: antagonist concept, resolution shape, voice author, one non-negotiable voice rule. If no .great-authors/ exists at the working directory, run /authors-project-init.\n\n**Phase 1 — Architecture.** For each character: dispatch /authors-build-character. For each place: /authors-build-place. For obvious major character pairs: /authors-build-relationship. Orchestrator drafts structure.md (full chapter outline) and suspense-architecture.md (audience-vs-character knowledge spine — bombs planted, paid off, withheld registers, visual carriers). Optional: voice author 5-bullet structural read on the bible. CHECKPOINT.\n\n**Phase 2 — First-draft skeleton.** For each chapter in structure.md, in order: read bible + prior/next chapters; brief; dispatch chosen voice author via /authors-rewrite or /authors-draft; read result; /authors-continuity; fix violations; update structure.md (mark drafted); commit. CHECKPOINT after all chapters drafted.\n\n**Phase 3 — Continuity audit.** Dispatch ONE comprehensive sub-agent to audit whole manuscript against whole bible. Triage violations: mechanical fixes (orchestrator-direct), surgical chapter fixes (focused dispatch), structural fixes (voice-author dispatch), bible additions. Apply fixes. Re-dispatch verification audit. Loop until clean. CHECKPOINT.\n\n**Phase 4 — Editorial pass.** For each chapter: dispatch one editor (rotating across chapters: vonnegut for compression, hemingway for cuts, didion for cool observation, mccarthy for weight, baldwin for moral weight). Each returns tight verdict (max 5 bullets per chapter). Save verdicts to .great-authors/edit-pass/. Compile master summary. Triage: surgical cuts (apply directly) vs. substantive rewrites (/authors-rewrite). CHECKPOINT.\n\n**Phase 5 — Debate (conditional).** If Phase 4 surfaced an unresolved craft tension, /authors-debate <topic> <author-A> <author-B>. ALWAYS run both rounds. Apply verdict via /authors-rewrite. Save transcripts to .great-authors/debates/.\n\n**Phase 6 — Final pass.** Last comprehensive continuity audit. Last /authors-critique sweep. Apply final cuts. /authors-journal. /authors-consolidate.\n\n**Phase 7 — Beta-reader package.** Generate manuscript/full-manuscript.md (concatenated). Dispatch synopsis writer (single page). Dispatch query letter draft. Optional: reader's guide. Final journal entry. CHECKPOINT.\n\n## Decision points where the AI MUST pause for human\n\nNever invented by the AI without explicit human input. If forced, stop and surface options.\n\n1. Antagonist / villain identity\n2. Resolution shape (happy / tragic / ambiguous)\n3. Major character motivations\n4. Specific cultural or factual content requiring outside knowledge\n5. Voice author for the manuscript (if not picked at Phase 0)\n6. Whether to run Phase 5\n\n## Day-to-day pattern (within any phase)\n\n1. Read bible / prior phase artifacts.\n2. Brief (self-contained).\n3. Dispatch (Agent tool, run_in_background=true for parallel).\n4. Read result.\n5. Verify (continuity check if manuscript touched).\n6. Integrate (surgical or another dispatch).\n7. Commit (per logical unit, descriptive message).\n8. Move on.\n\n## Anti-patterns\n\n- Writing prose in-context.\n- Pattern-matching an author's voice in your context.\n- Batching multiple chapters into a single autonomous run.\n- Skipping bible reads.\n- Thin briefs.\n- Skipping continuity verification after substantive changes.\n- Skipping Round 2 of debates when Round 1 reveals consensus.\n- Letting chapters silently contradict the architecture.\n- Advancing past a checkpoint without explicit human approval.\n\nBegin Phase ${phase === "all" ? "0 (Concept)" : phase} now. If interactive (Phase 0 or any phase requiring human inputs), ask the first question. Otherwise, summarize the phase's read step and dispatch the first sub-agent.`;
    return { content: [{ type: "text", text }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// ---------- Boot ----------

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("great-authors MCP server running on stdio");
