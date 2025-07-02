import { FC, useCallback, useEffect, useState } from "react";
import { View, Map, Image } from "@tarojs/components";
import Button from "@/comps/button";
import AmIcon from "@/assets/icons/aiming.svg";

import "./index.scss";
import Taro from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import { ReducersType } from "@/reducers";
import { setUser } from "@/actions";

const Index: FC = () => {
  const dispatch = useDispatch();
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
      return;
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
      return;
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

    Taro.navigateTo({ url: "/packages/partner/list/index" });
  }, [appletUser]);

  useEffect(() => {
    getCurrentLocation().then();
  }, []);

  const onDbClick = useCallback(() => {
    dispatch(setUser(null));
    console.log("remove user");
  }, []);

  return (
    <View className="page" onLongPress={onDbClick}>
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
            <Button rev onClick={onListBtnClick}>
              采集记录
            </Button>
          </View>
          <View className="action-item">
            <Button onClick={onCreateBtnClick}>我要采集</Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Index;
