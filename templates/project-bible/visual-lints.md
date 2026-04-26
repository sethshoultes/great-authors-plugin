# Visual Lints

Hard visual rules for THIS project. The companion to `voice-lints.md`, but for the visual register — illustrations, keyframes, covers, any image-gen render.

A lint here is a rule that can be enforced by pattern: prepended verbatim to every render's negative-prompt section, checked against draft prompts before submission, surfaced in continuity audits. They are distinct from the *judgment* register in the project's style preset (which lives in `project.md`'s `## Visual` section as the style anchor) — the style anchor describes what every image *should* look like; the visual lints describe what every image *must not* contain.

`/filmmakers-build-keyframes` reads this file (when it exists) and the director persona uses the consolidated negative-prompt section as the baseline of every cue point's `Negative prompt` block. Render scripts (`render_keyframes.py`, `render_book_illustrations.py`) prepend it to every submission.

If a project has no strict visual register, this file can stay empty or be deleted. If a project has even one hard refusal — *no faces visible*, *no anachronistic vehicles*, *no color leak* — fill in the section it belongs to.

## Forbidden elements

(Things that must NEVER appear in any image for this project. One per line. Specific. Concrete. Things a model might invent if not told otherwise.)

```
# Examples — uncomment and edit for this project:
# saguaro cacti                    # wrong region; use creosote and blackbrush
# Monument Valley butte silhouettes # too iconic; this is the Arizona Strip, not John Ford country
# cowboy hats                       # period and character mismatch
# anachronistic vehicles            # no cars after <year>; no horse-drawn before <year>
# brand logos                       # no readable Coca-Cola, Nike, Apple, etc.
# readable text overlays            # the image carries the image; text lives in HTML
# whimsical linework                # this is editorial; keep the line draftsmanlike
# decorative flourishes             # no art-nouveau curls, no period filigree unless required
# frame-within-frame borders        # no inset borders, no faux-vintage frames
# moonlight blue tones              # this is grayscale pen-and-ink; no color leak
# saturated color of any kind       # if the project is monochrome, name it explicitly
```

## Required elements

(Things that MUST appear in specific contexts. Use sparingly — most projects don't have these. Anchor by character or location, not by every frame.)

```
# Examples:
# When <character> is in frame: face never visible (always from behind, or hooded, or out-of-frame)
# When <location> is named: rounded sandstone in foreground; no jagged or vertical formations
# When the period marker is on screen: <specific car model>, <specific clothing era>, <specific tech generation>
```

## Color register

(One paragraph naming the color rules of the project's images. If the register is monochrome, name it. If it's a limited palette, name the palette. If it's full photoreal cinematic, name that too.)

```
# Example:
# Pen-and-ink only. Black ink on paper-cream. No grayscale wash. No color of any kind, including in highlights or shadow.
# Crosshatch density carries the tonal range. The only "color" allowed is the paper texture itself.
```

## Period markers

(Anchor the project to its period. Vehicles, clothing, technology, signage. Things a model might unconsciously place in the wrong era.)

```
# Examples:
# Vehicles: pre-2010 only — no rounded contemporary SUV silhouettes; no Tesla shapes
# Clothing: 1990s-early-2000s American casual; no athleisure; no current-decade fashion
# Tech: no smartphones; no smart watches; landlines, paper notebooks, flip phones if any
# Signage: hand-lettered or 1990s-era; no contemporary corporate type
```

## Character continuity locks

(Hard rules per character. Things that must hold across every frame in which that character appears. Anchored by character name from `characters/<name>.md`.)

```
# Example:
# <Character A>: face never visible — always from behind, hooded, or out-of-frame.
#                Right hand carries a single object (specified per scene); left hand free.
#                No jewelry on either hand. No watch. No nail polish.
# <Character B>: dark hair tied back at all times; no hair in the face.
#                Wears denim and field shirt — no department-store logos visible.
#                Boot register: working boots, never dress shoes, never sneakers.
# <Character C>: glasses always present.
#                One distinctive scar at <location>; render in every close shot of that area.
```

## Negative-prompt synthesis

When `/filmmakers-build-keyframes` runs and this file exists, the director synthesizes the consolidated negative-prompt section from these rules and uses it as the baseline of every cue point's `Negative prompt` block. The director may add cue-specific refusals on top, but cannot remove anything from the baseline without explicit user override.

When a render script runs (`render_keyframes.py` etc.), the script also prepends the consolidated negative-prompt section to every submission, ensuring the rules hold at the API call regardless of what the prompt block contains.

## Editing this file

Add rules as the project's visual register tightens. A rule belongs here when it would survive being applied to *every* image in the project — across chapters, across covers, across promotional stills. If a rule only applies to a subset (e.g., only book covers, not chapter illustrations), add it to the relevant prompt block directly rather than to this file.

The goal is to never have to restate a rule that is true everywhere in the project.
