import { View, Image, Text } from "@tarojs/components";
import React from "react";
import { Partner as T } from "@/constants/partner";
import StoreIcon from "@/assets/icons/store.svg";

export interface PartnerProps {
  onClick?: (p: T) => void;
  hover?: boolean;
  partner: T;
}

const Partner: React.FC<PartnerProps> = ({ onClick, partner, hover }) => {
  return (
    <View
      className={`app-partner ${hover ? "app-partner-hover" : ""}`}
      onClick={() => (onClick ? onClick(partner) : "")}
    >
      <View className="main">
        <View className="icon">
          <Image src={StoreIcon} />
        </View>
        <View className="name">{partner.name}</View>
      </View>
      <View className="address">
        <Text>{partner.address}</Text>
      </View>
    </View>
  );
};

export default Partner;
