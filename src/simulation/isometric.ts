export type DemoModel = {
  account: { id: string; name: string };
  observation: { cash: string };
  holdings: {
    assetId: string;
    name: string;
    quantity: string;
    value: string | null;
  }[];
};
// Independently authored design fixtures. No real accounts or financial records.
export const campuses: DemoModel[] = [
  {
    account: { id: "harbor", name: "静湾证券" },
    observation: { cash: "3600" },
    holdings: [
      { assetId: "forest", name: "林间制造", quantity: "400", value: "7200" },
      { assetId: "tide", name: "潮汐动力", quantity: "300", value: "6300" },
    ],
  },
  {
    account: { id: "garden", name: "松岚基金" },
    observation: { cash: "2400" },
    holdings: [
      { assetId: "index", name: "山海指数", quantity: "1800", value: "9360" },
      { assetId: "bond", name: "长青债券", quantity: "1200", value: "5040" },
    ],
  },
];
