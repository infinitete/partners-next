import { FC, useCallback, useState } from "react";
import { View } from "@tarojs/components";
import { Viewer, Picker } from "./imager/index";

interface ImagerMode {
  viwer: string;
  picker: string;
}

export interface ImagerProps {
  title: string;
  count: number;
  mode: keyof ImagerMode;
  items?: string[];
  removable?: boolean;
  onChange: (paths: string[], index: number) => void;
}

interface ItemProps {
  url?: string;
  mode: keyof ImagerMode;
  onSuccess: (path: string) => void;
  onError?: () => void;
}

const Item: FC<ItemProps> = ({ onSuccess, mode, onError, url }) => {
  const [path, setPath] = useState(url ?? "");

  const onChange = (path: string) => {
    setPath(path);
    onSuccess(path);
  };

  const showView = mode == "viwer" || (mode == "picker" && path != "");
  const showPicker = mode == "picker" && path == "";

  return (
    <View className="item">
      <Viewer
        hide={!showView}
        path={path}
        onRemove={mode == "picker" ? (_) => onChange("") : undefined}
      />
      <Picker hide={!showPicker} onChange={onChange} onError={onError} />
    </View>
  );
};

const Imager: FC<ImagerProps> = ({ title, count, mode, onChange, items }) => {
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
      onChange(nextPaths, idx);
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
            mode={mode}
            key={getItem(idx) ?? idx}
            url={getItem(idx)}
            onSuccess={(path: string) => onItemsChange(idx, path)}
          />
        ))}
      </View>
    </View>
  );
};

export default Imager;
