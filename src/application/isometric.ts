import { campuses as supplied } from "../simulation/isometric.ts";
import { valuePositions } from "../domain/valuation.ts";
export type { DemoModel } from "../simulation/isometric.ts";
export const campuses = supplied.map((model) => ({
  ...model,
  total: valuePositions([
    ...model.holdings.map((p) => ({
      id: p.assetId,
      quantity: 1,
      price: p.value,
    })),
    { id: "cash", quantity: 1, price: model.observation.cash },
  ]).total,
}));
