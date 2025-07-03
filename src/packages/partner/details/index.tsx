import PartnerComp from "@/comps/partner";
import { ExtraData, Partner } from "@/constants/partner";
import R from "@/requestor";
import { Map, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { FC, useCallback, useEffect, useState } from "react";
import Desciption from "@/comps/description";
import "./index.scss";
import dayjs from "dayjs";
import Imager from "@/comps/imager";
import { getFileByOID } from "@/utils/oss";

interface Props {
  partner: Partner;
  extraData: ExtraData;
}

const PartnerRenderer: React.FC<Props> = ({ partner, extraData }) => {
  useEffect(() => {}, []);

  return (
    <View className="partner-wrapper">
      <Map
        className="map"
        onError={console.error}
        latitude={parseFloat(partner.latitude)}
        longitude={parseFloat(partner.longitude)}
        markers={[
          {
            id: 1,
            latitude: parseFloat(partner.latitude),
            longitude: parseFloat(partner.longitude),
            title: partner.name,
            iconPath: "",
            width: 30,
            height: 46,
          },
        ]}
      />
      <View className="main">
        <PartnerComp
          partner={partner}
          onClick={() =>
            Taro.openLocation({
              latitude: parseFloat(partner.latitude),
              longitude: parseFloat(partner.longitude),
              name: partner.name,
            })
          }
        />
      </View>
      <View className="extra">
        <Desciption
          items={[
            {
              label: "录入人",
              value:
                extraData.recorderName.length > 0
                  ? extraData.recorderName
                  : "未认证用户",
              id: 1,
            },
            {
              label: "录入时间",
              value: dayjs(partner.createdAt * 1000).format(
                "YY年MM月DD日 HH时mm分",
              ),
              id: 1,
            },
            {
              label: "最近更新",
              value: dayjs(partner.updatedAt * 1000).format(
                "YY年MM月DD日 HH时mm分",
              ),
              id: 1,
            },
          ]}
        />
      </View>
      <View className="images">
        <View className="item">
          <Imager
            title="门头照"
            onChange={console.log}
            count={1}
            read
            items={[getFileByOID(partner.doorPhoto)]}
          />
        </View>
        <View className="item" style={{ marginLeft: "8px" }}>
          <Imager
            title="远景照"
            onChange={console.log}
            count={1}
            read
            items={[getFileByOID(partner.panoramaPhoto)]}
          />
        </View>
        <View className="flex-1">&nbsp;</View>
      </View>
    </View>
  );
};

const Index: FC = () => {
  const [partner, setPartner] = useState<Partner | undefined>(undefined);
  const [extraData, setExtraData] = useState<ExtraData | undefined>(undefined);

  const getPartner = useCallback(
    async (id: number) => {
      Taro.showLoading({ title: "获取数据中" });
      try {
        const res = await R.getPartner<Partner>(id);
        if (res.code != 0) {
          throw res.msg;
        }
        const res1 = await R.getPartnerExtraData<ExtraData>(id);
        if (res1.code != 0) {
          throw res.msg;
        }
        Taro.hideLoading();
        setExtraData(res1.data);
        setPartner(res.data);
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "获取数据失败" });
        const t = setTimeout(() => {
          clearTimeout(t);
          Taro.navigateBack({});
        }, 2000);
      }
    },
    [setPartner],
  );

  useLoad((p: { id: string }) => {
    const id = parseInt(p.id);
    if (Number.isNaN(id)) {
      Taro.navigateBack({});
      return;
    }
    getPartner(id);
  });

  return (
    <View className="page">
      {partner && extraData ? (
        <PartnerRenderer partner={partner} extraData={extraData} />
      ) : (
        ""
      )}
    </View>
  );
};

export default Index;
