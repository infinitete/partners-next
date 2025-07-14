import { Image, View, Text } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import BookmarkIcon from "@/assets/icons/bookmark.svg";
import Button from "@/comps/button";

import "./index.scss";
import Taro, { useLoad } from "@tarojs/taro";

const Index: FC = () => {
  const [id, setId] = useState("");

  useLoad((data: { id: string }) => {
    if (data.id == "" || data.id == undefined) {
      Taro.navigateBack({});
    }
    setId(data.id);
  });

  const onBackClick = useCallback(() => {
    Taro.navigateBack({});
  }, []);

  const onAddEmployeeClick = useCallback(() => {
    Taro.navigateTo({
      url: `/packages/partner/employee/add?partner=${id}`,
    });
  }, [id]);

  return (
    <View className="page">
      <View className="icon-wrapper">
        <Image src={BookmarkIcon} />
      </View>
      <View className="main-text">
        <Text>提交合作伙伴信息成功</Text>
      </View>
      <View className="sub-text">
        <Text>您可以为该合作伙伴</Text>
        <Text className="link" onClick={() => onAddEmployeeClick()}>
          添加联系人
        </Text>
        <Text>或者</Text>
        <Text className="link" onClick={() => onBackClick()}>
          返回
        </Text>
      </View>
      <View className="flex-1 buttons">
        <View className="item">
          <Button rev onClick={() => onAddEmployeeClick()}>
            添加联系人
          </Button>
        </View>
        <View className="item">
          <Button onClick={() => onBackClick()}>返回</Button>
        </View>
      </View>
    </View>
  );
};

export default Index;
