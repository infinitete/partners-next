import { PagePartnersType, SetNearlyPartnersType } from "@/actions";
import { PageData } from "@/constants/common";
import {
  Partner,
  PAGE_PARTNERS,
  SET_NEARLY_PARTNERS,
} from "@/constants/partner";

const Partners = (
  partners: PageData<Partner> = {
    page: 0,
    size: 10,
    total: 0,
    query: "",
    payload: [],
  },
  action: PagePartnersType,
) => {
  if (action.type === PAGE_PARTNERS) {
    return action.partners;
  }

  return partners;
};

const NearlyPartners = (
  partners: Partner[] = [],
  action: SetNearlyPartnersType,
) => {
  if (action.type === SET_NEARLY_PARTNERS) {
    return action.partners;
  }

  return partners;
};

export default Partners;
export { NearlyPartners };
