import { combineReducers } from "redux";
import AppletUser from "./user";
import Partners, { NearlyPartners } from "./partner";

const reducers = combineReducers({
  AppletUser,
  Partners,
  NearlyPartners,
});

export default reducers;
export type ReducersType = ReturnType<typeof reducers>;
