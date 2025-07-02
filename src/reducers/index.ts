import { combineReducers } from "redux";
import AppletUser from "./user";
import Partners from "./partner";

const reducers = combineReducers({
  AppletUser,
  Partners,
});

export default reducers;
export type ReducersType = ReturnType<typeof reducers>;
