import type { Context, Result, Money } from "./types.ts";
import { D, result, periodReturn, type ReturnSegment } from "./calculations.ts";
export interface FlowBoundary {
  at: string;
  before: Money;
  after: Money;
  flow: Money;
  timingProven: boolean;
  refs: string[];
}
export function strictTwr(
  start: Money,
  end: Money,
  boundaries: FlowBoundary[],
  continuous: boolean,
  c: Context,
): Result {
  const parts: Result[] = [];
  let previous = start;
  let from = c.from;
  let valid = continuous;
  const refs: string[] = [];
  for (const b of boundaries) {
    refs.push(...b.refs);
    if (
      !b.timingProven ||
      b.before === null ||
      b.after === null ||
      b.flow === null ||
      !D(b.before).plus(b.flow).eq(b.after) ||
      b.at < from ||
      b.at > c.asOf
    )
      valid = false;
    parts.push(
      periodReturn(
        {
          from,
          to: b.at,
          start: previous,
          end: b.before,
          flows: [],
          flowCoverage: true,
          continuous: valid,
          refs: b.refs,
        },
        c,
      ).rate,
    );
    previous = b.after;
    from = b.at;
  }
  parts.push(
    periodReturn(
      {
        from,
        to: c.asOf,
        start: previous,
        end,
        flows: [],
        flowCoverage: true,
        continuous: valid,
        refs,
      },
      c,
    ).rate,
  );
  const complete = valid && parts.every((p) => p.value !== null);
  return {
    ...result(
      c,
      "严格时间加权收益率",
      complete
        ? parts
            .reduce((a, p) => a.mul(D(p.value!).plus(1)), D(1))
            .minus(1)
            .toString()
        : null,
      refs,
      complete ? [] : ["资金时点估值或连续性不足"],
      null,
      "RATIO",
    ),
    components: parts,
    coverage: complete
      ? "COMPLETE"
      : parts.some((p) => p.value !== null)
        ? "PARTIAL"
        : "UNAVAILABLE",
  };
}

export interface DatedFlow {
  date: string;
  amount: Money;
  refs: string[];
}

const dayCount = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );

/** Account-signed flows (deposit +, withdrawal −) plus a known ending value. */
export function xirr(
  flows: DatedFlow[],
  end: Money,
  flowCoverage: boolean,
  c: Context,
): Result {
  const refs = flows.flatMap((flow) => flow.refs);
  const known = flows.every((flow) => flow.amount !== null);
  const ordered = [...flows].sort((a, b) => a.date.localeCompare(b.date));
  if (!flowCoverage || !known || end === null || ordered.length === 0) {
    return {
      ...result(
        c,
        "资金加权内部收益率",
        null,
        refs,
        [
          ...(!flowCoverage ? ["外部流完备断言不足"] : []),
          ...(!known ? ["外部流金额存在未知字段"] : []),
          ...(end === null ? ["缺少期末估值"] : []),
          ...(ordered.length === 0 ? ["没有外部流"] : []),
        ],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  const investor: Array<{ date: string; amount: ReturnType<typeof D> }> =
    ordered.map((flow) => ({ date: flow.date, amount: D(flow.amount!).neg() }));
  investor.push({ date: c.asOf, amount: D(end) });
  const origin = investor[0]!.date;
  const npv = (rate: ReturnType<typeof D>) =>
    investor.reduce((sum, item) => {
      const years = D(dayCount(origin, item.date)).div(365);
      return sum.plus(item.amount.div(D(1).plus(rate).pow(years)));
    }, D(0));
  const signs = new Set(
    investor.map((item) =>
      item.amount.gt(0) ? 1 : item.amount.lt(0) ? -1 : 0,
    ),
  );
  if (!signs.has(1) || !signs.has(-1)) {
    return {
      ...result(
        c,
        "资金加权内部收益率",
        null,
        refs,
        ["现金流没有符号变化，内部收益率无解"],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  let lo = D("-0.9999");
  let hi = D("10");
  let nLo = npv(lo);
  let nHi = npv(hi);
  if (nLo.times(nHi).gt(0)) {
    return {
      ...result(
        c,
        "资金加权内部收益率",
        null,
        refs,
        ["内部收益率在可接受区间内无解"],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  for (let i = 0; i < 80; i++) {
    const mid = lo.plus(hi).div(2);
    const nMid = npv(mid);
    if (nMid.abs().lt("1e-12")) {
      lo = mid;
      hi = mid;
      break;
    }
    if (nLo.times(nMid).lte(0)) {
      hi = mid;
      nHi = nMid;
    } else {
      lo = mid;
      nLo = nMid;
    }
  }
  return result(
    c,
    "资金加权内部收益率",
    lo.plus(hi).div(2).toString(),
    refs,
    [],
    null,
    "RATIO",
  );
}

export function modifiedDietz(
  start: Money,
  end: Money,
  flows: DatedFlow[],
  flowCoverage: boolean,
  c: Context,
): Result {
  const refs = flows.flatMap((flow) => flow.refs);
  const known = flows.every((flow) => flow.amount !== null);
  if (!flowCoverage || !known || start === null || end === null) {
    return {
      ...result(
        c,
        "修正 Dietz 收益率",
        null,
        refs,
        [
          ...(!flowCoverage ? ["外部流完备断言不足"] : []),
          ...(!known ? ["外部流金额存在未知字段"] : []),
          ...(start === null || end === null ? ["缺少期初或期末估值"] : []),
        ],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  const days = dayCount(c.from, c.asOf);
  if (days <= 0) {
    return {
      ...result(
        c,
        "修正 Dietz 收益率",
        null,
        refs,
        ["收益窗口天数无效"],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  const net = flows.reduce((sum, flow) => sum.plus(flow.amount!), D(0));
  const weighted = flows.reduce((sum, flow) => {
    const remaining = D(dayCount(flow.date, c.asOf));
    return sum.plus(D(flow.amount!).times(remaining).div(days));
  }, D(0));
  const denominator = D(start).plus(weighted);
  if (denominator.lte(0)) {
    return {
      ...result(
        c,
        "修正 Dietz 收益率",
        null,
        refs,
        ["Dietz 分母为零或负权益，拒绝计算"],
        null,
        "RATIO",
      ),
      coverage: "UNAVAILABLE",
    };
  }
  return result(
    c,
    "修正 Dietz 收益率",
    D(end).minus(start).minus(net).div(denominator).toString(),
    refs,
    [],
    null,
    "RATIO",
  );
}
