import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReplay,
  quantitiesAt,
  sampleReplay,
  holdingHeight,
  type CampusHistory,
} from "../src/domain/replay.ts";
import { history } from "../src/simulation/scenario.ts";
import { cityDistricts } from "../src/application/portfolio.ts";

test("month and year replay end at the explicitly supplied final quantities", () => {
  for (const period of ["month", "year"] as const) {
    const replay = buildReplay(history, period);
    assert.deepEqual(replay.final, quantitiesAt(history, history.asOf));
    assert.deepEqual(sampleReplay(replay, replay.duration).after, replay.final);
  }
});
test("first-day changes play after the period opening instead of vanishing", () => {
  const h: CampusHistory = {
    asOf: "2025-09-03",
    provenance: "DEMO",
    holdings: [
      {
        id: "a",
        accountId: "broker",
        name: "Synthetic",
        tone: "glass",
        unit: "份",
        visualUnit: 100,
      },
    ],
    baseline: { date: "2025-01-01", quantities: { a: 100 } },
    changes: [
      { date: "2025-09-01", updates: [{ holdingId: "a", quantity: 250 }] },
    ],
  };
  const replay = buildReplay(h, "month");
  assert.equal(replay.initial.a, 100);
  assert.equal(replay.segments.find((s) => s.kind === "change")!.after.a, 250);
});
test("exit and re-entry preserve the catalog and lot identity", () => {
  const slot = history.holdings.find((h) => h.id === "multi")!;
  assert.equal(quantitiesAt(history, "2025-09-15").multi, 0);
  assert.equal(quantitiesAt(history, "2025-09-19").multi, 700);
  const final = quantitiesAt(history, history.asOf);
  const scene = cityDistricts({
    date: history.asOf,
    before: final,
    after: final,
    mix: 1,
    changes: [],
  });
  assert(
    scene.find((d) => d.id === slot.accountId)!.assetSlots.includes(slot.id),
  );
});
test("missing opening quantities are rejected, explicit unknown remains unknown", () => {
  const h = structuredClone(history);
  delete h.baseline.quantities.broad;
  assert.throws(() => buildReplay(h, "year"), /Opening quantity unavailable/);
  h.baseline.quantities.broad = null;
  assert.equal(quantitiesAt(h, h.baseline.date).broad, null);
});
test("invalid quantity and unknown instrument changes are rejected", () => {
  const h = structuredClone(history);
  h.changes.push({
    date: h.asOf,
    updates: [{ holdingId: "absent", quantity: 1 }],
  });
  assert.throws(() => buildReplay(h, "year"), /Invalid holding update/);
  h.changes.pop();
  h.baseline.quantities.broad = -1;
  assert.throws(() => quantitiesAt(h, h.asOf), /Invalid opening quantity/);
});
test("quantity geometry has a fixed per-instrument scale, independent of quotes", () => {
  assert.equal(holdingHeight(0, 600), 0);
  assert(holdingHeight(1200, 600) > holdingHeight(600, 600));
  const replay = buildReplay(history, "year");
  const sample = sampleReplay(replay, replay.duration);
  const scene = cityDistricts(sample);
  assert.equal(
    scene.find((d) => d.id === "broker")!.assets.find((a) => a.key === "broad")!
      .height,
    holdingHeight(2200, 600),
  );
});
