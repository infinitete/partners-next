import { FC } from "react";
import { View, Image } from "@tarojs/components";
import AddIcon from "@/assets/icons/add.svg";

export interface ImagerProps {
  title: string;
  count: number;
}

const Item: FC = () => {
  return (
    <View className="item">
      <View className="add-icon">
        <Image src={AddIcon} />
      </View>
    </View>
  );
};

const Imager: FC<ImagerProps> = ({ title, count }) => {
  const q = new Array(count).fill(0);

  return (
    <View className="app-imager">
      <View className="title">{title}</View>
      <View className="items">
        {q.map((_, idx) => (
          <Item key={idx} />
        ))}
      </View>
    </View>
  );
};

export default Imager;
