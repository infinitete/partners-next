import { PageData } from "@/constants/common";
import { PAGE_PARTNERS, Partner } from "@/constants/partner";
import { AppletUser, SET_USER } from "@/constants/user";

const setUser = (user: AppletUser | null) => ({ type: SET_USER, user });

const pagePartners = (partners: PageData<Partner>) => ({
  type: PAGE_PARTNERS,
  partners,
});

export { setUser, pagePartners };

export type SetUserType = ReturnType<typeof setUser>;
export type PagePartnersType = ReturnType<typeof pagePartners>;
