import test from "node:test";
import assert from "node:assert/strict";
import { valuePositions } from "../src/domain/valuation.ts";
import { xirr, modifiedDietz, strictTwr } from "../src/domain/returns.ts";
import { periodReturn } from "../src/domain/calculations.ts";
import type { Context } from "../src/domain/types.ts";

const c: Context = {
  scope: {
    portfolioId: "synthetic",
    membershipVersion: 1,
    accountIds: ["demo"],
    currency: "CNY",
  },
  from: "2024-01-01",
  asOf: "2024-12-31",
  knowledgeCutoff: "2024-12-31",
  dataRevision: 1,
};
test("decimal valuations preserve cents and distinguish unknown from known zero", () => {
  const v = valuePositions([
    { id: "a", quantity: 3, price: ".1" },
    { id: "b", quantity: 0, price: "100" },
  ]);
  assert.equal(v.total, "0.30");
  assert.equal(v.positions[1]!.value, "0.00");
  const partial = valuePositions([
    { id: "a", quantity: 3, price: ".1" },
    { id: "b", quantity: null, price: "100" },
  ]);
  assert.equal(partial.total, null);
  assert.equal(partial.knownSubtotal, "0.30");
  assert.equal(partial.positions[1]!.value, null);
});
test("missing quote is unavailable even when a known subtotal exists", () => {
  const v = valuePositions([{ id: "a", quantity: 10, price: null }]);
  assert.equal(v.total, null);
  assert.equal(v.complete, false);
});
test("XIRR solves an authored one-year investment and does not mutate flows", () => {
  const flows = [{ date: c.from, amount: "1000", refs: ["simulation"] }];
  const before = JSON.stringify(flows);
  assert(Math.abs(Number(xirr(flows, "1100", true, c).value) - 0.1) < 1e-9);
  assert.equal(JSON.stringify(flows), before);
});
test("XIRR requires complete flows, known amounts and an ending valuation", () => {
  assert.equal(
    xirr([{ date: c.from, amount: "1000", refs: [] }], "1100", false, c).value,
    null,
  );
  assert.equal(
    xirr([{ date: c.from, amount: null, refs: [] }], "1100", true, c).value,
    null,
  );
  assert.equal(
    xirr([{ date: c.from, amount: "1000", refs: [] }], null, true, c).value,
    null,
  );
});
test("XIRR rejects cash flows without a sign change", () => {
  assert.equal(
    xirr([{ date: c.from, amount: "-1000", refs: [] }], "1100", true, c).value,
    null,
  );
});
test("Dietz respects dated external flows and rejects zero or negative equity", () => {
  assert.equal(modifiedDietz("1000", "1100", [], true, c).value, "0.1");
  assert.equal(modifiedDietz("0", "0", [], true, c).value, null);
  assert.equal(
    modifiedDietz(
      "0",
      "10",
      [{ date: c.from, amount: "-100", refs: [] }],
      true,
      c,
    ).value,
    null,
  );
});
test("period profit removes deposits but a flowed period is not a no-flow return", () => {
  const r = periodReturn(
    {
      from: c.from,
      to: c.asOf,
      start: "1000",
      end: "1600",
      flows: ["500"],
      flowCoverage: true,
      continuous: true,
      refs: [],
    },
    c,
  );
  assert.equal(r.profit.value, "100");
  assert.equal(r.rate.value, null);
});
test("strict TWR requires proven before/after valuations at cash-flow boundaries", () => {
  const good = {
    at: "2024-06-01",
    before: "1100",
    after: "1600",
    flow: "500",
    timingProven: true,
    refs: [],
  };
  assert(
    Math.abs(Number(strictTwr("1000", "1760", [good], true, c).value) - 0.21) <
      1e-9,
  );
  assert.equal(
    strictTwr("1000", "1760", [{ ...good, timingProven: false }], true, c)
      .value,
    null,
  );
});
