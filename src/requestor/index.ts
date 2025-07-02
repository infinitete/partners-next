import Taro, { request as TaroRequest } from "@tarojs/taro";
import MD5 from "md5";
import * as Base64 from "js-base64";
import B64HmacSha1 from "../utils/hmac_sha1";

const POST = "POST";
const GET = "GET";

interface Method {
  /** HTTP 请求 OPTIONS */
  OPTIONS;
  /** HTTP 请求 GET */
  GET;
  /** HTTP 请求 HEAD */
  HEAD;
  /** HTTP 请求 POST */
  POST;
  /** HTTP 请求 PUT */
  PUT;
  /** HTTP 请求 PATCH */
  PATCH;
  /** HTTP 请求 DELETE */
  DELETE;
  /** HTTP 请求 TRACE */
  TRACE;
  /** HTTP 请求 CONNECT */
  CONNECT;
}

export namespace Requestor {
  export const SERVER = "http://192.168.2.8:8000";

  export const OSS_SERVER = "https://oss.trailerman.cn";
  export const ALI_OSS = "https://tcx.oss-cn-chengdu.aliyuncs.com";

  export async function _request<T>(
    url: string,
    method: keyof Method,
    headers?: { [x: string]: any },
    body?: any,
  ): Promise<{ data: T; header: { [x: string]: any } }> {
    let req = await TaroRequest({
      url,
      method,
      header: headers,
      data: body,
    });

    let { data, statusCode, header } = req;
    if (statusCode === 403) {
      const _data: any = { code: 403, err: "登陆过期" };
      return { data: _data, header };
    }

    if (statusCode !== 200) {
      throw new Error(`StatusCode: ${statusCode}`);
    }

    return {
      data,
      header,
    };
  }

  export namespace Options {
    // 服务器返回结果
    export type Result<T> = {
      code: number;
      msg: string;
      data: T;
    };

    // 登录参数
    export type LoginParam = {
      jsCode: string;
    };
  }

  export namespace OSS {
    const ossKey = "438zaYRJTbQ";
    const ossSecret = "brj6mf9peycyy";

    type Credentials = {
      access_key_id: string;
      access_key_secret: string;
      expiration: number;
      security_token: string;
    };

    type Result<T> = {
      action: string;
      desc: string;
      error: string;
      result: T;
    };

    export const getSignature = () => {
      let timestamp = Math.ceil(new Date().getTime() / 1000);
      let signature = MD5(`${ossKey}-${timestamp}-${ossSecret}`);

      return {
        timestamp,
        signature,
      };
    };

    export const getOssCredentials = async () => {
      let { timestamp, signature } = getSignature();
      let url = `${OSS_SERVER}/api/v1/sts/ak?access_key=${ossKey}&timestamp=${timestamp}&signature=${signature}`;
      let res = await Taro.request<Credentials>({
        url,
        method: GET,
      });

      return res.data;
    };

    // 上传文件到阿里云OSS
    export const uploadToOSS = async (
      ak: Credentials,
      filePath: string,
      name: string,
    ) => {
      const date = new Date();
      date.setHours(date.getHours() + 1);
      const policyText = {
        expiration: date.toISOString(), // 设置policy过期时间。
        conditions: [
          // 限制上传大小。
          ["content-length-range", 0, 1024 * 1024 * 1024],
        ],
      };

      const policy = Base64.encode(JSON.stringify(policyText)); // policy必须为base64的string。
      const signature = B64HmacSha1(ak.access_key_secret, policy);

      const formData = {
        OSSAccessKeyId: ak.access_key_id,
        signature: signature,
        key: name,
        policy,
        "x-oss-security-token": ak.security_token,
      };

      await Taro.uploadFile({
        url: ALI_OSS,
        filePath,
        formData: formData,
        name: "file",
      });

      return `${ALI_OSS}/${name}`;
    };

    // saveFile
    // 保存上传好的文件内容到服务器
    export const saveFile = async (
      url: string,
      feature: string,
      uploader: string,
      contentType: string,
    ) => {
      let form = JSON.stringify({
        url,
        feature,
        uploader,
        content_type: contentType,
      });

      let { timestamp, signature } = getSignature();
      let path = `${OSS_SERVER}/api/v1/file/save?timestamp=${timestamp}&access_key=${ossKey}&signature=${signature}`;
      let res = await Taro.request<Result<string>>({
        url: path,
        method: "POST",
        data: form,
      });

      if (res.statusCode == 200 && res.data.error == "") {
        return res.data.result;
      }

      if (res.statusCode != 200) {
        throw new Error(res.errMsg);
      }

      throw new Error(res.data.error);
    };

    export const redirectToImage = (oid: string) => {
      return `${OSS_SERVER}/api/v1/file/oid/${oid}`;
    };
  }

  export class Instance {
    protected server: string = "";
    protected headers = {
      "X-Token": "",
      "Content-Type": "application/json",
    };

    constructor(server: string) {
      this.server = server;
      this.headers["X-Token"] = (() => {
        let token = Taro.getStorageSync<{
          token: string;
          expire: number;
        } | null>("token");

        if (token == null) {
          return "";
        }
        if (token.expire < new Date().getTime() / 1000) {
          return "";
        }
        return `Bearer ${token.token}`;
      })();
    }

    protected async doRequest<T>(
      url: string,
      method: keyof Method,
      body?: any,
    ): Promise<Requestor.Options.Result<T>> {
      try {
        const token = Taro.getStorageSync<{ token: string; expire: number }>(
          "token",
        );
        if (token != null) {
          const now = Math.ceil(new Date().getTime() / 1000) - 3600;
          if (token.expire > now) {
            this.headers["X-Token"] = `Bearer ${token.token}`;
          }
        }
      } catch (err) {
        console.log(err, "res");
      }

      let { data } = await _request<Requestor.Options.Result<T>>(
        url,
        method,
        this.headers,
        body,
      );

      return data;
    }

    // 登录
    async login<T>(
      params: Requestor.Options.LoginParam,
    ): Promise<Requestor.Options.Result<T>> {
      return await this.doRequest<T>(
        `${this.server}/v2/applet/openid`,
        POST,
        JSON.stringify(params),
      );
    }

    // 认证
    async auth<T>(
      name: string,
      code: string,
    ): Promise<Requestor.Options.Result<T>> {
      return await this.doRequest<T>(
        `${this.server}/v2/applet/auth`,
        POST,
        JSON.stringify({ name, code }),
      );
    }

    // 分页获取已采集合作伙伴
    async pagePartner<T>(
      page: number,
      size: number,
      query: string,
    ): Promise<Requestor.Options.Result<T>> {
      return await this.doRequest<T>(
        `${this.server}/v2/applet/partners/page?page=${page}&size=${size}&query=${query}`,
        GET,
      );
    }
  }
}

export default new Requestor.Instance(Requestor.SERVER);
