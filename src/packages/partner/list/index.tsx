import PartnerComp from "@/comps/partner";
import { Image, Input, View, ScrollView } from "@tarojs/components";
import { FC, useCallback, useEffect, useState } from "react";

import { ReducersType } from "@/reducers";
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";

import { pagePartners } from "@/actions";
import SearchIcon from "@/assets/icons/search.svg";
import BackspaceIcon from "@/assets/icons/backspace.svg";
import { PageData, PageQuerier } from "@/constants/common";
import { Partner, PartnerQuerier } from "@/constants/partner";
import R from "@/requestor";
import Taro, { useDidShow } from "@tarojs/taro";

const map = {
  name: "名称",
  district: "区域",
  phone: "手机",
};

const Index: FC = () => {
  const [req, setReq] = useState(false);
  const dispatch = useDispatch();
  const partners = useSelector((r: ReducersType) => r.Partners);
  const [queryMap, setQueryMap] = useState<{ key: string; value: string }[]>(
    [],
  );

  const getQueryMap = useCallback((query: PartnerQuerier) => {
    if (query == null) {
      return undefined;
    }

    let s: { key: string; value: string }[] = [];

    for (let k in query) {
      let v: string = map[k];
      if (query[k]) {
        s.push({ key: v, value: query[k] });
      }
    }

    return s;
  }, []);

  useDidShow(() => {
    const q = getQueryMap(partners.query) ?? [];
    setQueryMap(q);
  });

  const onSearchClick = useCallback(
    (from: string) => {
      if (from == "icon") {
        const { query } = partners;
        if (query) {
          getData(1, partners.size);
          return;
        }
      } else if (from == "input") {
        Taro.navigateTo({ url: "/packages/partner/search/index" });
      }
    },
    [partners],
  );

  const getData = useCallback(
    async (page: number = 1, size: number = 10, query?: PartnerQuerier) => {
      setReq(true);

      let q: PageQuerier<PartnerQuerier> = {
        page,
        size,
        query,
      };

      try {
        Taro.showLoading();
        const res = await R.pagePartner<
          PageData<Partner, PageQuerier<PartnerQuerier>>,
          PartnerQuerier
        >(q);
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
        if (query != null) {
          setQueryMap(getQueryMap(query) ?? []);
        } else {
          setQueryMap([]);
        }
      } catch (e) {
        Taro.hideLoading();
        Taro.showToast({ title: "获取数据失败", icon: "none" });
        setReq(false);
      }
    },
    [setReq, partners, getQueryMap, setQueryMap],
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
        <View className="input" onClick={() => onSearchClick("input")}>
          <Input
            disabled
            placeholderStyle={
              "text-overflow: ellipsis; overflow:hidden; white-space: nowrap; font-size: 12px;"
            }
            placeholder={
              queryMap.length > 0
                ? queryMap.map((k) => `${k.key}:${k.value}`).join(" ")
                : `搜索`
            }
          />
        </View>
        <View className="icon" onClick={() => onSearchClick("icon")}>
          <Image src={partners.query ? BackspaceIcon : SearchIcon} />
        </View>
      </View>
      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={req}
        onRefresherRefresh={() =>
          getData(1, partners.size, partners.query ?? "")
        }
        lowerThreshold={32}
        onScrollToLower={() => {
          if (partners.payload.length < partners.total) {
            getData(partners.page + 1, partners.size, partners.query ?? "");
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
