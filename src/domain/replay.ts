/** Presentation contract: quantities are supplied snapshots, never inferred from valuation. */
export interface CampusHolding {
  id: string;
  accountId: string;
  name: string;
  tone: string;
  unit: string;
  /** Fixed per-instrument display calibration; unaffected by quotes or other holdings. */
  visualUnit: number;
}
export interface HoldingChange {
  holdingId: string;
  /** null means the quantity is not known; it is never treated as zero. */
  quantity: number | null;
}
export interface CampusSnapshot {
  date: string;
  quantities: Record<string, number | null>;
}
export interface CampusHistory {
  asOf: string;
  baseline: CampusSnapshot;
  holdings: CampusHolding[];
  changes: { date: string; updates: HoldingChange[] }[];
  provenance: "DEMO" | "SOURCE" | "RULE_RECONSTRUCTED";
}
export interface ReplaySegment {
  fromDate: string;
  date: string;
  start: number;
  end: number;
  kind: "travel" | "change";
  before: Record<string, number | null>;
  after: Record<string, number | null>;
  changes: HoldingChange[];
}
export interface CampusReplay {
  startDate: string;
  endDate: string;
  duration: number;
  segments: ReplaySegment[];
  initial: Record<string, number | null>;
  final: Record<string, number | null>;
}
const day = (date: string) => Date.parse(date + "T00:00:00Z");
function validateHistory(history: CampusHistory) {
  const ids = new Set(history.holdings.map((h) => h.id));
  if (ids.size !== history.holdings.length)
    throw new Error("Duplicate holding identity");
  for (const holding of history.holdings) {
    const quantity = history.baseline.quantities[holding.id];
    if (quantity === undefined) throw new Error("Opening quantity unavailable");
    if (quantity !== null && (!Number.isFinite(quantity) || quantity < 0))
      throw new Error("Invalid opening quantity");
    if (!Number.isFinite(holding.visualUnit) || holding.visualUnit <= 0)
      throw new Error("Invalid visual scale");
  }
  for (const change of history.changes) {
    if (change.date < history.baseline.date || change.date > history.asOf)
      throw new Error("Change outside supplied history");
    for (const update of change.updates) {
      if (
        !ids.has(update.holdingId) ||
        (update.quantity !== null &&
          (!Number.isFinite(update.quantity) || update.quantity < 0))
      )
        throw new Error("Invalid holding update");
    }
  }
}
export function quantitiesAt(history: CampusHistory, date: string) {
  validateHistory(history);
  if (date < history.baseline.date || date > history.asOf)
    throw new Error("Date outside supplied history");
  const result = { ...history.baseline.quantities };
  for (const change of [...history.changes].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    if (change.date > date) break;
    for (const update of change.updates)
      result[update.holdingId] = update.quantity;
  }
  return result;
}
export function buildReplay(
  history: CampusHistory,
  period: "month" | "year",
): CampusReplay {
  const startDate =
    history.asOf.slice(0, period === "month" ? 7 : 4) +
    (period === "month" ? "-01" : "-01-01");
  if (startDate < history.baseline.date)
    throw new Error("Period opening holdings unavailable");
  validateHistory(history);
  // A midnight opening excludes changes on the first day; those must still play.
  let quantities = { ...history.baseline.quantities };
  const grouped = new Map<string, HoldingChange[]>();
  for (const change of [...history.changes].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    if (change.date < startDate)
      for (const update of change.updates)
        quantities[update.holdingId] = update.quantity;
    else
      grouped.set(change.date, [
        ...(grouped.get(change.date) ?? []),
        ...change.updates,
      ]);
  }
  const initial = { ...quantities };
  const segments: ReplaySegment[] = [];
  let cursor = 0,
    previousDate = startDate;
  const travel = (date: string) => {
    if (date === previousDate) return;
    const duration = Math.min(
      1300,
      450 + ((day(date) - day(previousDate)) / 86400000) * 12,
    );
    segments.push({
      fromDate: previousDate,
      date,
      start: cursor,
      end: cursor + duration,
      kind: "travel",
      before: quantities,
      after: quantities,
      changes: [],
    });
    cursor += duration;
    previousDate = date;
  };
  for (const [date, updates] of grouped) {
    const after = { ...quantities };
    for (const update of updates) after[update.holdingId] = update.quantity;
    const changes = Object.keys(after)
      .filter((id) => quantities[id] !== after[id])
      .map((holdingId) => ({ holdingId, quantity: after[holdingId] ?? null }));
    if (!changes.length) continue;
    travel(date);
    segments.push({
      fromDate: date,
      date,
      start: cursor,
      end: cursor + 2000,
      kind: "change",
      before: quantities,
      after,
      changes,
    });
    cursor += 2000;
    quantities = after;
  }
  travel(history.asOf);
  return {
    startDate,
    endDate: history.asOf,
    duration: cursor,
    segments,
    initial,
    final: quantities,
  };
}
export function sampleReplay(replay: CampusReplay, elapsed: number) {
  const segment = replay.segments.find((s) => elapsed < s.end);
  if (!segment)
    return {
      date: replay.endDate,
      before: replay.final,
      after: replay.final,
      mix: 1,
      changes: [] as HoldingChange[],
    };
  const fraction = Math.max(
    0,
    Math.min(1, (elapsed - segment.start) / (segment.end - segment.start)),
  );
  // First 75% morphs, remaining time holds the completed event for reading.
  const t = Math.min(1, fraction / 0.75);
  const mix = t * t * (3 - 2 * t);
  const date =
    segment.kind === "travel"
      ? new Date(
          day(segment.fromDate) +
            Math.floor(
              ((day(segment.date) - day(segment.fromDate)) / 86400000) *
                fraction,
            ) *
              86400000,
        )
          .toISOString()
          .slice(0, 10)
      : segment.date;
  return {
    date,
    before: segment.before,
    after: segment.after,
    mix: segment.kind === "change" ? mix : 1,
    changes: segment.changes,
  };
}
export function holdingHeight(quantity: number, visualUnit: number) {
  return quantity <= 0 ? 0 : 28 + 55 * Math.log2(1 + quantity / visualUnit);
}
export function changeLabel(before: number | null, after: number | null) {
  if (before === null) return after === null ? "数量未知" : "数量开始可用";
  if (after === null) return "数量暂不可用";
  return before === 0
    ? "建仓"
    : after === 0
      ? "清仓"
      : after > before
        ? "增持"
        : "减持";
}
