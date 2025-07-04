import Button from "@/comps/button";
import Input from "@/comps/input";
import { View } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import { RegionPicker } from "@/comps/picker";
import R from "@/requestor";

import "./index.scss";
import { PageData } from "@/constants/common";
import { Partner } from "@/constants/partner";

const Index: FC = () => {
  const [regions, setRegions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const onRegionSelected = useCallback((region: string[], code: string[]) => {
    console.log("region", region, code, "code");
    setRegions(regions);
  }, []);

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

    const res = await R.pagePartner<PageData<Partner>>(1, 10, q);
    console.log(res);
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
