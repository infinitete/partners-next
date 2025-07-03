import Taro from "@tarojs/taro";
import { Base64 } from "js-base64";
import HmacSHA1 from "./hmac_sha1";
import MD5 from "md5";

export type AK = {
  security_token: string;
  access_key_secret: string;
  access_key_id: string;
  expiration: string;
};

export type OssObject = {
  oid?: string;
  feature: string;
  uploader: string;
  url: string;
  content_type: string;
  created_at?: number;
};

export type OSSFormParam = {
  OSSAccessKeyId: string;
  signature: string;
  policy: string;
  "x-oss-security-token": string;
  key?: string;
};

const ak_url = "https://oss.trailerman.cn/api/v1/sts/ak";
const os_url = "https://oss.trailerman.cn/api/v1/file/save";
const file_url = (oid: string) =>
  `https://oss.trailerman.cn/api/v1/file/oid/${oid}`;
const key = "438zaYRJTbQ";
const sec = "brj6mf9peycyy";

export const ALIOSS = `https://tcx.oss-cn-chengdu.aliyuncs.com`; //阿里云oss地址

const ak = () => {
  let timestamp = `${Math.ceil(new Date().getTime() / 1000)}`;
  let raw = `${key}-${timestamp}-${sec}`;

  let signature = MD5(raw);
  return `${ak_url}?access_key=${key}&timestamp=${timestamp}&signature=${signature}`;
};

const put = () => {
  let timestamp = `${Math.ceil(new Date().getTime() / 1000)}`;
  let raw = `${key}-${timestamp}-${sec}`;

  let signature = MD5(raw);
  return `${os_url}?access_key=${key}&timestamp=${timestamp}&signature=${signature}`;
};

const getAk = async () => {
  let requestTask = Taro.request({
    method: "GET",
    url: ak(),
    header: { mode: "cors", "content-type": "application/json" },
  });

  let res = await requestTask;
  // requestTask.abort()
  return res.data as AK;
};

const putOssFile = async (obj: OssObject) => {
  let requestTask = Taro.request({
    method: "POST",
    url: put(),
    data: obj,
    header: { mode: "cors", "content-type": "application/json" },
  });

  let res = await requestTask;
  // requestTask.abort();
  return res.data;
};

// 计算签名。
function computeSignature(accessKeySecret: string, canonicalString: string) {
  const hash = HmacSHA1(accessKeySecret, canonicalString);
  return hash;
}

function getFormDataParams(credentials: AK, name: string): OSSFormParam {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const policyText = {
    expiration: date.toISOString(), // 设置policy过期时间。
    conditions: [
      // 限制上传大小。
      ["content-length-range", 0, 1024 * 1024 * 1024 * 10],
    ],
  };
  const policy = Base64.encode(JSON.stringify(policyText)); // policy必须为base64的string。
  const signature = computeSignature(credentials.access_key_secret, policy);
  const formData = {
    OSSAccessKeyId: credentials.access_key_id,
    signature: signature,
    key: `${name}.jpg`,
    policy,
    "x-oss-security-token": credentials.security_token,
  };
  return formData;
}

const getFileByOID = (oid: string) => {
  return file_url(oid);
};

const putFileToAliOSS = async (filepath: string, formData: OSSFormParam) => {
  await Taro.uploadFile({
    url: ALIOSS,
    filePath: filepath,
    formData: formData,
    name: "file",
  });

  return `${ALIOSS}/${formData.key}`;
};

///
/// 这个函数
///
/// @param filePath  文件路径
/// @param name     上传到阿里OSS的文件名
/// @param openid   上传者的openid
/// @param feature  图片用途描述
const uploadFileToAliOssAndGetOid = async (
  filePath: string,
  name: string,
  openid: string,
  feature: string,
) => {
  let ak = await getAk();
  let form = getFormDataParams(ak, name);

  // 保存到阿里云OSS
  const res = await Taro.uploadFile({
    url: ALIOSS,
    filePath: filePath,
    formData: form,
    name: "file",
  });

  if (res.statusCode !== 204) {
    throw new Error(res.data);
  }

  let url = `${ALIOSS}/${form.key}`;

  // 将文件信息保存到拖车侠OSS
  let oid: { error: string; result: string } = await putOssFile({
    feature: feature,
    content_type: "image/jpeg",
    uploader: openid,
    url,
  });

  return oid.result;
};

export {
  getAk,
  putOssFile,
  getFormDataParams,
  getFileByOID,
  putFileToAliOSS,
  uploadFileToAliOssAndGetOid,
};
