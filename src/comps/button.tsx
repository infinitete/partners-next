import { ITouchEvent, View } from "@tarojs/components";
import { FC } from "react";

export interface ButtonProps {
  children?: React.ReactNode;
  rev?: boolean;
  disabled?: boolean;
  onClick?: (evt: ITouchEvent) => void;
}

const Button: FC<ButtonProps> = ({ children, rev, onClick, disabled }) => {
  return (
    <View
      onClick={!disabled ? onClick : () => {}}
      className={rev ? "app-btn-rev" : "app-btn"}
    >
      {children}
    </View>
  );
};

export default Button;
