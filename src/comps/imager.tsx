import { FC, useCallback, useState } from "react";
import { View, Image } from "@tarojs/components";
import AddIcon from "@/assets/icons/add.svg";
import ClearIcon from "@/assets/icons/clear.svg";
import Taro from "@tarojs/taro";

export interface ImagerProps {
  title: string;
  count: number;
  read?: boolean;
  items?: string[];
  onChange: (paths: string[]) => void;
}

interface IterProps {
  read?: boolean;
  url: string;
  onSuccess: (path: string) => void;
  onError?: () => void;
}

const Item: FC<IterProps> = ({ onSuccess, onError, read, url }) => {
  const [path, setPath] = useState(read ? url : "");

  const onImageClick = useCallback(async () => {
    if (path == "") {
      try {
        const res = await Taro.chooseImage({
          count: 1,
          sourceType: ["camera", "album"],
        });
        setPath(res.tempFilePaths[0]);
        onSuccess(res.tempFilePaths[0]);
      } catch (e) {
        onError ? onError() : console.error(e);
      }
    } else {
      Taro.previewImage({
        urls: [path],
      });
    }
  }, [path, setPath]);

  return (
    <View className="item">
      <View
        className="add-icon"
        onClick={onImageClick}
        style={{ display: !read && path == "" ? "flex" : "none" }}
      >
        <Image src={AddIcon} />
      </View>
      <View
        className="selected-pic"
        onClick={onImageClick}
        style={{ display: path == "" ? "none" : "block" }}
      >
        <Image src={path} />
        <View className="clear" style={{ display: read ? "none" : "block" }}>
          <Image
            src={ClearIcon}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPath("");
            }}
          />
        </View>
      </View>
    </View>
  );
};

const Imager: FC<ImagerProps> = ({ title, count, onChange, read, items }) => {
  const q = new Array(count).fill(0);
  const [paths, setPaths] = useState<string[]>([]);

  const getItem = useCallback(
    (idx: number) => {
      if (items == undefined || idx > items.length - 1) {
        return "";
      }

      return items[idx];
    },
    [items],
  );

  const onItemsChange = useCallback(
    (idx: number, path: string) => {
      const nextPaths = [...paths];
      nextPaths[idx] = path;
      setPaths(nextPaths);
      onChange(nextPaths);
    },
    [paths, setPaths],
  );

  return (
    <View className="app-imager">
      <View className="title">
        {title}({count}张)
      </View>
      <View className="items">
        {q.map((_, idx) => (
          <Item
            key={idx}
            read={read}
            url={getItem(idx)}
            onSuccess={(path: string) => onItemsChange(idx, path)}
          />
        ))}
      </View>
    </View>
  );
};

export default Imager;
