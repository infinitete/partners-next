import { View, Image, Input as WxInput } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import CaretRightIcon from "@/assets/icons/caret-right.svg";
import Taro from "@tarojs/taro";

import { LngLatToAddress } from "@/utils/location";
import { AppLocation } from "@/constants/partner";

export type Props = {
  title: string;
  placeholder?: string;
  onSuccess?: (location: AppLocation) => void;
};

const Input: FC<Props> = (props: Props) => {
  const [pageLocation, setPageLocation] = useState<AppLocation | undefined>(
    undefined,
  );
  const mapCtx = Taro.createMapContext("map");

  const getLocation = useCallback(
    async (address: string, lng: number, lat: number) => {
      Taro.showLoading({ title: "正在解析地址" });
      try {
        const res = await LngLatToAddress(lng, lat);
        const { province, city, district } = res.address_component;
        const location: AppLocation = {
          id: Math.ceil(new Date().getTime() / 1000),
          latitude: lat,
          longitude: lng,
          province: res.address_component.province,
          city: res.address_component.city,
          district: `${province}/${city}/${district}`,
          districtCode: res.ad_info.adcode,
          address: address,
        };

        Taro.hideLoading();
        return location;
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "解析地址失败", icon: "none" });
        return undefined;
      }
    },
    [],
  );

  const onClick = useCallback(async () => {
    try {
      const res = await Taro.chooseLocation({});
      mapCtx.moveToLocation({
        longitude: res.longitude,
        latitude: res.latitude,
      });
      if (pageLocation != undefined) {
        mapCtx.removeMarkers({ markerIds: [`${pageLocation.id}`] });
      }

      const location = await getLocation(
        res.address,
        res.longitude,
        res.latitude,
      );

      if (props.onSuccess && location != undefined) {
        mapCtx.addMarkers({
          markers: [
            {
              id: location.id,
              latitude: res.latitude,
              longitude: res.longitude,
              iconPath: "",
              width: 30,
              height: 46,
            },
          ],
        });
        mapCtx.moveToLocation({
          latitude: res.latitude,
          longitude: res.longitude,
        });

        props.onSuccess(location);
        setPageLocation(location);
      }
    } catch (e) {
      console.error(e);
      Taro.showToast({ title: "打开地图失败", icon: "error" });
    }
  }, []);

  return (
    <View className="app-form-wrapper">
      <View className="title">{props.title}</View>
      <View className="input-wrapper" onClick={onClick}>
        <WxInput
          type="text"
          value={pageLocation?.address}
          placeholder={props.placeholder}
          placeholderClass="input-placeholder"
          disabled
        />
        <Image className="caret" src={CaretRightIcon} />
      </View>
    </View>
  );
};

export default Input;
