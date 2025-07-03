import { FC, useState } from "react";
import { View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { Employee } from "@/constants/partner";
import Empty from "@/comps/empty";
import EmployeyComp from "@/comps/employee";
import Button from "@/comps/button";
import "./list.scss";

const Index: FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useLoad(async (data: { partner: string }) => {
    const ext = Taro.getStorageSync<Employee[]>(`employees-${data.partner}`);
    setEmployees(ext);
    Taro.removeStorage({ key: `employees-${data.partner}` });
  });

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
        <Button>添加联系人</Button>
      </View>
    </View>
  );
};

export default Index;
