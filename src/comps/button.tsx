import { ITouchEvent, View } from "@tarojs/components";
import { FC } from "react";

export interface ButtonProps {
  children?: React.ReactNode;
  rev?: boolean;
  onClick?: (evt: ITouchEvent) => void;
}

const Button: FC<ButtonProps> = ({ children, rev, onClick }) => {
  return (
    <View onClick={onClick} className={rev ? "app-btn-rev" : "app-btn"}>
      {children}
    </View>
  );
};

export default Button;
