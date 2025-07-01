import { View, Input as WxInput } from "@tarojs/components";
import InputProps from "@tarojs/components/types/Input";
import { FC } from "react";

export type Props = {
  title: string;
} & InputProps.InputProps;

const Input: FC<Props> = (props: Props) => {
  return (
    <View className="app-form-wrapper">
      <View className="title">{props.title}</View>
      <View className="input-wrapper">
        <WxInput {...props} placeholderClass="input-placeholder" />
      </View>
    </View>
  );
};

export default Input;
