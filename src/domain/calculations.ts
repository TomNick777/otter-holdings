import Decimal from "decimal.js";
import type { Context, Money, Result } from "./types.ts";
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export const D = (x: string | number) => new Decimal(x);
export const amount = (x: Money) => (x === null ? "—" : D(x).toFixed(2));
export function result(
  c: Context,
  metric: string,
  value: Money,
  refs: string[],
  reasons: string[] = [],
  subtotal: Money = value,
  unit = "CNY",
  inputs: string[] = [],
  identity?: { method?: string; assumptions?: string[] },
): Result {
  const factId = [
    metric,
    c.scope.portfolioId,
    c.scope.membershipVersion,
    c.scope.accountIds.join(","),
    c.from,
    c.asOf,
    c.knowledgeCutoff,
    c.dataRevision,
  ]
    .map((x) => encodeURIComponent(String(x)))
    .join(":");
  return {
    factId,
    revision: 1,
    metric,
    unit,
    scope: c.scope,
    asOf: c.asOf,
    range: { from: c.from, to: c.asOf },
    dataRevision: c.dataRevision,
    knowledgeCutoff: c.knowledgeCutoff,
    value,
    knownSubtotal: subtotal,
    coverage:
      value !== null
        ? "COMPLETE"
        : subtotal !== null
          ? "PARTIAL"
          : "UNAVAILABLE",
    method: identity?.method ?? "calculated-v2.1",
    assumptions: identity?.assumptions ?? [],
    evidenceRefs: [...new Set(refs)],
    inputFactIds: inputs,
    missing: reasons,
    reasons,
    eligibility: { uses: value !== null ? ["DISPLAY"] : [], rejected: reasons },
  };
}
export interface ReturnSegment {
  from: string;
  to: string;
  start: Money;
  end: Money;
  flows: string[];
  flowCoverage: boolean;
  continuous: boolean;
  refs: string[];
}
export function periodReturn(
  s: ReturnSegment,
  c: Context,
): { profit: Result; rate: Result } {
  const ok =
    s.start !== null && s.end !== null && s.flowCoverage && s.continuous;
  const profit = ok
    ? D(s.end!)
        .minus(s.start!)
        .minus(s.flows.reduce((a, b) => D(a).plus(b).toString(), "0"))
        .toString()
    : null;
  const rate =
    ok && s.flows.every((x) => D(x).isZero()) && D(s.start!).gt(0)
      ? D(s.end!).div(s.start!).minus(1).toString()
      : null;
  const ctx = { ...c, from: s.from, asOf: s.to };
  return {
    profit: result(
      ctx,
      "区间净损益",
      profit,
      s.refs,
      profit === null ? ["端点、边界流或连续性不足"] : [],
    ),
    rate: result(
      ctx,
      "无流区间收益率",
      rate,
      s.refs,
      rate === null ? ["缺少无流证据或正权益起点"] : [],
      rate,
      "RATIO",
    ),
  };
}
