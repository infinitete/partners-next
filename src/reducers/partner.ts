import { PagePartnersType, SetNearlyPartnersType } from "@/actions";
import { PageData, PageQuerier } from "@/constants/common";
import {
  Partner,
  PartnerQuerier,
  PAGE_PARTNERS,
  SET_NEARLY_PARTNERS,
} from "@/constants/partner";

const Partners = (
  partners: PageData<Partner, PageQuerier<PartnerQuerier>> = {
    page: 0,
    size: 10,
    total: 0,
    query: undefined,
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
