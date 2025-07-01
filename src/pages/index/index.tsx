import { FC, useCallback, useEffect, useState } from "react";
import { View, Map, Image } from "@tarojs/components";
import Button from "@/comps/button";
import AmIcon from "@/assets/icons/aiming.svg";

import "./index.scss";
import Taro from "@tarojs/taro";
import { useSelector } from "react-redux";
import { ReducersType } from "@/reducers";

const Index: FC = () => {
  const appletUser = useSelector((r: ReducersType) => r.AppletUser);

  const mapCtx = Taro.createMapContext("map");
  const [pos, setPos] = useState<{ lng: number; lat: number }>({
    lng: 106.63,
    lat: 26.65,
  });

  const getCurrentLocation = useCallback(async () => {
    const res = await Taro.getLocation({
      type: "gcj02",
    });
    setPos({ lng: res.longitude, lat: res.latitude });
    mapCtx.moveToLocation({ latitude: res.latitude, longitude: res.longitude });
  }, [setPos]);

  const onCreateBtnClick = useCallback(() => {
    if (appletUser == null) {
      Taro.navigateTo({ url: "/pages/login/index" });
    }

    if (!appletUser?.auth) {
      Taro.showModal({
        title: "认证提示",
        content: "您尚未进行认证，是否认证？",
        success: (r) => {
          if (r.confirm) {
            Taro.navigateTo({ url: "/pages/auth/index" });
          }
        },
      });
    }
  }, [appletUser]);

  const onListBtnClick = useCallback(() => {
    if (appletUser == null) {
      Taro.navigateTo({ url: "/pages/login/index" });
    }

    if (!appletUser?.auth) {
      Taro.showModal({
        title: "认证提示",
        content: "您尚未进行认证，是否认证？",
        success: (r) => {
          if (r.confirm) {
            Taro.navigateTo({ url: "/pages/auth/index" });
          }
        },
      });
    }
  }, [appletUser]);

  useEffect(() => {
    getCurrentLocation().then();
  }, []);

  return (
    <View className="container">
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
        <View className="icon" onClick={() => getCurrentLocation()}>
          <Image className="icon" src={AmIcon} />
        </View>

        <View className="actions">
          <View className="action-item">
            <Button rev onClick={onCreateBtnClick}>
              采集记录
            </Button>
          </View>
          <View className="action-item">
            <Button onClick={onListBtnClick}>我要采集</Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Index;
