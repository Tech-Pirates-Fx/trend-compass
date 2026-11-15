import type { AnalyzeRequest, AnalyzeResponse, BoundingBox } from "../../../lib/types";

export type Station = "board" | "archive" | "evidence" | "report" | "complete";
export type WindowKind = "short" | "long";
export type Conclusion = "rising" | "falling" | "not_significant" | "inconclusive";
export interface Receipt { query: AnalyzeRequest; result: AnalyzeResponse; acquired: string }
export interface CaseState {
  station: Station;
  evidence: Partial<Record<WindowKind, Receipt>>;
  pinned: WindowKind[];
  sourceRead: boolean;
  comparison: boolean;
  feedback: string;
}
export const initialCase: CaseState = { station: "board", evidence: {}, pinned: [], sourceRead: false, comparison: false, feedback: "" };
export type CaseAction =
  | { type: "visit"; station: Station }
  | { type: "receive"; kind: WindowKind; receipt: Receipt }
  | { type: "pin"; kind: WindowKind }
  | { type: "source" }
  | { type: "compare"; answer: string }
  | { type: "submit"; conclusion: string; magnitude: string; limitation: string }
  | { type: "reset" };

export function expectedConclusion(result: AnalyzeResponse): Conclusion {
  if (result.summary.verdict === "inconclusive") return "inconclusive";
  if (result.summary.verdict === "not_significant") return "not_significant";
  return result.summary.rate_per_decade > 0 ? "rising" : "falling";
}
export function matchesReceipt(query: AnalyzeRequest, result: AnalyzeResponse): boolean {
  const dates = result.raw_timeseries.map(p => p.t.slice(0, 7)).sort();
  return !result.is_mock && result.provenance?.verified === true &&
    result.variable.id === query.variable_id && result.resolution === query.resolution &&
    result.deseasonalize_applied === Boolean(query.deseasonalize) &&
    dates[0] === query.start && dates[dates.length - 1] === query.end &&
    (["south", "north", "west", "east"] as (keyof BoundingBox)[]).every(k => result.bbox[k] === query.bbox[k]);
}
export function readyToReport(state: CaseState): boolean {
  return state.pinned.includes("short") && state.pinned.includes("long") && state.sourceRead && state.comparison;
}
export function caseReducer(state: CaseState, action: CaseAction): CaseState {
  if (action.type === "reset") return { ...initialCase, evidence: {}, pinned: [] };
  if (state.station === "complete" && action.type !== "visit") return state;
  switch (action.type) {
    case "visit":
      if (action.station === "complete") return state;
      if (action.station === "report" && !readyToReport(state)) return { ...state, feedback: "Pin both records, inspect their source and compare their limits before writing the report." };
      return { ...state, station: action.station, feedback: "" };
    case "receive": {
      if (!matchesReceipt(action.receipt.query, action.receipt.result)) return { ...state, feedback: "This receipt does not match the requested observation. Retry the archive." };
      const other = state.evidence[action.kind === "short" ? "long" : "short"];
      const q = action.receipt.query;
      if (other && (q.end !== other.query.end || (action.kind === "short" ? q.start <= other.query.start : q.start >= other.query.start))) return { ...state, feedback: "Use the same end month and a longer comparison period." };
      return { ...state, evidence: { ...state.evidence, [action.kind]: action.receipt }, pinned: state.pinned.filter(k => k !== action.kind), sourceRead: false, comparison: false, feedback: "Record received. Inspect it, then pin it to your evidence board." };
    }
    case "pin": return state.evidence[action.kind] ? { ...state, pinned: Array.from(new Set([...state.pinned, action.kind])), feedback: "Evidence pinned." } : state;
    case "source": return Object.keys(state.evidence).length ? { ...state, sourceRead: true, feedback: "Source receipt inspected." } : state;
    case "compare":
      if (state.pinned.length !== 2) return { ...state, feedback: "Pin both records first." };
      return action.answer === "limited" ? { ...state, comparison: true, feedback: "Comparison recorded: each result describes its own period; neither establishes a physical cause." } : { ...state, comparison: false, feedback: "A short period cannot establish the result for every longer period. Compare the dates and uncertainty, then revise." };
    case "submit": {
      if (!readyToReport(state) || !state.evidence.long) return { ...state, feedback: "Your evidence board is incomplete. Return to the archive." };
      const result = state.evidence.long.result;
      if (action.conclusion !== expectedConclusion(result)) return { ...state, feedback: "Your conclusion disagrees with the longer record's verdict or direction. Reopen that evidence and revise." };
      if (action.magnitude !== "measured") return { ...state, feedback: "Attach the measured rate and interval, rather than inferring a magnitude from the story." };
      if (action.limitation !== "regional") return { ...state, feedback: "This rectangular regional record does not establish a global result or the cause of change. Qualify your report." };
      return { ...state, station: "complete", feedback: "The archivist accepts your report. Both records and their limitations are now attached to the repaired ledger." };
    }
  }
}

export function restoreDraft(value: unknown): { station: Station; shortStart?: string; longStart?: string; end?: string } {
  if (!value || typeof value !== "object") return { station: "board" };
  const draft = value as Record<string, unknown>;
  if (draft.version !== 1) return { station: "board" };
  const month = (v: unknown) => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v) ? v : undefined;
  // Science is fetched again: a local draft can never grant evidence or completion.
  return { station: draft.station === "board" ? "board" : "archive", shortStart: month(draft.shortStart), longStart: month(draft.longStart), end: month(draft.end) };
}
