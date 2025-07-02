import ContactImg from "@/assets/icons/contact.png";
import Button from "@/comps/button";
import Captcha from "@/comps/captcha";
import { AppletUser, SET_USER } from "@/constants/user";
import R from "@/requestor";
import { Image, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { FC, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import "./code.scss";

// 验证码个数
const count = 4;

const Index: FC = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const dispatch = useDispatch();

  useLoad((p: { name: string }) => {
    setName(p.name);
  });

  const [focus, setFocus] = useState(0);
  const onCaptchaInput = useCallback(
    (value: string, pos: number) => {
      const del = value.length < code.length;
      if (del && pos > 0) {
        setFocus(pos - 1);
      }

      if (!del && pos < count - 1) {
        setFocus(pos + 1);
      }

      setCode(value);
    },
    [code, setCode, setFocus],
  );

  const onAuthBtnClick = useCallback(async () => {
    if (code.length != count) {
      console.log(code, name);
      Taro.showToast({ title: "请输入验证码", icon: "none" });
      return;
    }

    try {
      Taro.showLoading();
      const res = await R.auth<AppletUser>(name, code);
      Taro.hideLoading();

      if (res.code != 0) {
        Taro.showToast({ title: res.msg, icon: "error" });
        return;
      }
      dispatch({ type: SET_USER, user: res.data });
      Taro.showToast({ title: "认证成功", icon: "success" });
      const t = setTimeout(() => {
        Taro.navigateTo({ url: "/pages/index/index" });
        clearTimeout(t);
      }, 2000);
    } catch (e) {
      Taro.hideLoading();
    }
  }, [code, name]);

  return (
    <View className="page">
      <View className="main">
        <View className="head">
          <View className="image-wrapper">
            <Image src={ContactImg} />
          </View>
          <View className="text-wrapper">
            <View className="title">
              <Text>对暗号</Text>
            </View>
            <View className="desc">
              <Text>我们设置了一个暗号，以便核实您的真实身份。</Text>
            </View>
          </View>
        </View>
        <View className="form">
          <Captcha focus={focus} count={count} onInput={onCaptchaInput} />
        </View>
      </View>

      <View className="btn-wrapper">
        <Button onClick={onAuthBtnClick}>认证</Button>
      </View>
    </View>
  );
};

export default Index;
