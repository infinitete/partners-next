import { FC, useCallback, useState } from "react";
import { View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";

import Input from "@/comps/input";
import Picker from "@/comps/picker";
import Button from "@/comps/button";

import R from "@/requestor";

import { POSITIONS } from "@/constants/partner";

import "./add.scss";
import { useSelector } from "react-redux";
import { ReducersType } from "@/reducers";

const namePattern = /^[\u4e00-\u9fa5]{2,6}$/;
const phonePattern =
  /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(16[0-9]{1})|(17[0-9]{1})|(19[0-9]{1})|(18[0-9]{1}))+\d{8})$/;

const Index: FC = () => {
  const [pid, setPid] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState(0);

  const user = useSelector((r: ReducersType) => r.AppletUser);

  useLoad((data: { partner: string }) => {
    if (user == null) {
      Taro.navigateBack();
      return;
    }

    if (data.partner == "" || data.partner == undefined) {
      Taro.navigateBack();
      return;
    }
    let pid = parseInt(data.partner);
    if (Number.isNaN(pid)) {
      Taro.navigateBack();
      return;
    }
    setPid(pid);
  });

  const onSubmit = useCallback(async () => {
    if (namePattern.test(name) == false) {
      Taro.showToast({ title: "名字为2－6个中文字", icon: "none" });
      return;
    }

    if (phonePattern.test(phone) == false) {
      Taro.showToast({ title: "请输入正确的手机号", icon: "none" });
      return;
    }

    try {
      Taro.showLoading({ title: "正在提交..." });
      const res = await R.createEmployee(pid, name, phone, POSITIONS[position]);
      if (res.code != 0) {
        throw res.msg;
      }
      Taro.hideLoading();
      Taro.showToast({ title: "添加成功", icon: "success" });
      setName("");
      setPhone("");
      setPosition(0);
    } catch (e) {
      Taro.hideLoading();
      Taro.showToast({ title: "添加失败", icon: "error" });
    }
  }, [pid, name, phone, position, setName, setPhone, setPosition]);

  console.log("position", position);

  return (
    <View className="page">
      <View className="form-wrapper">
        <View className="mention">请填写联系人的必要信息</View>
        <View className="items">
          <Input
            title="姓名"
            value={name}
            placeholder="联系人姓名"
            onInput={(e) => setName(e.detail.value)}
          />

          <Input
            title="联系电话"
            value={phone}
            type="number"
            placeholder="联系电话"
            onInput={(e) => setPhone(e.detail.value)}
          />

          <Picker
            title="职务"
            placeholder="联系人职务"
            defaultValue={position}
            value={position}
            range={POSITIONS}
            onChange={(e) => {
              setPosition(parseInt(`${e.detail.value}`));
            }}
          />
        </View>
      </View>

      <View className="btn-wrapper">
        <Button onClick={onSubmit}>提交</Button>
      </View>
    </View>
  );
};

export default Index;
