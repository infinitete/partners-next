import Button from "@/comps/button";
import Input from "@/comps/input";
import { View } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import { RegionPicker } from "@/comps/picker";
import R from "@/requestor";

import "./index.scss";
import { PageData } from "@/constants/common";
import { Partner } from "@/constants/partner";
import Taro from "@tarojs/taro";
import { useDispatch } from "react-redux";
import { pagePartners } from "@/actions";

const Index: FC = () => {
  const [regions, setRegions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const onRegionSelected = useCallback((regions: string[], _: string[]) => {
    setRegions(regions);
  }, []);

  const dispatch = useDispatch();

  const queryPartners = useCallback(async () => {
    let query = Array<string>();
    if (name.trim().length > 0) {
      query.push(`\`name\` like '%${name}%'`);
    }

    if (regions.length > 0) {
      query.push(`\`district_name\` like '${regions.join("/")}%'`);
    }

    let q = "";
    if (query.length > 0) {
      q = encodeURIComponent(query.join(" AND "));
    }

    try {
      Taro.showLoading({ title: "正在搜索" });
      const res = await R.pagePartner<PageData<Partner>>(1, 10, q);
      Taro.hideLoading();
      if (res.code != 0) {
        throw res.msg;
      }
      if (res.data.total == 0) {
        Taro.showToast({ title: "没有数据", icon: "none" });
        return;
      }
      dispatch(pagePartners(res.data));
      Taro.navigateBack({});
    } catch (e) {
      Taro.showToast({ title: "搜索失败", icon: "error" });
    }
  }, [name, regions]);

  return (
    <View className="page">
      <view className="form-wrapper">
        <View className="mention">请填写或者选择搜索项</View>
        <Input
          title="名称"
          placeholder="搜索的合作伙伴名称"
          onInput={(e) => setName(e.detail.value)}
        />
        <RegionPicker
          mode="region"
          title="区域"
          customItem="全部"
          defaultValue={["贵州省", "贵阳市", "观山湖区"]}
          placeholder="所在区域"
          onChange={console.log}
          onSelected={onRegionSelected}
        />
      </view>
      <View className="history-wrapper"></View>
      <View className="btn-wrapper">
        <Button onClick={() => queryPartners()}>搜索</Button>
      </View>
    </View>
  );
};

export default Index;
