/** Presentation-only DTOs. Money is prepared by application/domain. */
export interface CityAsset {
  key: string;
  name: string;
  amount: string;
  height: number;
  presence: number;
  held: boolean;
  tone: string;
  change?: string;
}
export interface CityDistrict {
  id: string;
  scope: string;
  name: string;
  total: string;
  totalNumber: number;
  assets: CityAsset[];
  assetSlots: string[];
}
