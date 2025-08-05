import logger from "redux-logger";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "@/reducers";

export default function configStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getter) =>
      process.env.NODE_ENV?.toLowerCase() === "development"
        ? getter().concat(logger)
        : getter(),
  });
}
