import { View, Map, Canvas } from "@tarojs/components";
import { FC, useCallback, useEffect, useState } from "react";
import Input from "@/comps/input";
import Picker from "@/comps/picker";
import Mapper from "@/comps/mapper";
import Imager from "@/comps/imager";
import Taro, { useLoad } from "@tarojs/taro";
import MD5 from "md5";
import R from "@/requestor";

import "./index.scss";
import { AppLocation, Partner, PARTNER_TYPES } from "@/constants/partner";
import Button from "@/comps/button";
import { Watermark, Sleep } from "@/utils/watermarker";
import { getFileByOID, uploadFileToAliOssAndGetOid } from "@/utils/oss";
import { useSelector } from "react-redux";
import { ReducersType } from "@/reducers";

interface Picture {
  oid: string;
  url: string;
  watermark: boolean;
  upload: boolean;
  changed: boolean;
}

const Index: FC = () => {
  const [id, setId] = useState(0);
  const [partner, setPartner] = useState<Partner | undefined>(undefined);

  const [pos, setPos] = useState<{ lng: number; lat: number }>({
    lng: 106.63,
    lat: 26.65,
  });
  const [size, updateSize] = useState<{ width: number; height: number }>({
    width: 1,
    height: 1,
  });

  const appletUser = useSelector((r: ReducersType) => r.AppletUser);

  useLoad((data: { id: string }) => {
    const realId = parseInt(data.id);
    if (Number.isNaN(realId)) {
      Taro.navigateBack({
        fail: () => Taro.navigateTo({ url: "/pages/index/index" }),
      });
    }

    setId(realId);
  });

  const [name, setName] = useState(partner?.name ?? "");
  const [type, setType] = useState(partner?.type ?? 3);
  const [location, setLocation] = useState<AppLocation | undefined>();
  const [doorPic, setDoorPic] = useState<Picture>({
    oid: "",
    url: "",
    watermark: false,
    changed: false,
    upload: false,
  });
  const [panoramaPic, setPanoramaPic] = useState<Picture>({
    oid: "",
    url: "",
    watermark: false,
    changed: false,
    upload: false,
  });

  const getPartner = useCallback(
    async (id: number) => {
      Taro.showLoading({ title: "获取数据中" });
      try {
        const res = await R.getPartner<Partner>(id);
        if (res.code != 0) {
          throw res.msg;
        }
        Taro.hideLoading();
        setPartner(res.data);
        setName(res.data.name);
        setType(res.data.type);
        setPos({
          lat: parseFloat(res.data.latitude),
          lng: parseFloat(res.data.longitude),
        });
        const ptn = res.data;
        const dicts = ptn.districtName.split("/");
        setPartner(ptn);
        setLocation({
          id: ptn.id,
          latitude: pos.lat,
          longitude: pos.lng,
          province: dicts[0] ?? "",
          city: dicts[1] ?? "",
          district: dicts[2] ?? "",
          districtCode: ptn.districtCode ?? "",
          address: ptn.address ?? "",
        });
        setDoorPic({
          oid: ptn.doorPhoto,
          url: getFileByOID(ptn.doorPhoto),
          changed: false,
          watermark: true,
          upload: true,
        });

        setPanoramaPic({
          oid: ptn.panoramaPhoto,
          url: getFileByOID(ptn.panoramaPhoto),
          changed: false,
          watermark: true,
          upload: true,
        });
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "获取数据失败", icon: "none" });
        const t = setTimeout(() => {
          clearTimeout(t);
          Taro.navigateBack({});
        }, 2000);
      }
    },
    [setPartner, setPos, setName, setType, setPanoramaPic, setDoorPic],
  );

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

  // 更新
  const onSubmit = useCallback(async () => {
    if (name == "") {
      Taro.showToast({ title: "请输入名称", icon: "none" });
      return;
    }

    if (location == undefined) {
      Taro.showToast({ title: "请选择位置", icon: "none" });
      return;
    }

    if (doorPic.url == "") {
      Taro.showToast({ title: "请上传门头照", icon: "none" });
      return;
    }

    if (panoramaPic.url == "") {
      Taro.showToast({ title: "请上远景照", icon: "none" });
      return;
    }

    let waterMarkerdDoorpic = doorPic.watermark ? doorPic.url : "";
    let waterMarkerdPanoramaPic = panoramaPic.watermark ? panoramaPic.url : "";
    let doorOid = doorPic.oid;
    let panoramaOid = panoramaPic.oid;

    if (waterMarkerdDoorpic == "") {
      try {
        Taro.showLoading({ title: "处理图片..." });
        waterMarkerdDoorpic = await waterMarker(
          name,
          location.address,
          doorPic.url,
        );

        await Sleep(100);
        Taro.hideLoading();
      } catch (e) {
        console.error("处理图片失败", e);
        Taro.hideLoading();
        Taro.showToast({ title: "处理图片失败", icon: "error" });
        return;
      }
    }

    if (waterMarkerdPanoramaPic == "") {
      try {
        Taro.showLoading({ title: "处理图片..." });
        // 如果远景照已改变
        waterMarkerdPanoramaPic = await waterMarker(
          name,
          location.address,
          panoramaPic.url,
        );
        await Sleep(100);
        Taro.hideLoading();
      } catch (e) {
        console.error("处理图片失败", e);
        Taro.hideLoading();
        Taro.showToast({ title: "处理图片失败", icon: "error" });
        return;
      }
    }

    const needUpload = doorOid == "" || panoramaOid == "";

    if (needUpload) {
      try {
        Taro.showLoading({ title: "上传图片..." });

        if (doorOid == "") {
          doorOid = await uploadFileToAliOssAndGetOid(
            waterMarkerdDoorpic,
            MD5(`${name}-${new Date()}-门头照.jpg`),
            appletUser?.oepnid ?? "",
            "门头照",
          );
        }

        if (panoramaOid == "") {
          panoramaOid = await uploadFileToAliOssAndGetOid(
            waterMarkerdPanoramaPic,
            MD5(`${name}-${new Date()}-远景照.jpg`),
            appletUser?.oepnid ?? "",
            "远景照",
          );
        }

        Taro.hideLoading();
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "上传图片失败" });
      }
    }

    const partner: Partner = {
      id: id,
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
      Taro.showLoading({ title: "正在更新..." });
      const p = await R.updatePartner<Partner>(partner);
      if (p.code !== 0) {
        throw p.msg;
      }
      Taro.hideLoading();
      Taro.showToast({ title: "更新成功", icon: "success" });
    } catch (e) {
      Taro.hideLoading();
      Taro.showModal({
        title: "出现错误",
        content: "更新出现错误,请联系管理员",
      });
      return;
    }
    const t = setTimeout(() => {
      Taro.navigateBack({});
      clearTimeout(t);
    }, 2000);
  }, [id, name, type, location, doorPic, panoramaPic, waterMarker]);

  useEffect(() => {
    if (id > 0) {
      getPartner(id);
    }
  }, [id, getPartner]);

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
          markers={[
            {
              id: 1,
              latitude: pos.lat,
              longitude: pos.lng,
              title: partner?.name,
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
            defaultValue={partner?.type ?? 3}
            value={type}
            range={PARTNER_TYPES}
            onChange={(e) => {
              setType(parseInt(`${e.detail.value}`));
            }}
          />
          <Mapper
            key={partner?.address}
            title="位置"
            placeholder={`合作伙伴位置`}
            defaultValue={{
              id: 1,
              latitude: pos.lat,
              longitude: pos.lng,
              province: partner?.districtName.split("/")[0] ?? "",
              city: partner?.districtName.split("/")[1] ?? "",
              district: partner?.districtName.split("/")[2] ?? "",
              districtCode: partner?.districtCode ?? "",
              address: partner?.address ?? "",
            }}
            onSuccess={(l) => setLocation(l)}
          />
        </View>
        <View className="images">
          <View className="item">
            <Imager
              mode="picker"
              onChange={(paths, idx) => {
                if (paths.length == 0) {
                  return;
                }

                const url = paths[idx];
                setDoorPic({
                  oid: "",
                  url: url,
                  watermark: false,
                  changed: true,
                  upload: true,
                });
              }}
              items={partner ? [getFileByOID(partner.doorPhoto)] : undefined}
              title="门头照"
              count={1}
            />
          </View>
          <View className="flex-1">&nbsp;</View>
          <View className="item">
            <Imager
              mode="picker"
              onChange={(paths, idx) => {
                if (paths.length == 0) {
                  return;
                }

                const url = paths[idx];
                setPanoramaPic({
                  oid: "",
                  url: url,
                  watermark: false,
                  changed: true,
                  upload: true,
                });
              }}
              items={
                partner ? [getFileByOID(partner.panoramaPhoto)] : undefined
              }
              title="远景照"
              count={1}
            />
          </View>
        </View>
      </View>
      <View className="btn-wrapper">
        <Button onClick={onSubmit}>更新</Button>
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
