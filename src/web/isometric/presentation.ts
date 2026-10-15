import type { DemoModel } from "../../application/isometric.ts";
export type { DemoModel } from "../../application/isometric.ts";
import Decimal from "decimal.js";

export const money = (value: string | null | undefined) =>
  value == null
    ? "—"
    : new Decimal(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export function projectWorld(model: DemoModel) {
  const max = Math.max(1, ...model.holdings.map((p) => Number(p.value ?? 0)));
  return {
    holdings: model.holdings.map((p) => ({
      ...p,
      value: { value: p.value },
      height:
        p.value == null
          ? 65
          : 45 + 95 * Math.sqrt(Math.max(0, Number(p.value)) / max),
    })),
  };
}
