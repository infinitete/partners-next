import { View, Image } from "@tarojs/components";
import { FC, useCallback } from "react";
import Taro from "@tarojs/taro";
import ClearIcon from "@/assets/icons/clear.svg";

export interface PickerProps {
  path: string;
  hide?: boolean;
  onRemove?: (path: string) => void;
}

const Index: FC<PickerProps> = ({ path, hide, onRemove }) => {
  const style = {
    display: hide ? "none" : "block",
  };
  const onImageClick = useCallback(() => {
    Taro.previewImage({ urls: [path] });
  }, [path]);

  return (
    <View className="app-image-view" style={style}>
      <View className="image" onClick={onImageClick}>
        <Image className="image" src={path} />
        <View
          className="clear-icon"
          style={{ display: onRemove ? "absolute" : "none" }}
        >
          <Image
            src={ClearIcon}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove ? onRemove(path) : "";
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default Index;
