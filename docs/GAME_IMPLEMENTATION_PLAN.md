# Trend Compass: playable investigation campaigns

Status: EXECUTION STARTED — 2026-11-15. Joshua authorized CODEX to start in the follow-up chat. First Heat H1 checkpoint: `docs/HEAT_H1_DELIVERY.md`. Owner review still precedes campaign expansion.

## 1. What needs to change

READ (repository source): `web/components/game/types.ts`, `GameEngine.tsx`, `GameSceneManager.ts`, `MissionManager.ts`, `GameProgressManager.ts`, `NASAAnalysisManager.ts`, and `DiscoveryManager.ts`.

The present structure is a fixed six-level sequence: introduction → mode → destination → prediction → scan → celebration. Both expeditions use that sequence. A prediction starts the scan after a timer; the result is effectively the ending. Phaser supplies scene presentation, while React and singleton managers drive progression. This is a useful visual foundation, but the player has little to investigate or decide.

The implementation should turn this into an adventure about resolving disputed Earth-system claims. The player explores, gathers evidence, compares explanations, revises a claim, and submits a defensible report. NASA observations must be necessary to solve the case.

Preserve Piper, the space-pirate ship, interactive globe, existing art/audio, charts, exports, provenance, and judge access. Do not start another visual redesign or replace the engine as a prerequisite.

## 2. Recommended scope

Build two distinct campaigns first: **Heat: The Broken Heat Ledger** and **Rainfall: The Monsoon Message**. Each has three connected cases and a final synthesis. Deliver one complete Heat case as the approval checkpoint before expanding the engine or writing the remaining cases.

Target duration (design estimate, not measured): 6–10 minutes for the first case; 15–25 minutes per completed campaign. Judge mode remains a separate 60–90 second route to the four scientific answers and provenance.

Drought, biosphere and ocean campaigns remain future content until their actual datasets, ingestion, validation and appropriate mechanics exist. Do not add decorative locked modes as a substitute for finishing the two playable campaigns.

## 3. Shared adventure loop

Ship case board → receive a short disputed report → select an investigation site → explore an interactive evidence scene → choose and perform an analysis → pin evidence → challenge an explanation → submit a claim with supporting evidence and limitations → see the story consequence → return to the ship with the next lead.

Each case must contain at least three substantive actions beyond dialogue and navigation. Actions change the evidence available, the analysis requested, the claim submitted, or the next investigation. Clicking through Piper lines is not an investigation task.

Piper introduces the immediate objective, gives contextual hints, and reacts to what the player actually did. Normal guidance is one or two short lines; additional explanation is optional. Dialogue can be skipped, but required evidence tasks remain. The ship board always shows the current objective and next available actions.

## 4. Heat campaign — The Broken Heat Ledger

Premise: a fictional ship archivist has received conflicting reports about a region. The crew needs an evidence-backed entry in its Earth atlas. Characters and incidents are explicitly fictional; measurements remain real and unchanged.

### Case H1: One hot year, or a changing record?

1. On the globe, choose one of the supported case destinations. Enter a scene with a disputed report, an archive terminal and an evidence board.
2. At the terminal, inspect a real short-window chart. Mark what it supports and what remains unknown; do not require a predetermined rising result.
3. Expand to an available longer record using visible date controls. The chart and analysis request must actually change.
4. Pin the short- and long-window evidence cards. Inspect rate, interval, coverage and the returned significance verdict.
5. Assemble a report: direction, magnitude, uncertainty and one limitation. Evidence cards must support the selected statements.
6. The archivist accepts a supported report or identifies a specific missing/contradictory piece. The player can return to the terminal and revise without restarting.

Primary mechanic: manipulate the time window and reconcile evidence. A correct guess at the start cannot complete the case.

### Case H2: Two destinations, two records

Investigate a second supported region, select comparable periods and place both evidence cards on a comparison board. Correctly distinguish regional results from global conclusions. If trends are similar, that is a valid outcome; never promise opposing trends. Unlock a new atlas entry after a supported comparison.

### Case H3: Repair the atlas

Use the preceding case evidence to correct an overconfident fictional dispatch. Select which claims to retain, qualify or reject, attach sources, and deliver the campaign report. The ending reflects the quality and limitations of the report, not whether it says warming or cooling.

## 5. Rainfall campaign — The Monsoon Message

Premise: two fictional dispatches disagree: one points to a wet month, the other claims a long-term change in rainfall. The player must determine what the available precipitation record can establish.

### Case R1: Decode the calendar

Explore a communications deck containing monthly record tiles and an archive station. Inspect actual monthly precipitation values, compare corresponding months or a supported seasonal view, and separate seasonal variation from a claim about a trend. Build a calendar evidence card from the chosen comparison.

Primary mechanic: align months/seasons and interpret a precipitation record. This must not reuse Heat's time-window puzzle with blue styling.

### Case R2: Trace the disputed dispatch

Select two supported geographic boxes, compare rainfall evidence over a common period and inspect coverage/resolution. Attach the actual bounding boxes to the report. Basin-named presets must disclose rectangular selections unless real basin masks are implemented. Do not imply observations show river discharge or flood depth.

### Case R3: Send a responsible warning

Construct a message distinguishing the measured precipitation trend from claims that need additional evidence. The player may conclude wetter, drier, no statistically significant trend, or inconclusive, as supported by the returned result. The final challenge includes rejecting an unsupported claim that monthly precipitation alone proves a particular flood or predicts an imminent flood.

Until additional suitable data are validated, present the playable mode as **Rainfall Investigation**. “Flood” may describe the fictional question being investigated, with an explicit limit on what the observations establish. No flood-control simulator, real-time radar, inundation prediction or invented lives-saved counter.

## 6. Consequences, progression and replay

- Evidence inventory: cards retain query, region, dates, units, source, result and observation coverage. Players inspect and cite them instead of collecting arbitrary coins.
- Branching: a missing source returns the player to the archive; incompatible periods reopen comparison; unsupported certainty prompts a limitation task; a supported report unlocks the next lead. Branches alter tasks and dialogue, never scientific values.
- Progress: case completion, atlas entries and investigation skills persist. Reward inspecting a source, making a valid comparison and revising a claim. Equal completion credit for supported significant, non-significant and inconclusive conclusions.
- Failure/recovery: case submissions can be revised; service failure pauses analysis and offers retry or an explicitly labelled matching saved case. No timer penalizes reading, accessibility needs or network delay.
- Replay: another supported destination or period yields a new evidence investigation. Do not advertise region-specific story writing unless it is actually authored. A new destination alone is not a new story.
- Campaign finale: compare completed reports and state what the combined evidence supports. Completion returns to a changed ship board with recorded discoveries and optional unfinished cases.

## 7. Architecture to implement

Replace the numeric level as the authority for gameplay with a typed campaign/case/objective state machine. Existing scenes can remain presentation shells during migration.

Proposed structure under `web/components/game/`:

| Module | Responsibility |
| --- | --- |
| `content/campaigns/heat.ts`, `rainfall.ts` | Authored chapters, dialogue, objectives, branching and endings |
| `domain/types.ts` | Campaign, case, objective, action, evidence, submission and save types |
| `domain/reducer.ts` | Pure state transitions; reject actions whose prerequisites are unmet |
| `domain/objectives.ts` | Evidence/comparison/submission rules; no checks of guessed story outcomes |
| `runtime/GameProvider.tsx` | One session state owner and subscriptions |
| `runtime/analysisService.ts` | Existing API integration, cancellation, exact cache matching and provenance |
| `runtime/saveRepository.ts` | Versioned local save, migration, reset and recovery |
| `activities/` | Time-window terminal, calendar comparison, geographic comparison and report assembly |
| `ui/` | Ship board, objective tracker, evidence inventory and accessible activity controls |

Data flow: player action → validated state transition → optional analysis request → evidence receipt → objective evaluation → narrative transition → saved checkpoint. React owns interaction/state; Phaser renders environments and effects from that state. Phaser callbacks must not independently grant progress or alter the scientific result.

Keep the existing API schemas unless an activity requires genuinely new data. Use a frontend evidence wrapper around the unchanged `AnalyzeResponse`. Audit actual chart/seasonal capabilities before implementing the rainfall calendar; if additional monthly access or statistically appropriate analysis is required, make it an explicit backend deliverable rather than faking the interaction.

Each analysis request carries a request ID and complete immutable query. Discard stale results after destination changes or restart; prevent duplicate awards and submissions. Store evidence identity with dataset/version/query, not a human-readable destination name. A response for one region/date range must never satisfy another objective.

Save campaign/case/objective IDs, collected evidence references, completed submissions, preferences and schema version. Revalidate or clearly identify historical science on resume; never silently represent an old receipt as a fresh computation. No accounts or cloud synchronization in this scope.

## 8. Scientific and content prerequisites

READ: current analysis manager hardcodes 2000–2020, uses radar/live-connection language and artificial scan delays. Current outcome logic treats every non-significant verdict alike and sometimes claims natural variability was confirmed. These are source-review findings, not a new runtime/data audit.

Before authoring result-dependent stories:

1. Validate GISTEMP and the newly reported GPCP inputs against existing provenance receipts, actual data coverage and independent checks. STATUS claims of completion are not independent verification. Check NASA hosting/source compliance for GPCP under the playbook; record any unresolved provenance gap before enabling its campaign.
2. Derive available dates and dataset availability from the catalog. Author case periods explicitly within that coverage and label why each comparison is used; remove universal hardcoded dates.
3. Handle significant, non-significant, inconclusive, missing-data and failure states separately. Non-significance does not prove no change or establish its cause. Significance does not by itself establish causality.
4. Describe archive analysis accurately. Decorative radar, ship instruments and characters are fictional presentation; telemetry describes actual loading/computation/cache events.
5. Audit rainfall seasonality and test suitability before scoring trend interpretations. Name the actual returned statistical method. Never tune regions/windows until a desired story outcome appears.
6. Clearly distinguish saved verified results from a new backend computation. Only exact compatible queries may use a cache. Preserve data-control restrictions and expose unavailable destinations honestly.

## 9. Delivery sequence and gates

| Phase | Deliverable | Done when |
| --- | --- | --- |
| P0: evidence/content contract | Verify data capabilities; write H1 script, objective graph and all outcome variants | Every required observation is available, or its blocker is recorded; no invented result needed |
| P1: gameplay foundation | State machine, evidence receipts, objective validation, analysis lifecycle, versioned saves | Progress cannot bypass required tasks; restart/resume and stale-response handling work |
| P2: complete Heat H1 | Playable exploration, terminal, evidence board, report and consequence | A player completes the case through at least three evidence actions; revision works; no auto-ending after prediction |
| Owner checkpoint | Review the complete H1 slice | Joshua accepts the gameplay direction before the remaining campaign work |
| P3: Heat campaign | H2, H3, ship progression and finale | Three connected cases; comparisons and endings handle real outcomes |
| P4: Rainfall campaign | Calendar activity, geographic comparison and responsible dispatch | Different mechanics and story; validated precipitation support; no flood-prediction claims |
| P5: delivery review | Accessibility, performance, judge route, source/AI credits, usability evidence | Required checks pass and limitations are documented |

Do not estimate a calendar deadline until the executor checks data readiness and finishes H1. If time is limited, ship a complete Heat campaign and one complete Rainfall case with the remaining scope clearly stated; do not label that a completed two-campaign release.

## 10. Acceptance and verification

- After a prediction, the player still has evidence work and a report to complete. There is no automatic path from selecting a card to campaign completion.
- Heat and Rainfall differ in premise, investigation activity, evidence comparison and finale, not just dialogue and colours.
- Every case has visible objectives, at least three substantive evidence actions, contextual feedback and a revisable submission.
- Required tasks cannot be skipped through menus, duplicate clicks, stale callbacks or restored state. Repeating a scan cannot farm rewards.
- Result-dependent text handles positive/negative slopes, non-significant and inconclusive results accurately; missing evidence cannot produce success.
- Live and matching saved results retain exact region/date/source receipts; mismatched caches fail clearly. Disabled data sources remain disabled.
- Keyboard-only play covers every activity; no essential drag-only interaction. Reduced motion, mute, phone layout, readable evidence and unobscured Piper controls remain available.
- Automated checks focus on transition prerequisites, evidence matching, all scientific verdict branches, save migration and async races. Browser flows cover one full case per campaign, revision, resume, unavailable service and matching saved fallback. Run the full relevant suite and production build at the delivery gate; save actual output.
- Usability target: five non-expert players attempt the first case without spoken coaching. Record completion, where they stall, whether they can explain their conclusion and whether they distinguish rainfall from flood risk. These are proposed checks, not completed results.

## 11. Approval boundary

Recommended approval: two campaigns, three cases each, delivered through a complete Heat H1 checkpoint; preserve the current visual identity and existing engine. Defer new data domains, multiplayer, accounts and physical-disaster simulation.

Joshua chooses the executor separately after reviewing this plan. Approval of the plan alone does not assign execution, authorize implementation, or authorize commits, pushes, deployment or publication.
