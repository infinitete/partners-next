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
  defaultValue?: number;
  range: string[];
} & PickerProps.PickerSelectorProps;

const Input: FC<Props> = (props: Props) => {
  const [selected, setSelected] = useState(3);

  return (
    <View className="app-form-wrapper">
      <View className="title">{props.title}</View>
      <View className="input-wrapper">
        <WxPicker
          mode="selector"
          {...props}
          defaultValue={selected}
          onChange={(s) => {
            setSelected(s.detail.value as number);
            if (props.onChange) {
              props.onChange(s);
            }
          }}
        >
          <WxInput
            defaultValue={props.range[props.defaultValue ?? 0].toString()}
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

export default Input;
