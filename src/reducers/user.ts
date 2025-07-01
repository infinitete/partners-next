import { AppletUser, SET_USER } from "@/constants/user";
import Taro from "@tarojs/taro";

const getUserFromStorage = () => {
  const token = Taro.getStorageSync<{ token: string; expire: number }>("token");
  if (token == undefined) {
    return null;
  }
  const now = Math.ceil(new Date().getTime() / 1000) - 3600;
  if (token.expire < now) {
    Taro.removeStorage({ key: "token" });
    return null;
  }

  const user = Taro.getStorageSync<AppletUser>("user");
  if (user == undefined) {
    return null;
  }

  return user;
};

const User = (
  state: AppletUser | null = getUserFromStorage(),
  action: { type: string; user: AppletUser | null },
) => {
  if (action.type === SET_USER) {
    if (action.user == null) {
      Taro.removeStorage({ key: "user" });
    } else {
      Taro.setStorage({ key: "user", data: action.user });
    }

    return action.user;
  }

  return state;
};

export default User;
