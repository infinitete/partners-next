import Taro, { request } from "@tarojs/taro";

const key = "ZOBBZ-7UULJ-EUQFD-FOA7F-UBTY3-LCBLM";

type AdInfo = {
  adcode: string;
  city: string;
  city_code: string;
  district: string;
};

type AddressComponent = {
  nation: string;
  province: string;
  city: string;
  district: string;
  street: string;
  street_number: string;
};

type FormattedAddresses = {
  recommend: string;
  rough: string;
};

type AddressResult = {
  status: number;
  message: string;
  result: {
    ad_info: AdInfo;
    address: string;
    address_component: AddressComponent;
    formatted_addresses: FormattedAddresses;
  };
};

type LngLat = {
  longitude: number;
  latitude: number;
};

const GetLocation = async () => {
  const res = await Taro.getLocation({
    isHighAccuracy: true,
    type: "gcj02",
  });
  const result: LngLat = {
    longitude: res.longitude,
    latitude: res.latitude,
  };

  return result;
};

const LngLatToAddress = async (lng: number, lat: number) => {
  const url = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${key}`;

  const response = await request<AddressResult>({
    url,
    method: "GET",
  });

  if (response.data.status !== 0) {
    throw new Error(response.data.message);
  }

  return response.data.result;
};

export { GetLocation, LngLatToAddress };
