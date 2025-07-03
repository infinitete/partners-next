import AmIcon from "@/assets/icons/aiming.svg";
import Button from "@/comps/button";
import { Image, Map, View } from "@tarojs/components";
import { FC, useCallback, useState } from "react";

import { setNearlyPartners } from "@/actions";
import { Partner } from "@/constants/partner";
import { ReducersType } from "@/reducers";
import R from "@/requestor";
import Taro, { useDidShow } from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";

const Index: FC = () => {
  const dispatch = useDispatch();
  const appletUser = useSelector((r: ReducersType) => r.AppletUser);
  const nearlyPartners = useSelector((r: ReducersType) => r.NearlyPartners);

  const mapCtx = Taro.createMapContext("map");
  const [pos, setPos] = useState<{ lng: number; lat: number }>({
    lng: 106.63,
    lat: 26.65,
  });

  const getNearlyPartners = useCallback(
    async (lng: number, lat: number, count: number = 20) => {
      try {
        Taro.showLoading();
        const res = await R.getNearlyPartners<Partner[]>(lng, lat, count);
        if (res.code == 0) {
          mapCtx.removeMarkers({
            markerIds: nearlyPartners.map((x) => `${x.id}`),
          });
          dispatch(setNearlyPartners(res.data));
          const markers = res.data.map((p) => ({
            id: p.id,
            longitude: parseFloat(p.longitude),
            latitude: parseFloat(p.latitude),
            name: p.name,
            title: p.name,
            iconPath: "",
            width: 30,
            height: 46,
          }));
          mapCtx.addMarkers({ markers: markers });
        }
      } catch (e) {
      } finally {
        Taro.hideLoading();
      }
    },
    [nearlyPartners, setNearlyPartners],
  );

  const getCurrentLocation = useCallback(async () => {
    try {
      await Taro.authorize({ scope: "scope.userLocation" });
    } catch (e) {
      Taro.showModal({
        title: "定位失败",
        content: "请打开定位权限",
        success: (s) => {
          if (s.confirm) {
            Taro.openSetting({});
          }
        },
      });
    }
    const res = await Taro.getLocation({
      type: "gcj02",
    });

    setPos({ lng: res.longitude, lat: res.latitude });
    mapCtx.moveToLocation({ latitude: res.latitude, longitude: res.longitude });
    if (appletUser?.auth) {
      getNearlyPartners(res.longitude, res.latitude, 20);
    }
  }, [setPos, appletUser]);

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

      return;
    }

    Taro.navigateTo({ url: "/packages/partner/create/index" });
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

  useDidShow(() => {
    /* Taro.navigateTo({ url: "/packages/partner/details/index?id=4872" }); */
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
          includePoints={nearlyPartners.map((p) => ({
            latitude: parseFloat(p.latitude),
            longitude: parseFloat(p.longitude),
          }))}
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
