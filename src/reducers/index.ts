import { combineReducers } from "redux";
import AppletUser from "./user";

const reducers = combineReducers({
  AppletUser,
});

export default reducers;
export type ReducersType = ReturnType<typeof reducers>;
