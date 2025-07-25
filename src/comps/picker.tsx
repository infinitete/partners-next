import {
  View,
  Image,
  Input as WxInput,
  Picker as WxPicker,
} from "@tarojs/components";
import PickerProps from "@tarojs/components/types/Picker";
import { FC, useState } from "react";
import CaretRightIcon from "@/assets/icons/caret-right.svg";

import RegionPicker from "./pickers/region";

export type Props = {
  title: string;
  placeholder?: string;
  defaultValue?: number;
  range: string[];
} & PickerProps.PickerSelectorProps;

const Picker: FC<Props> = (props: Props) => {
  const [selected, setSelected] = useState(props.defaultValue ?? 0);

  return (
    <View className="app-form-wrapper">
      <View className="title">{props.title}</View>
      <View className="input-wrapper">
        <WxPicker
          mode="selector"
          {...props}
          defaultValue={selected}
          onChange={(s) => {
            setSelected(parseInt(`${s.detail.value}`));
            if (props.onChange) {
              props.onChange(s);
            }
          }}
        >
          <WxInput
            value={props.range[selected].toString()}
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

export { RegionPicker };
export default Picker;
