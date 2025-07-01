import { FC, useCallback, useEffect, useState } from "react";
import { View, Image, Text, Radio } from "@tarojs/components";
import LogoImg from "@/assets/logo.png";
import Button from "@/comps/button";

import "./indexs.scss";
import Taro from "@tarojs/taro";
import { useDispatch, useSelector } from "react-redux";
import { ReducersType } from "@/reducers";
import R from "@/requestor";
import { Code2SessionResult, SET_USER } from "@/constants/user";

const Index: FC = () => {
  const [agree, setAgree] = useState(false);
  const appletUser = useSelector((r: ReducersType) => r.AppletUser);
  const dispatch = useDispatch();

  const onAggreeTextClick = useCallback((page: string) => {
    Taro.navigateTo({ url: page });
  }, []);

  const onLoginBtnClick = useCallback(async () => {
    if (!agree) {
      Taro.showToast({ title: "请先同意协议", icon: "none" });
      return;
    }

    try {
      Taro.showLoading({ title: "登录中" });
      const code = await Taro.login({});
      const res = await R.login<Code2SessionResult>({ jsCode: code.code });
      if (res.code != 0) {
        throw res.msg;
      }
      const now = Math.ceil(new Date().getTime() / 1000);
      Taro.setStorage({
        key: "token",
        data: { token: res.data.token, expire: now + 7 * 3600 * 24 },
      });
      dispatch({ type: SET_USER, user: res.data.user });
      Taro.hideLoading();
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: "登录失败", icon: "error" });
    }
  }, [agree]);

  useEffect(() => {
    if (appletUser != null) {
      Taro.navigateBack({ delta: -1 });
    }
  }, [appletUser]);

  return (
    <View className="container">
      <View className="flex-1">&nbsp;</View>
      <View className="main">
        <View className="logo-wrapper">
          <View className="icon">
            <Image src={LogoImg} />
          </View>
          <View className="title">信息采集助手</View>
        </View>
      </View>
      <View className="btn-wrapper">
        <Button onClick={() => onLoginBtnClick()}>一键登录</Button>
      </View>
      <View className="agreement">
        <View className="radio-wrapper">
          <Radio
            className="radio"
            color="#0191ff"
            value={`${agree}`}
            checked={agree}
            onClick={() => setAgree(!agree)}
            onChange={(_) => setAgree(!agree)}
          />
        </View>
        <View className="texts-wapper">
          <Text>我已经阅读</Text>
          <Text
            className="link"
            onClick={() => onAggreeTextClick("/pages/agreement/yinsi/index")}
          >
            隐私协议
          </Text>
          <Text>、</Text>
          <Text
            className="link"
            onClick={() => onAggreeTextClick("/pages/agreement/user/index")}
          >
            用户服务协议
          </Text>
          <Text>，并同意协议内容</Text>
        </View>
      </View>
      <View className="flex-1">&nbsp;</View>
    </View>
  );
};

export default Index;
