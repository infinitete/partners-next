import {
  View,
  Image,
  Input as WxInput,
  Picker as WxPicker,
} from "@tarojs/components";
import PickerProps from "@tarojs/components/types/Picker";
import { FC, useState } from "react";
import CaretRightIcon from "@/assets/icons/caret-right.svg";

export type Props = {
  title: string;
  placeholder?: string;
  onSelected?: (code: string[], value: string[]) => void;
} & PickerProps.PickerRegionProps;

const Picker: FC<Props> = (props: Props) => {
  const [selected, setSelected] = useState<{ code: string[]; value: string[] }>(
    {
      code: [],
      value: [],
    },
  );

  return (
    <View className="app-form-wrapper">
      <View className="title">{props.title}</View>
      <View className="input-wrapper">
        <WxPicker
          mode="region"
          {...props}
          onChange={(s) => {
            const { code, value } = s.detail;
            setSelected({ code, value: value.filter((v) => v != "全部") });
            if (props.onSelected) {
              props.onSelected(
                value.filter((v) => v != "全部"),
                code,
              );
            }
          }}
        >
          <WxInput
            value={selected.value.join("/")}
            placeholder={props.placeholder}
            placeholderClass="input-placeholder"
            disabled
          />
        </WxPicker>
        <Image className="caret" src={CaretRightIcon} />
      </View>
    </View>
  );
};

export default Picker;
