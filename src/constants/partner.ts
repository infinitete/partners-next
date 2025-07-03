export interface Partner {
  id: number;
  type: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  recorder: string;
  districtName: string;
  districtCode: string;
  doorPhoto: string;
  panoramaPhoto: string;
  createdAt: number;
  updatedAt: number;
}

export type AppLocation = {
  id: number;
  latitude: number;
  longitude: number;
  province: string;
  city: string;
  district: string;
  districtCode: string;
  address: string;
};

export interface Employee {
  id: number;
  name: string;
  photo: string;
  position: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExtraData {
  recorderName: string;
  recoderOpenid: string;
  employees: Employee[];
}

export const PARTNER_TYPES = ["拖车侠", "保险公司", "拖车公司", "维修公司"];
export const PAGE_PARTNERS = "PAGE_PARTNERS";
export const SET_NEARLY_PARTNERS = "SET_NEARLY_PARTNERS";
