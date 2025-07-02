import { PageData } from "@/constants/common";
import {
  PAGE_PARTNERS,
  Partner,
  SET_NEARLY_PARTNERS,
} from "@/constants/partner";
import { AppletUser, SET_USER } from "@/constants/user";

const setUser = (user: AppletUser | null) => ({ type: SET_USER, user });

const pagePartners = (partners: PageData<Partner>) => ({
  type: PAGE_PARTNERS,
  partners,
});

const setNearlyPartners = (partners: Partner[]) => ({
  type: SET_NEARLY_PARTNERS,
  partners,
});

export type SetUserType = ReturnType<typeof setUser>;
export type PagePartnersType = ReturnType<typeof pagePartners>;
export type SetNearlyPartnersType = ReturnType<typeof setNearlyPartners>;

export { setUser, pagePartners, setNearlyPartners };
