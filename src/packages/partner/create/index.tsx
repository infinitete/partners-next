import { View, Map, Canvas } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import Input from "@/comps/input";
import Picker from "@/comps/picker";
import Mapper from "@/comps/mapper";
import Imager from "@/comps/imager";
import Taro, { useDidShow } from "@tarojs/taro";
import MD5 from "md5";
import R from "@/requestor";

import "./index.scss";
import { AppLocation, Partner, PARTNER_TYPES } from "@/constants/partner";
import Button from "@/comps/button";
import { Watermark, Sleep } from "@/utils/watermarker";
import { uploadFileToAliOssAndGetOid } from "@/utils/oss";
import { useSelector } from "react-redux";
import { ReducersType } from "@/reducers";

const Index: FC = () => {
  const [pos, setPos] = useState<{ lng: number; lat: number }>({
    lng: 106.63,
    lat: 26.65,
  });
  const [size, updateSize] = useState<{ width: number; height: number }>({
    width: 1,
    height: 1,
  });

  const mapCtx = Taro.createMapContext("c_map");

  const appletUser = useSelector((r: ReducersType) => r.AppletUser);

  const [name, setName] = useState("");
  const [type, setType] = useState(3);
  const [location, setLocation] = useState<AppLocation | undefined>();
  const [doorPics, setDoorPics] = useState<string[]>([]);
  const [panoramaPics, setPanoramaPics] = useState<string[]>([]);

  const resetFields = useCallback(() => {
    setName("");
    setLocation(undefined);
    setDoorPics([]);
    setPanoramaPics([]);
  }, [setName, setLocation, setDoorPics, setPanoramaPics]);

  const getCurrentLocation = useCallback(async () => {
    const res = await Taro.getLocation({
      type: "gcj02",
    });
    setPos({ lng: res.longitude, lat: res.latitude });
  }, [setPos]);

  useDidShow(() => {
    getCurrentLocation().then();
  });

  // 水印
  const waterMarker = useCallback(
    async (mainTitle: string, subTitle: string, path: string) => {
      const info = await Taro.getImageInfo({ src: path });
      let dir = info.orientation;
      const size = { width: info.width, height: info.height };
      const max = size.height > size.width ? size.height : size.width;
      let ratio = 1;
      ratio = max / 1920;
      let nextSize = {
        width: size.width / ratio,
        height: size.height / ratio,
      };

      // 如果图片有是通过树立相机拍照的，那么将长宽置换，这样才能保持图片不变形
      if (
        dir === "left" ||
        dir === "left-mirrored" ||
        dir === "right" ||
        dir === "right-mirrored"
      ) {
        nextSize.width = size.height / ratio;
        nextSize.height = size.width / ratio;
      }

      updateSize(nextSize);
      const res = await Watermark(
        "#cav",
        path,
        mainTitle,
        subTitle,
        nextSize.width,
        nextSize.height,
      );
      return res;
    },
    [updateSize],
  );

  // 提交
  const onSubmit = useCallback(async () => {
    if (name == "") {
      Taro.showToast({ title: "请输入名称", icon: "none" });
      return;
    }

    if (location == undefined) {
      Taro.showToast({ title: "请选择位置", icon: "none" });
      return;
    }

    if (doorPics.length == 0) {
      Taro.showToast({ title: "请上传门头照", icon: "none" });
    }

    if (panoramaPics.length == 0) {
      Taro.showToast({ title: "请上远景照", icon: "none" });
    }

    let waterMarkerdDoorpic = "";
    let waterMarkerdPanoramaPic = "";
    let doorOid = "";
    let panoramaOid = "";
    try {
      Taro.showLoading({ title: "处理图片..." });
      waterMarkerdDoorpic = await waterMarker(
        name,
        location.address,
        doorPics[0],
      );
      await Sleep(100);
      waterMarkerdPanoramaPic = await waterMarker(
        name,
        location.address,
        panoramaPics[0],
      );
      Taro.hideLoading();
    } catch (e) {
      console.error("处理图片失败", e);
      Taro.hideLoading();
      Taro.showToast({ title: "处理图片失败", icon: "error" });
      return;
    }

    try {
      Taro.showLoading({ title: "上传图片..." });
      doorOid = await uploadFileToAliOssAndGetOid(
        waterMarkerdDoorpic,
        MD5(`${name}-${new Date()}-门头照.jpg`),
        appletUser?.oepnid ?? "",
        "门头照",
      );

      panoramaOid = await uploadFileToAliOssAndGetOid(
        waterMarkerdPanoramaPic,
        MD5(`${name}-${new Date()}-远景照.jpg`),
        appletUser?.oepnid ?? "",
        "远景照",
      );
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: "上传图片失败" });
    }

    const partner: Partner = {
      id: 0,
      type,
      name: name,
      address: location.address,
      latitude: `${location.latitude}`,
      longitude: `${location.longitude}`,
      recorder: appletUser?.oepnid ?? "",
      districtName: location.district,
      districtCode: location.districtCode,
      doorPhoto: doorOid,
      panoramaPhoto: panoramaOid,
      createdAt: 0,
      updatedAt: 0,
    };

    try {
      Taro.showLoading({ title: "正在提交..." });
      const p = await R.createPartner<Partner>(partner);
      if (p.code !== 0) {
        throw p.msg;
      }
      partner.id = p.data.id;
      Taro.hideLoading();
      Taro.showToast({ title: "提交成功", icon: "success" });
    } catch (e) {
      Taro.hideLoading();
      Taro.showModal({
        title: "出现错误",
        content: "提交采集信息出现错误,请联系管理员",
      });
      return;
    }
    resetFields();
    const t = setTimeout(() => {
      Taro.navigateTo({
        url: `/packages/partner/success/index?id=${partner.id}`,
      });
      clearTimeout(t);
    }, 2000);
  }, [name, type, location, doorPics, panoramaPics, waterMarker, resetFields]);

  return (
    <View className="page">
      <View className="map-wrapper">
        <Map
          id="c_map"
          onError={console.log}
          className="map"
          latitude={pos.lat}
          longitude={pos.lng}
          showCompass
          showLocation
          showScale
          enableTraffic
          enableZoom
          markers={[
            {
              id: 1,
              latitude: pos.lat,
              longitude: pos.lng,
              title: name,
              iconPath: "",
              width: 30,
              height: 46,
            },
          ]}
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
            value={type}
            range={PARTNER_TYPES}
            onChange={(e) => {
              setType(parseInt(`${e.detail.value}`));
            }}
          />
          <Mapper
            title="位置"
            placeholder="合作伙伴位置"
            onSuccess={(l) => {
              setLocation(l);
              const marker = {
                id: l.latitude,
                longitude: l.longitude,
                latitude: l.latitude,
                name: name,
                iconPath: "",
                width: 30,
                height: 46,
              };

              mapCtx.moveToLocation({
                latitude: l.latitude,
                longitude: l.longitude,
              });
              mapCtx.addMarkers({ markers: [marker], clear: true });
            }}
          />
        </View>
        <View className="images">
          <View className="item">
            <Imager
              mode="picker"
              onChange={(paths) => {
                setDoorPics(paths);
              }}
              title="门头照"
              count={1}
            />
          </View>
          <View className="flex-1">&nbsp;</View>
          <View className="item">
            <Imager
              mode="picker"
              onChange={(paths) => {
                setPanoramaPics([...paths]);
              }}
              title="远景照"
              count={1}
            />
          </View>
        </View>
      </View>
      <View className="btn-wrapper">
        <Button onClick={onSubmit}>提交</Button>
      </View>
      <Canvas
        type="2d"
        style={{
          ...size,
          ...{
            zIndex: -1,
            position: "absolute",
            top: "9999999px",
            left: "-99999999px",
          },
        }}
        id="cav"
        canvasId="cav"
      />
    </View>
  );
};

export default Index;
