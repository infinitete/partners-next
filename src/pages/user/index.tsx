import { View } from "@tarojs/components";
import { FC, useCallback } from "react";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { ReducersType } from "@/reducers";
import Taro, { useDidShow } from "@tarojs/taro";
import Button from "@/comps/button";
import { setUser } from "@/actions";

const Index: FC = () => {
  // 从状态管理器中读取当前登录用户
  const user = useSelector((r: ReducersType) => r.AppletUser);

  // 一旦显示该页面，判断有没有登录
  // 没有登录的话跳转到登录页
  useDidShow(() => {
    if (user == null) {
      Taro.navigateTo({ url: "/pages/login/index" });
    }
  });

  const dispatch = useDispatch();
  const onLogoutBtnClick = useCallback(() => {
    dispatch(setUser(null));
  }, []);

  return (
    <View className="page">
      <View className="main">
        <View className="user-wrapper block-wrapper"></View>
        <View className="actions-wrapper block-wrapper"></View>
      </View>
      <View className="btn-wrapper">
        <Button onClick={onLogoutBtnClick}>退出登录</Button>
      </View>
    </View>
  );
};

export default Index;
