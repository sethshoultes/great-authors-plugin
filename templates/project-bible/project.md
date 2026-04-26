# Project Bible

The top-level reference every author reads before editing this project.

## Working title

(Your title, or a placeholder — the point is to have one.)

## Genre

(Literary fiction, thriller, essay collection, technical nonfiction, newsletter, etc. Be specific. "Fiction" is not enough; "cozy small-town mystery" is.)

## Premise

(One or two sentences. What is this about? What's the central question?)

## POV and tense

(First-person past / third-person limited present / omniscient / etc. Pick one and commit.)

## Register and voice

(Cool and observational / warm and colloquial / biblical and mythic / plain-style hammer / etc. One sentence that a stranger could use as a guide.)

## Non-negotiables for this project

(Things every author reviewing this manuscript must respect. E.g., "no interiority in italics," "no second-person," "British English spelling," "present tense only.")

## Manuscript

**Path:** `manuscript/` (at project root, sibling to `.great-authors/`)
**Naming:** `chapter-NN.md` (zero-padded: `chapter-01.md`, `chapter-02.md`, ...)
**Current:** (the chapter you're actively working on — e.g., `chapter-01.md`)

Commands that generate prose (`/authors-draft`, `/authors-channel`) save to the `Current` file by default. Update this field when you move on to the next chapter, or override per-command with `--to <path>`.

## Visual

(Optional — fill in when the project produces illustrations, keyframes, covers, or any image-gen artifacts. Skip if the project is prose-only.)

**Path:** `film/render/book-illustrations/` (chapter illustrations) and `film/render/<engine>/keyframes/` (video keyframes, when applicable)
**Current illustration set:** (the set you're actively rendering — e.g., `book-illustrations`, `chapter-01-keyframes`)
**Style preset:** (slug from `great-filmmakers/docs/style-presets.md` — e.g., `pen-and-ink-editorial`, `photoreal-cinematic`, `mid-century-illustration`)

**Style anchor (verbatim, prepended to every render prompt):**

> (Replace this block with the project's actual style anchor. The text below is read verbatim by `/filmmakers-build-keyframes`, by render scripts, and by any cross-plugin skill that produces visual artifacts. Every image-gen submission for this project starts with this paragraph.)
>
> Pen-and-ink illustration, New Yorker editorial register. Crosshatch shading. High-contrast linework. Spare composition. Editorial, adult, draftsmanlike. Never whimsical. Paper-grain texture.

Visual rules that can be lint-enforced (forbidden elements, required elements, period markers, character continuity locks) live in `visual-lints.md` alongside `voice-lints.md`. The two are companions: voice lints govern prose, visual lints govern images.

`/filmmakers-build-keyframes` reads this section to choose the style preset and pull the verbatim style anchor. Project-level render scripts (`scripts/render_keyframes.py`, `scripts/render_book_illustrations.py`) read it to prepend the anchor to every submission. Eliminates per-prompt restatement of the project's visual register.

## Established facts

(Anything about the world, the rules of the game, the history of the characters that's settled. If it's here, authors trust it; if it's contradicted in the manuscript, they flag it.)
