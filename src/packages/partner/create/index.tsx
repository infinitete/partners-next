import { View, Map } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import Input from "@/comps/input";
import Picker from "@/comps/picker";
import Mapper from "@/comps/mapper";
import Taro, { useDidShow } from "@tarojs/taro";

import "./index.scss";
import { PARTNER_TYPES } from "@/constants/partner";
import Button from "@/comps/button";

const Index: FC = () => {
  const [pos, setPos] = useState<{ lng: number; lat: number }>({
    lng: 106.63,
    lat: 26.65,
  });

  const [name, setName] = useState("");
  const [type, setType] = useState(3);

  const getCurrentLocation = useCallback(async () => {
    const res = await Taro.getLocation({
      type: "gcj02",
    });
    setPos({ lng: res.longitude, lat: res.latitude });
  }, [setPos]);

  useDidShow(() => {
    getCurrentLocation().then();
  });

  return (
    <View className="page">
      <View className="map-wrapper">
        <Map
          id="map"
          onError={console.log}
          className="map"
          latitude={pos.lat}
          longitude={pos.lng}
          showCompass
          showLocation
          showScale
          enableTraffic
          enableZoom
        />
      </View>
      <View className="form-wrapper">
        <View className="mention">请填写合作伙伴的必要信息</View>
        <View className="items">
          <Input
            title="名称"
            value={name}
            placeholder="合作伙伴名称"
            onInput={(e) => setName(e.detail.value)}
          />
          <Picker
            title="类型"
            placeholder="合作伙伴类型"
            defaultValue={type}
            range={PARTNER_TYPES}
            onChange={(e) => {
              setType(parseInt(`${e.detail.value}`));
            }}
          />
          <Mapper
            title="位置"
            placeholder="合作伙伴位置"
            onSuccess={console.log}
          />
        </View>
        <View className="images"></View>
      </View>
      <View className="btn-wrapper">
        <Button>提交</Button>
      </View>
    </View>
  );
};

export default Index;
