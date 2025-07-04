import Button from "@/comps/button";
import Input from "@/comps/input";
import { View } from "@tarojs/components";
import { FC, useCallback } from "react";
import { RegionPicker } from "@/comps/picker";

import "./index.scss";

const Index: FC = () => {
  const onRegionSelected = useCallback((region: string[], code: string[]) => {
    console.log("region", region, code, "code");
  }, []);

  return (
    <View className="page">
      <view className="form-wrapper">
        <View className="mention">请填写或者选择搜索项</View>
        <Input title="名称" placeholder="搜索的合作伙伴名称" />
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
        <Button>搜索</Button>
      </View>
    </View>
  );
};

export default Index;
