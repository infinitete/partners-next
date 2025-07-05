import { View, Image } from "@tarojs/components";
import { FC, useCallback } from "react";
import Taro from "@tarojs/taro";
import AddIcon from "@/assets/icons/add.svg";

export interface PickerProps {
  onError?: () => void;
  hide?: boolean;
  onChange: (path: string) => void;
}

const Index: FC<PickerProps> = ({ onChange, onError, hide }) => {
  const style = {
    display: hide ? "none" : "block",
  };

  const onImageClick = useCallback(async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ["camera", "album"],
      });
      onChange(res.tempFilePaths[0]);
    } catch (e) {
      onError ? onError() : console.error(e);
    }
  }, []);

  return (
    <View className="image-picker" style={style}>
      <View className="add-icon" onClick={onImageClick}>
        <Image src={AddIcon} />
      </View>
    </View>
  );
};

export default Index;
