import { View, Text } from "@tarojs/components";
import { FC } from "react";

interface ItemProps {
  label: string;
  value: string;
  id: number;
}

export interface DescriptionProps {
  title?: string;
  items: ItemProps[];
}

const Item: FC<ItemProps> = ({ label, value }) => {
  return (
    <View className="item">
      <View className="label">{label}</View>
      <View className="value">{value}</View>
    </View>
  );
};

const Button: FC<DescriptionProps> = ({ title, items }) => {
  return (
    <View className="app-description">
      <View className="title" style={{ display: title ? "block" : "none" }}>
        <Text>{title}</Text>
      </View>
      <View>
        {items.map((item) => (
          <Item {...item} key={item.id} />
        ))}
      </View>
    </View>
  );
};

export default Button;
