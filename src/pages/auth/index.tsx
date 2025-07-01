import { View, Image, Text } from "@tarojs/components";
import { FC, useCallback, useState } from "react";
import "./index.scss";
import Button from "@/comps/button";
import ContactImg from "@/assets/icons/contact.png";
import Input from "@/comps/input";
import Taro from "@tarojs/taro";

const Index: FC = () => {
  const [name, setName] = useState("");
  const onNextBtnClick = useCallback(() => {
    if (name.trim().length == 0) {
      Taro.showToast({ title: "请输入姓名", icon: "none" });
      return;
    }
    const regex = /[\u4e00-\u9fa5]{2,5}/g;
    if (!regex.test(name)) {
      Taro.showToast({ title: "姓名为2－5个中文字", icon: "none" });
      return;
    }

    Taro.navigateTo({
      url: `/pages/auth/code?name=${name}`,
    });
  }, [name]);

  const onNameInput = useCallback(
    (e: any) => {
      setName(e.detail.value);
    },
    [setName],
  );

  return (
    <View className="container">
      <View className="main">
        <View className="head">
          <View className="image-wrapper">
            <Image src={ContactImg} />
          </View>
          <View className="text-wrapper">
            <View className="title">
              <Text>验证您的信息</Text>
            </View>
            <View className="desc">
              <Text>为了保证信息的真实性，我们需要获得您的真实姓名。</Text>
            </View>
          </View>
        </View>

        <View className="form">
          {
            <Input
              type="text"
              title="你的姓名"
              placeholder="请输入您的真实姓名"
              onInput={onNameInput}
            />
          }
        </View>
      </View>

      <View className="btn-wrapper">
        <Button onClick={() => onNextBtnClick()}>下一步</Button>
      </View>
    </View>
  );
};

export default Index;
