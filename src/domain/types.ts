export type Money = string | null;
export type Coverage = "COMPLETE" | "PARTIAL" | "UNAVAILABLE";
export interface Scope {
  portfolioId: string;
  membershipVersion: number;
  accountIds: string[];
  currency: string;
}
export interface Context {
  scope: Scope;
  asOf: string;
  from: string;
  knowledgeCutoff: string;
  dataRevision: number;
}
export interface Result {
  factId: string;
  revision: number;
  metric: string;
  unit: string;
  scope: Scope;
  asOf: string;
  range: { from: string; to: string };
  dataRevision: number;
  knowledgeCutoff: string;
  value: Money;
  knownSubtotal: Money;
  coverage: Coverage;
  method: string;
  assumptions: string[];
  evidenceRefs: string[];
  inputFactIds: string[];
  missing: string[];
  reasons: string[];
  eligibility: { uses: string[]; rejected: string[] };
  components?: Result[];
}
