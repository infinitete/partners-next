export interface AppletUser {
  id: number;
  auth: boolean;
  name: string;
  oepnid: string;
  createdAt: number;
  updatedAt: number;
}

export interface Code2SessionResult {
  token?: string;
  openid?: string;
  session_key: string;
  errmsg?: string;
  errcode?: number;
  user?: AppletUser;
}

export const SET_USER = "SET_USER";
