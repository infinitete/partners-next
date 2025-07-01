export default defineAppConfig({
  pages: [
    "pages/auth/index",
    "pages/auth/code",
    "pages/index/index",
    "pages/login/index",
    "pages/agreement/user/index",
    "pages/agreement/yinsi/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "wa",
    navigationBarTextStyle: "black",
  },
  permission: {
    "scope.userLocation": {
      desc: "你的位置信息将用于小程序位置接口的效果展示",
    },
  },
  requiredPrivateInfos: ["getLocation"],
});
