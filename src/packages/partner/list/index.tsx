import PartnerComp from "@/comps/partner";
import { Image, Input, View, ScrollView } from "@tarojs/components";
import { FC, useCallback, useEffect, useState } from "react";

import { ReducersType } from "@/reducers";
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";

import { pagePartners } from "@/actions";
import SearchIcon from "@/assets/icons/search.svg";
import { PageData } from "@/constants/common";
import { Partner } from "@/constants/partner";
import R from "@/requestor";
import Taro from "@tarojs/taro";

const Index: FC = () => {
  const [req, setReq] = useState(false);
  const dispatch = useDispatch();
  const partners = useSelector((r: ReducersType) => r.Partners);

  const getData = useCallback(
    async (page: number = 1, size: number = 10, query: string = "") => {
      setReq(true);
      try {
        Taro.showLoading();
        const res = await R.pagePartner<PageData<Partner>>(page, size, query);
        Taro.hideLoading();
        if (res.code != 0) {
          throw res.msg;
        }
        const nextData = { ...res.data };
        if (page > 1) {
          nextData.payload = partners.payload.concat(res.data.payload);
        }
        dispatch(pagePartners(nextData));
        setReq(false);
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "获取数据失败", icon: "none" });
        setReq(false);
      }
    },
    [setReq, partners],
  );

  const onItemClick = useCallback((item: Partner) => {
    Taro.navigateTo({ url: `/packages/partner/details/index?id=${item.id}` });
  }, []);

  useEffect(() => {
    if (partners.page == 0) {
      getData();
    }
  }, []);

  return (
    <View className="page" style={{ height: "100vh" }}>
      <View className="search-wrapper">
        <View className="input">
          <Input placeholder="搜索" />
        </View>
        <View className="icon">
          <Image src={SearchIcon} />
        </View>
      </View>
      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={req}
        onRefresherRefresh={() => getData()}
        lowerThreshold={32}
        onScrollToLower={() => {
          if (partners.payload.length < partners.total) {
            getData(partners.page + 1, partners.size, partners.query);
          }
        }}
        className="list-wrapper"
      >
        {partners.payload.map((p) => (
          <View className="item" key={p.id}>
            <PartnerComp partner={p} onClick={() => onItemClick(p)} hover />
          </View>
        ))}
      </ScrollView>

      <View className="indicator-wrapper">
        {partners.payload.length}/{partners.total}
      </View>
    </View>
  );
};

export default Index;
