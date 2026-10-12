import { D } from "./calculations.ts";

export interface ValuationInput {
  id: string;
  quantity: number | null;
  price: string | null;
}
export function valuePositions(inputs: ValuationInput[]) {
  const positions = inputs.map((input) => ({
    ...input,
    value:
      input.quantity === null || input.price === null
        ? null
        : D(input.quantity).mul(input.price).toFixed(2),
  }));
  const knownSubtotal = positions
    .reduce((sum, p) => (p.value === null ? sum : sum.plus(p.value)), D(0))
    .toFixed(2);
  const complete = positions.every((p) => p.value !== null);
  return {
    positions,
    knownSubtotal,
    total: complete ? knownSubtotal : null,
    complete,
  };
}
