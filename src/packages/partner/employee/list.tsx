import { FC, useCallback, useState } from "react";
import { View } from "@tarojs/components";
import Taro, { useDidShow, useLoad } from "@tarojs/taro";
import { Employee } from "@/constants/partner";
import Empty from "@/comps/empty";
import EmployeyComp from "@/comps/employee";
import Button from "@/comps/button";
import R from "@/requestor";
import "./list.scss";

const Index: FC = () => {
  const [partner, setPartner] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useLoad(async (data: { partner: string }) => {
    setPartner(parseInt(data.partner));
  });

  const getEmpmploees = useCallback(async () => {
    if (partner == 0) {
      return;
    }
    try {
      Taro.showLoading({ title: "获取数据中" });
      const res = await R.getPartnerEmployees<Employee[]>(partner);
      if (res.code != 0) {
        throw res.msg;
      }
      Taro.hideLoading();
      setEmployees(res.data);
    } catch (e) {
      Taro.showToast({ title: "获取数据失败", icon: "none" });
    }
  }, [partner, setEmployees]);

  useDidShow(() => {
    getEmpmploees();
  });

  const onAddButtonClick = useCallback(() => {
    Taro.navigateTo({
      url: `/packages/partner/employee/add?partner=${partner}`,
    });
  }, [partner]);

  return (
    <View className="page" style={{ height: "100vh" }}>
      <View
        className="empty"
        style={{ display: employees.length == 0 ? "flex" : "none" }}
      >
        <View className="flex-1">&nbsp;</View>
        <View className="empty-wrapper">
          <Empty text="没有联系人信息" />
        </View>
        <View className="flex-1">&nbsp;</View>
      </View>

      <View
        className="items"
        style={{ display: employees.length > 0 ? "block" : "none" }}
      >
        {employees.map((e) => (
          <View className="item" key={e.id}>
            <EmployeyComp {...e} />
          </View>
        ))}
      </View>

      <View className="button-wrapper">
        <Button onClick={onAddButtonClick}>添加联系人</Button>
      </View>
    </View>
  );
};

export default Index;
