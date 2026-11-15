# Antigravity task: three pages, one game, one Piper

Owner request: simplify Trend Compass to three primary pages and fix inconsistent Piper identity. Keep the illustrated adventure the owner liked. Execute this focused change; do not restart the product design.

Read AGENTS.md, docs/TEAM_PLAYBOOK.md, the current delivery track in docs/TASKS.md and latest STATUS. Inspect current git status and preserve other actors' work. No commit, push, deployment, new package or image-generation spending without separate owner approval.

## Deliver exactly three primary screens

**1. Play — `/`**
- The existing adventure is the default landing experience. Remove the separate marketing home screen. `/play` becomes a compatibility redirect to `/`, preserving valid mission parameters.
- Retain the current illustrated space/pirate/ship scenes, grounded character, short dialogue, Continue/Skip, globe selection, hunch, actual NASA scan and evidence reveal. Do not restore dashboard cards as the main experience.
- Keep how-to-play inside the intro and detailed evidence/charts/methods in the existing drawer. Saved missions, if retained, are an in-game action rather than another page.
- Retain one selected region and its coordinates through the mission. Normalize/validate all scene and query parameters. Legacy numeric `step=2` must not become an invalid scene and blank screen. Never invent a player's prediction on direct links to evidence. Resolve the final coordinates before running a linked investigation; do not briefly analyze the default India box while another country's geography loads.

**2. About Us — `/about`**
- Consolidate About, Members/Crew, Mission/Aim, Project Summary and Judge information here. Use short sections with anchors/expanders: project summary; problem/solution/approach; vision/mission/aim; actual impact/community involvement; members with photos and roles; team photo if provided; tools/frameworks; submission/demo links.
- Preserve actual team portraits and factual content; remove repetition and unsupported promotional/scientific claims. Use Piper consistently; remove obsolete Orion references.
- Provide the real public code/materials link, working prototype link and YouTube demonstration under 30 seconds when available. Label missing links/photos/video honestly. A storyboard is not a recorded demonstration; localhost is not a public prototype.

**3. Data Management — `/data`**
- Consolidate Sources & AI and scientific transparency into this page: every used dataset and its purpose, official source, version, units, coverage, baseline, spatial resolution, provenance/receipts, methods, uncertainty, limitations, third-party assets and AI tools/prompts/data used.
- Clearly distinguish numerical observations, decorative imagery, validation/reference CSVs, processed stores, saved results and unavailable future resources.
- Retain the working server-enforced source switches and master kill switch. Separate public, readable provenance from authorized local management controls within the page. Judges must not need a login to read sources; ordinary public visitors must not gain administration powers. Do not weaken the existing local controls or expose its private capability.
- Disabling required data must stop live and saved operations that depend on it. Disabling optional imagery must leave numerical analysis usable. Do not create fake upload/import/API capabilities or enable unavailable rainfall/vegetation data.

No fourth primary page is needed. The supplied handbook concerns content on the NASA submission page, not a requirement for one app route per section. Keep that external submission page complete separately. Consolidating app pages does not complete the submission automatically.

## One shared navigation bar

Show **TREND COMPASS | Play | About Us | Data Management**, consistently on all three screens, including play. Small audio/theme icons can be controls, not additional pages. Keep the three destinations usable on phones. No Home/Demo/More/Judge/Members duplicate links or large footer directory.

Merge the existing game header and application navbar; do not stack two headers. Mission progress can remain inside the game scene or a compact HUD. Update AppShell's game-route detection and viewport sizing: game height is the remaining viewport beneath the shared nav, not 100vh plus another header. Preserve dialogs/drawers, keyboard access, skip control, reduced-motion behavior and data-error states.

## Preserve old links without preserving duplicate screens

Move useful content before retiring pages. Redirect /members and /crew to /about#crew; /mission to /about#mission; /summary, /project-summary and /judge to the appropriate /about section; /sources to /data#sources. Handle /investigate, /results and /demo with explicit compatibility mapping into the game. Preserve legitimate bbox, variable, period and preset meanings; normalize conflicting old scene flags instead of blindly forwarding them. A source URL, screenshot or existing shared result must not become a broken link or silently analyze another question. Do not delete backend endpoints, raw data, evidence docs or team assets as “page cleanup.”

## Fix Piper without more inconsistent generations

Source inspection found scene selection in web/app/play/page.tsx switches among piper-fullbody-intro.png, piper-fullbody-thinking.png and piper-fullbody-discovery.png. The original consistent six-expression sheet still exists at web/public/mascot/piper-atlas-v1.png (1536x1024, 3 columns x 2 rows).

Inspect the assets visually first. Choose ONE canonical identity and use a single central expression-to-asset mapping, not scattered image paths. Prefer reusing the original atlas if it matches the chosen scene art; its row-major states are welcome, pointing, thinking, concerned, celebrating, listening. Keep scale/anchor/baseline stable when swapping expressions.

Do not mix the original atlas with a visually different full-body character. Do not reintroduce the detached hip-cut figure the owner rejected: integrate a cropped atlas sprite behind a foreground ship console if that composition works. If it cannot fit the approved full-body scene, use ONE existing full-body image consistently across every scene as the immediate fallback. Stable identity takes priority over switching between different people. Keep mismatched variants unused, not destructively deleted.

Do not generate each emotion independently. Further art spending requires owner approval. Any later approved variants must edit one canonical reference, preserving face geometry, hair, skin, hat, costume, proportions, lighting and style. Verify all poses side by side before wiring them in.

## Acceptance and bounded verification

1. Opening localhost:3000 lands in the game with exactly the shared three-link navigation; no duplicate header/footer directory.
2. One full mission works with retained coordinates and real evidence. Refresh and representative old links do not blank the scene or invent guesses.
3. Required handbook content is accounted for across About/Data and the external submission checklist; unknown submission items stay explicitly incomplete.
4. Piper keeps the same identity and stable placement through every scene. Capture a contact-sheet-style review or one screenshot per existing pose; do not spend generation tokens for this check.
5. At localhost:3000 verify health/data-management routes, live analysis, saved results, source off/on and master off/on. Never hide runtime errors with mocks. Keep the verified startup repair intact.
6. Check desktop and phone, run the appropriate checks and final production build once source is stable. Fix observed failures with focused checks; no repeated unchanged full-suite loops. Save concise evidence/screenshots and append at most ten lines to STATUS plus an AI_LOG entry.

Deliver a short report: consolidated screens/redirects, canonical Piper asset, checks that actually passed, remaining submission gaps. If blocked, record the concrete blocker and smallest next action. Do not claim a new art set, public authentication, uploaded dataset, deployment or submission item that was not delivered.

---
CODEX preparation completed 2026-11-14: reviewed current AppShell/Navbar/adventure source, route inventory, mascot filenames and supplied handbook mapping; wrote this implementation brief only. No app code changed, no fresh runtime/build claim, and no new images generated in this task. Antigravity owns the implementation above.
