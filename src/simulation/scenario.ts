import type { CampusHistory } from "../domain/replay.ts";

/** Authored fiction. No external records, account numbers or real instrument codes. */
export const accounts = [
  { id: "broker", name: "山海证券", group: "山海证券", cash: "3200" },
  { id: "bank", name: "稳健账户", group: "松岚银行", cash: "4500" },
  { id: "retirement", name: "长远账户", group: "松岚银行", cash: "600" },
  { id: "funds", name: "基金账户", group: "林间基金", cash: "1800" },
  { id: "savings", name: "储蓄账户", group: "溪谷储蓄", cash: "5200" },
  { id: "global", name: "环球账户", group: "远洋投资", cash: "2100" },
] as const;

const catalog = [
  ["broad", "broker", "宽基指数", "glass", "18.4"],
  ["dividend", "broker", "红利策略", "stone", "24.2"],
  ["technology", "broker", "科技成长", "dark", "32.8"],
  ["consumer", "broker", "消费主题", "copper", "15.6"],
  ["balanced", "bank", "稳健组合", "stone", "12.5"],
  ["bond", "bank", "债券策略", "green", "8.6"],
  ["longterm", "retirement", "长期目标", "copper", "16.8"],
  ["reserve", "retirement", "安心储备", "stone", "10.1"],
  ["world", "funds", "世界指数", "glass", "21.6"],
  ["active", "funds", "主动权益", "stone", "14.2"],
  ["deposit", "savings", "定期储蓄", "green", "10"],
  ["overseas", "global", "海外权益", "dark", "28.5"],
  ["multi", "global", "多元资产", "copper", "17.3"],
] as const;

export const instruments = catalog.map(
  ([id, accountId, name, tone, price], index) => ({
    id,
    accountId,
    name,
    tone,
    price,
    index,
    unit: "份",
    visualUnit: 600,
  }),
);

export const history: CampusHistory = {
  asOf: "2025-09-20",
  provenance: "DEMO",
  holdings: instruments,
  baseline: {
    date: "2025-01-01",
    quantities: {
      broad: 900,
      dividend: 500,
      technology: 0,
      consumer: 700,
      balanced: 1200,
      bond: 650,
      longterm: 400,
      reserve: 450,
      world: 750,
      active: 0,
      deposit: 1400,
      overseas: 650,
      multi: 500,
    },
  },
  changes: [
    { date: "2025-02-14", updates: [{ holdingId: "active", quantity: 800 }] },
    {
      date: "2025-03-12",
      updates: [{ holdingId: "technology", quantity: 450 }],
    },
    {
      date: "2025-05-08",
      updates: [
        { holdingId: "balanced", quantity: 1700 },
        { holdingId: "deposit", quantity: 1850 },
      ],
    },
    { date: "2025-06-18", updates: [{ holdingId: "broad", quantity: 1500 }] },
    { date: "2025-08-14", updates: [{ holdingId: "multi", quantity: 300 }] },
    {
      date: "2025-09-02",
      updates: [
        { holdingId: "broad", quantity: 2200 },
        { holdingId: "longterm", quantity: 850 },
      ],
    },
    { date: "2025-09-06", updates: [{ holdingId: "consumer", quantity: 0 }] },
    { date: "2025-09-11", updates: [{ holdingId: "world", quantity: 500 }] },
    { date: "2025-09-15", updates: [{ holdingId: "multi", quantity: 0 }] },
    {
      date: "2025-09-19",
      updates: [
        { holdingId: "multi", quantity: 700 },
        { holdingId: "technology", quantity: 950 },
      ],
    },
  ],
};

/** Deterministic synthetic quotes; independent of quantities and ending values. */
export function quoteAt(id: string, date: string): string | null {
  const asset = instruments.find((item) => item.id === id);
  if (!asset) return null;
  const days =
    (Date.parse(date + "T00:00:00Z") -
      Date.parse(history.baseline.date + "T00:00:00Z")) /
    86400000;
  const factor =
    id === "deposit"
      ? 1
      : 1 + days * 0.00025 + Math.sin(days / 17 + asset.index) * 0.045;
  return (Number(asset.price) * factor).toFixed(2);
}
