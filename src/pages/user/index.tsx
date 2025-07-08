import { setUser } from "@/actions";
import Button from "@/comps/button";
import { ReducersType } from "@/reducers";
import { Text, View, Image } from "@tarojs/components";
import Taro, { useDidShow } from "@tarojs/taro";
import { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";

import SettingIcon from "@/assets/icons/setting.svg";

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
    if (user != null) {
      Taro.showModal({
        title: "确认",
        content: "确认要退出登录吗?",
        success: (s) => (s.confirm ? dispatch(setUser(null)) : ""),
      });
    } else {
      Taro.navigateTo({ url: "/pages/login/index" });
    }
  }, [user]);

  return (
    <View className="page">
      <View className="main">
        <View className="user-wrapper block-wrapper">
          <View className="name">
            <Text>{user?.name ?? "未认证"}</Text>
          </View>
          <View className="summary flex-1">
            <Image className="setting-icon" src={SettingIcon} />
          </View>
        </View>
        <View
          className="actions-wrapper block-wrapper"
          style={{ display: "none" }}
        ></View>
      </View>
      <View className="btn-wrapper">
        <Button rev={user != null} onClick={onLogoutBtnClick}>
          {user != null ? "退出登录" : "登录"}
        </Button>
      </View>
    </View>
  );
};

export default Index;
