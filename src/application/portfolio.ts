import {
  accounts,
  history,
  instruments,
  quoteAt,
} from "../simulation/scenario.ts";
import { amount } from "../domain/calculations.ts";
import {
  changeLabel,
  holdingHeight,
  quantitiesAt,
  type CampusHistory,
  type sampleReplay,
} from "../domain/replay.ts";
import { valuePositions } from "../domain/valuation.ts";
import type { CityDistrict } from "./city-types.ts";

export function accountSnapshot(accountId: string, date: string) {
  const quantities = quantitiesAt(history, date);
  const catalog = instruments.filter((a) => a.accountId === accountId);
  const result = valuePositions(
    catalog.map((a) => ({
      id: a.id,
      quantity: quantities[a.id] ?? null,
      price: quoteAt(a.id, date),
    })),
  );
  const positions = result.positions.map((p) => ({
    ...catalog.find((a) => a.id === p.id)!,
    ...p,
  }));
  return {
    ...result,
    positions,
    date,
    account: accounts.find((a) => a.id === accountId)!,
  };
}

export function accountSeries(accountId: string) {
  const from = Date.parse(history.baseline.date + "T00:00:00Z");
  const end = Date.parse(history.asOf + "T00:00:00Z");
  const points = [];
  for (let day = from; day <= end; day += 86400000) {
    const date = new Date(day).toISOString().slice(0, 10);
    points.push({ date, value: accountSnapshot(accountId, date).total });
  }
  return points;
}

/** Pure scene projection: heights depend on quantities, never on market prices. */
export function cityDistricts(
  sample: ReturnType<typeof sampleReplay>,
  supplied: CampusHistory = history,
): CityDistrict[] {
  return accounts.map((account) => {
    const catalog = supplied.holdings.filter((h) => h.accountId === account.id);
    const assets = catalog.flatMap((h) => {
      const before = sample.before[h.id] ?? null;
      const after = sample.after[h.id] ?? null;
      if (before === null || after === null || (!before && !after)) return [];
      const presence =
        before === 0 ? sample.mix : after === 0 ? 1 - sample.mix : 1;
      if (presence <= 0) return [];
      const height =
        before === 0
          ? holdingHeight(after, h.visualUnit)
          : after === 0
            ? holdingHeight(before, h.visualUnit)
            : holdingHeight(before, h.visualUnit) +
              (holdingHeight(after, h.visualUnit) -
                holdingHeight(before, h.visualUnit)) *
                sample.mix;
      return [
        {
          key: h.id,
          name: h.name,
          tone: h.tone,
          height,
          presence,
          held: after > 0,
          amount: `${after.toLocaleString("zh-CN")} ${h.unit}`,
          change: sample.changes.some((c) => c.holdingId === h.id)
            ? changeLabel(before, after)
            : undefined,
        },
      ];
    });
    const count = catalog.filter((h) => (sample.after[h.id] ?? 0) > 0).length;
    return {
      id: account.id,
      scope: account.group,
      name: account.name,
      total: `${count} 项持仓`,
      totalNumber: count,
      assets,
      assetSlots: catalog.map((h) => h.id),
    };
  });
}

export const formatMoney = (value: string | null) =>
  value === null
    ? "未知"
    : Number(amount(value)).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
