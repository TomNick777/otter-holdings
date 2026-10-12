import test from "node:test";
import assert from "node:assert/strict";
import {
  accounts,
  history,
  instruments,
  quoteAt,
} from "../src/simulation/scenario.ts";
import {
  accountSnapshot,
  accountSeries,
} from "../src/application/portfolio.ts";
import { D } from "../src/domain/calculations.ts";

test("all six accounts reconcile their displayed positions to the domain subtotal", () => {
  for (const a of accounts) {
    const v = accountSnapshot(a.id, history.asOf);
    assert.equal(
      v.total,
      v.positions.reduce((n, p) => n.plus(p.value!), D(0)).toFixed(2),
    );
    for (const p of v.positions)
      assert.equal(p.value, D(p.quantity!).mul(p.price!).toFixed(2));
  }
});
test("all market prices are deterministic simulation and preserve effective-day values", () => {
  for (const a of instruments) {
    const p = quoteAt(a.id, history.asOf);
    assert.equal(p, quoteAt(a.id, history.asOf));
    assert(Number(p) > 0);
    assert.equal(
      accountSnapshot(a.accountId, history.asOf).positions.find(
        (h) => h.id === a.id,
      )!.price,
      p,
    );
  }
});
test("daily historical charts and current snapshots share one financial output", () => {
  for (const a of accounts) {
    const series = accountSeries(a.id);
    assert.equal(series[0]!.date, history.baseline.date);
    assert.equal(
      series.at(-1)!.value,
      accountSnapshot(a.id, history.asOf).total,
    );
    assert(series.every((p) => p.value !== null));
  }
});
test("the scenario includes deliberate exit and re-entry without deriving trades from prices", () => {
  assert.equal(history.provenance, "DEMO");
  assert.equal(
    accountSnapshot("broker", history.asOf).positions.find(
      (p) => p.id === "consumer",
    )!.quantity,
    0,
  );
  assert.equal(
    accountSnapshot("global", "2025-09-15").positions.find(
      (p) => p.id === "multi",
    )!.quantity,
    0,
  );
  assert.equal(
    accountSnapshot("global", "2025-09-19").positions.find(
      (p) => p.id === "multi",
    )!.quantity,
    700,
  );
});
