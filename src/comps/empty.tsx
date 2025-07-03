import SourceIcon from "@/assets/icons/source.svg";
import { Image, Text, View } from "@tarojs/components";
import { FC } from "react";

const Index: FC<{ text: string }> = ({ text }) => {
  return (
    <View className="app-empty">
      <Image className="icon" src={SourceIcon} />
      <Text className="text">{text}</Text>
    </View>
  );
};

export default Index;
