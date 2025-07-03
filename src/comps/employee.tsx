import UserIcon from "@/assets/icons/user.svg";
import { Employee } from "@/constants/partner";
import { Image, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";
import { FC, useCallback } from "react";

const Index: FC<Employee> = ({ name, position, createdAt, phone }) => {
  const onPhoneClick = useCallback(() => {
    Taro.makePhoneCall({ phoneNumber: phone });
  }, []);

  return (
    <View className="app-employee">
      <View className="head">
        <View className="icon-wrapper">
          <Image src={UserIcon} />
        </View>
        <View className="name">
          <Text>{name}</Text>
          <Text className="position">({position})</Text>
        </View>
        <View className="phone">
          <Text onClick={onPhoneClick}>{phone}</Text>
        </View>
      </View>
      <View className="devider">&nbsp;</View>
      <View className="time">
        <Text className="key">录入时间:</Text>
        <Text>{dayjs(createdAt * 1000).format("YY-MM-DD")}</Text>
      </View>
    </View>
  );
};

export default Index;
