# Game walkthrough plan — option A approved and implemented

Joshua approved A and autonomous implementation on 2026-11-14. See `docs/ORBITAL_GALLEON.md` for the delivered first playable slice, media credits, verification and remaining limits. The planning text below records the original proposal; its pending-choice language is historical.

2026-11-14. Inspected HEAD `a741f98` and changes across the last three commits. Planning only; no app edits, asset generation, package installs, commits or pushes in this task. The supplied Clash of Clans image is an interaction/placement reference, not an asset to copy.

## Current baseline and actual gap

The recent work already contains NavigatorMascot.tsx (about 900 lines), Piper contextual guidance, a five-step tour, science glossary, synthetic chimes, crew cards, and About/Mission/Members/Sources/Judge/Summary pages. The main investigation engine and map remain. globals.css currently uses /images/game-cockpit-bg.jpg as a static background. This review was source/diff based, not a fresh browser or data validation run; STATUS's build/test claims remain historical evidence.

Improve the interaction model rather than rebuilding the backend or adding more competing page frames. A background movie supplies atmosphere; game logic supplies progress, player choices and consequences. Keep a direct analysis/judge path alongside the story. Preserve existing useful work, team portraits, source receipts and statistical caveats.

## Background choices for owner selection

| Option | Seamless scene concept | Feeling and suitability |
| --- | --- | --- |
| A — Orbital galleon (recommended) | View from a space-pirate ship: Earth/clouds drift slowly, stars move gently, subtle cabin light, occasional distant meteor | Strong space/ship identity; leaves room for a readable map and mascot |
| B — Storm at the observation deck | Rain on the ship's glass, distant clouds and softly moving rigging; restrained horizon glow | Strong weather/pirate mood; avoid lightning flashes and avoid implying actual local rainfall |
| C — Nebula voyage | A ship sails through slow teal/gold nebula currents and sparse floating particles | Calm, stylized, legible; more fantasy than Earth-focused |
| D — Meteor watch | Distant meteor trails and slowly drifting rocks outside the viewport | Energetic; use as a brief departure transition rather than constant motion behind statistics |

Recommendation: A as home/deck ambience, optional B at a precipitation station only once that feature exists, and D as an optional brief transition. The owner can instead choose any single style. Never imply meteors cause the measured climate trends. No final video source, licence, generation provider or spending approval is established yet.

Implementation targets (proposed, to measure on real devices): one locally served, short seamless compressed loop per active scene, muted/playsInline, poster shown immediately, no autoplay dependency for operation. Use capability/autoplay failure handling, a visible pause/static setting, reduced-motion/data-saver/low-power poster fallbacks, pause while hidden and offscreen, and stop background animation in evidence/chart scenes. Load only the active scene's media; do not stack a background movie, particle engine and expensive globe everywhere. Choose actual format/resolution/bitrate after one asset/device test; do not promise every browser autoplays it. Record visual asset authorship/licence/AI use. Weather effects are decorative unless explicitly connected to actual observations.

## One playable expedition: proposed storyboard

1. **Board the ship:** one scene, original Piper portrait at bottom left, one short greeting, “Start expedition” and “Skip to analysis.” No long landing-page sales pitch.
2. **Chart a destination:** globe is the interactive focal point. Piper points to selection; an actual country/custom-box action completes this step. Preserve numeric inputs, ocean selection, 2D fallback and bbox wording.
3. **Make a prediction:** player predicts rising / falling / uncertain for the real available measurement. Explain prediction is their hypothesis, not a fact. Choices are optional and must not influence calculation or data selection.
4. **Read the record:** choose available dates from metadata, optionally inspect shorter/longer windows with identical methods. Fetch real analysis. If source/access fails, explain honestly; offer a clearly labelled verified saved investigation, never a silent unrelated substitution.
5. **Open the evidence chest:** reveal WHAT, WHERE, HOW MUCH and SIGNIFICANCE together, then chart and source log. Piper translates the returned finding in plain language and handles non-significant/inconclusive results respectfully. No cosmetic animation changes a verdict.
6. **Captain's log:** summarize selection, prediction, actual result, named method, caveats and source. Export/share the evidence or begin another expedition. Reward completing a careful investigation, never obtaining a particular slope/significance.

Later missions can introduce comparisons, precipitation and vegetation only after the corresponding real data is implemented. Avoid a sprawling RPG, combat, arbitrary scores or mandatory map traversal; the challenge remains Earth-system investigation. A user/judge can reach a real or clearly labelled saved result directly.

## Mascot art and behavior

Keep **First Mate Piper** as the proposed single identity; reconcile stale “Orion” naming in submission copy. Create an original consistent pirate-space navigator, using the supplied reference only for bottom-left placement, readable attached speech bubble and friendly welcome. Do not copy the referenced character, costume, face, audio, assets or branding.

Five authored expression/pose sets:

- Welcome: smile + wave; arrival/return.
- Guide: pointing/open hand; highlights the next actionable control.
- Thinking: curious/considering; prediction and analysis waiting, without fake progress.
- Concerned/uncertain: thoughtful expression; sparse/missing data, unsupported selection or genuine errors; no scolding.
- Celebration: modest cheerful gesture; completing a careful investigation, including a valid non-significant conclusion.

Optional neutral idle is a sixth base. Approve one character design first, then create all variants from the same reference, framing, lighting, costume and scale. Prefer transparent portraits with two mouth variants per talking pose, optional blink layers and small CSS/bone motion over five independently generated moving characters. Talking animation runs only with dialogue; provide full text immediately, optional reveal animation, Next/Back/Skip/Replay and a compact close/reopen control. No always-on speech or audio. Explicit sound opt-in.

Use an event-driven journey state machine: welcome → destination_selected → hypothesis_set → period_selected → analysis_requested → evidence_received/error → log_saved. Steps must observe actual form/result state, rather than advancing through generic paragraphs regardless of user action. Separate mascot presentation from navigation state and science state. Minimized guide, repeat visits and reloads must preserve the form without replaying the full introduction. Local progress is optional and clearable; version it when the tour changes.

Bottom-left must not cover attribution, labels, chart controls, form fields or keyboard focus. On small screens collapse to a small portrait button and an intentional sheet. Dialogue is a short prompt (proposed ceiling ~20 words), one primary action and optional “Why?” expansion; deeper explanations stay in accessible glossary/source panels. Highlight a target without blocking unrelated controls. Avoid screen-reader chatter from every animation frame.

## Copy and handbook plan

Do not delete the existing competition pages: those are useful new work. Put the playable journey first and reduce the default navigation to Play / Missions / Crew / Evidence, with clearly labelled About, Sources & AI, Project Summary and Judge briefing links in an accessible menu/footer or evidence hub. Retain a direct plain analysis entry.

Separate content layers:

- Play: one instruction, one decision, concise status; no marketing wall.
- Evidence: four answers, chart, method/interval/p-value, coverage, source/version/date/checksum, limitations and export. Readable even with all effects off.
- Judge/submission: high-level summary, why/what/how, actual community involvement, real members/photos/team photo, tools and AI/asset credits, working app/public code links and <30-second YouTube demo.

The user's supplied handbook excerpt describes NASA submission-page content; it does not explicitly require identical standalone app routes. Consolidate repetition without dropping submission requirements. A draft /demo section or a script is not an actual recorded YouTube demo. A localhost link is not public deployment. Placeholder URLs and proposed usability studies are not completed submission evidence.

Source-review issues to include in the copy pass: NavigatorMascot glossary hardcodes “present month”/1,762 months; derive coverage from metadata and do not imply incomplete current-month observations. Its “satellites like IMERG” wording should distinguish the retrieval product from a satellite. Some copy asserts full mathematical rigor despite the documented HR audit differences; preserve those caveats. Reconcile Piper/Orion naming. Treat these as findings to fix and verify, not an exhaustive claim audit.

## Delivery sequence and acceptance

1. Owner chooses background A/B/C/D and approves a mascot design direction. No app-wide rebuild before these decisions.
2. Produce one storyboard and one Piper reference design; then five consistent expression sets. Asset provenance/credits and any costs must be explicit.
3. Build ONE end-to-end expedition using existing verified temperature data, one selected loop and action-driven guidance. Review a concrete playable slice before adding more scenes.
4. Integrate real results, error/inconclusive branches, saved-example identity and captain's log/export. Keep direct analysis and judge access.
5. Consolidate copy/navigation and complete submission gaps, then expand missions only when data exists.
6. Verify desktop/phone, keyboard/skip/resume, muted/autoplay denial, hidden-tab pause, static/reduced-motion/low-power, no-WebGL fallback, real/saved/offline distinctions and unchanged scientific values. Measure loading/rendering with one loop before adding more. Run appropriate focused checks/build, not repeated whole suites while source is unchanged.

Data backlog remains: authentic rainfall sample/login route and validation, vegetation feasibility, HR numerical discrepancy review, clean-checkout/deployment verification. UI work can proceed while authenticated input is obtained, but must not unlock fictional datasets. No exact timeline or guaranteed competition outcome is claimed.

## Pending owner choice

Recommended package: **A — orbital galleon + original Piper in five expressions + one guided temperature expedition**. Decide whether to use this or B/C/D before asset production/implementation. This plan does not authorize external publication, Git push, paid video services or account actions.
