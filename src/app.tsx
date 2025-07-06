import { FC, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import configStore from "./store";
import "./app.scss";

const store = configStore();

const NextApp: FC<PropsWithChildren> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default NextApp;
