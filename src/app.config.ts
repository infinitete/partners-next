export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/user/index",
    "pages/login/index",
    "pages/auth/index",
    "pages/auth/code",
    "pages/agreement/user/index",
    "pages/agreement/yinsi/index",
  ],
  tabBar: {
    selectedColor: "#0fb3ff",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "./assets/tabbar/home_default.png",
        selectedIconPath: "./assets/tabbar/home_active.png",
      },
      {
        pagePath: "pages/user/index",
        text: "我的",
        iconPath: "./assets/tabbar/user_default.png",
        selectedIconPath: "./assets/tabbar/user_active.png",
      },
    ],
  },
  subPackages: [
    {
      root: "packages/partner",
      pages: [
        "list/index",
        "create/index",
        "success/index",
        "details/index",
        "employee/list",
        "employee/add",
        "search/index",
        "edit/index",
      ],
    },
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#F5F7FA",
    navigationBarTitleText: "合作伙伴信息采集助手",
    navigationBarTextStyle: "black",
  },
  permission: {
    "scope.userLocation": {
      desc: "你的位置信息将用于小程序位置接口的效果展示",
    },
  },
  requiredPrivateInfos: ["getLocation", "chooseLocation"],
});
