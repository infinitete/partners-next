export interface Partner {
  id: number;
  type: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  recorder: string;
  distrctName: string;
  distrctCode: string;
  doorPhoto: string;
  panoramaPhoto: string;
  createdAt: number;
  updatedAt: number;
}

export const PAGE_PARTNERS = "PAGE_PARTNERS";
