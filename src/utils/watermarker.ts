import Taro, { Canvas } from "@tarojs/taro";
import dayjs from "dayjs";
import LogoIcon from "@/assets/logo.png";

interface orientation {
  /** 默认方向（手机横持拍照），对应 Exif 中的 1。或无 orientation 信息。 */
  up: string;
  /** 同 up，但镜像翻转，对应 Exif 中的 2 */
  "up-mirrored": string;
  /** 旋转180度，对应 Exif 中的 3 */
  down: string;
  /** 同 down，但镜像翻转，对应 Exif 中的 4 */
  "down-mirrored": string;
  /** 同 left，但镜像翻转，对应 Exif 中的 5 */
  "left-mirrored": string;
  /** 顺时针旋转90度，对应 Exif 中的 6 */
  right: string;
  /** 同 right，但镜像翻转，对应 Exif 中的 7 */
  "right-mirrored": string;
  /** 逆时针旋转90度，对应 Exif 中的 8 */
  left: string;
}

type ChooseImageResult = {
  errMsg: string;
  paths: string[];
};

type ImageSize = {
  width: number;
  height: number;
  orientation: keyof orientation;
  errMsg: string;
};

type ResizeImageResult = {
  path: string;
  errMsg: string;
};

export const Sleep = (time: number) => {
  return new Promise((r) => {
    setTimeout(r, time);
  });
};

const ChooseImage = async (count: number) => {
  const result: ChooseImageResult = {
    errMsg: "",
    paths: [],
  };
  try {
    const res = await Taro.chooseImage({
      count: count,
      sizeType: ["compressed"],
    });
    result.paths = res.tempFilePaths;
  } catch (e) {
    result.errMsg = `${e}`;
  }

  return result;
};

const GetImageSize = async (path: string) => {
  const result: ImageSize = {
    width: 0,
    height: 0,
    orientation: "up",
    errMsg: "",
  };
  try {
    const res = await Taro.getImageInfo({
      src: path,
    });
    result.width = res.width;
    result.height = res.height;
    result.orientation = res.orientation;
  } catch (e) {
    result.errMsg = `${e}`;
  }

  return result;
};

const CanvasToTempFilePath = async (
  canvasId: string,
  width: number,
  height: number,
) => {
  const result = {
    path: "",
    errMsg: "",
  };
  const res = await Taro.canvasToTempFilePath({
    canvasId,
    width,
    height,
    quality: 0.6,
  });

  result.errMsg = res.errMsg;
  result.path = res.tempFilePath;
  return result;
};

const ResizeImage = async (
  canvas: Canvas,
  canvasId: string,
  path: string,
  width: number = 1920,
  height: number = 1080,
) => {
  const result: ResizeImageResult = {
    path: "",
    errMsg: "",
  };
  const ctx = Taro.createCanvasContext(canvasId);
  const size = await GetImageSize(path);
  if (size.errMsg !== "") {
    result.errMsg = size.errMsg;
    return result;
  }
  canvas.width = width;
  canvas.height = height;
  if (ctx === null) {
    result.errMsg = "can not get canvas context";
    return result;
  }

  ctx.drawImage(path, 0, 0, width, height);
  ctx.draw(false);
  await Sleep(200);
  const temp = await CanvasToTempFilePath(canvasId, width, height);
  result.path = temp.path;
  result.errMsg = temp.errMsg;

  return result;
};

const queryCanvas = async function (
  id: string,
): Promise<{ canvas: Taro.Canvas; ctx: CanvasRenderingContext2D }> {
  return new Promise((r) => {
    const query = Taro.createSelectorQuery();
    const select = query
      .select(id)
      .fields({ node: true, size: true, context: true });
    select.exec((res) => {
      r({ canvas: res[0].node, ctx: res[0].context });
    });
  });
};

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  if (width <= 0 || height <= 0) {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    return;
  }

  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + radius, y, radius);
};

// drawRandedRect
// 画一个圆角矩形
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  strokeStyle: typeof CanvasRenderingContext2D.prototype.strokeStyle,
  fillStyle: typeof CanvasRenderingContext2D.prototype.fillStyle,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  ctx.beginPath();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;
  ctx.stroke();
  ctx.fill();
};

const drawImage = async (
  canvas: Taro.Canvas,
  imagePath: string,
  ctx: CanvasRenderingContext2D,
  x: number = 0,
  y: number = 0,
  width: number,
  height: number,
) => {
  return new Promise((resolve, reject) => {
    try {
      let image = canvas.createImage();
      image.src = imagePath;
      image.onload = () => {
        ctx.drawImage(image as CanvasImageSource, x, y, width, height);
        resolve(true);
      };
    } catch (e) {
      reject(e);
    }
  });
};

const Watermark = async (
  id: string,
  path: string,
  mainTitle: string,
  subTitle: string,
  width: number,
  height: number,
) => {
  const { canvas } = await queryCanvas(id);
  canvas.width = width;
  canvas.height = height;
  Sleep(200);

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  ctx.font = "48px Arial";
  let boxWidth = ctx.measureText(mainTitle).width + 32;

  ctx.font = "32px sans-serif";
  let addrWith = ctx.measureText(subTitle).width + 32;
  if (addrWith > boxWidth) {
    boxWidth = addrWith;
  }

  const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
  let timeWidth = ctx.measureText(time).width + 32;
  if (timeWidth > boxWidth) {
    boxWidth = timeWidth;
  }

  ctx.font = "48px Arial";

  // 画照片
  await drawImage(canvas, path, ctx, 0, 0, width, height);

  // 画框
  const grd = ctx.createLinearGradient(0, 0, boxWidth, 240);
  grd.addColorStop(0, "#1e90ff");
  grd.addColorStop(0.8, "#0fb3ff");
  ctx.globalAlpha = 0.8;
  drawRoundedRect(
    ctx,
    "#1e90ff",
    grd,
    16,
    canvas.height - 250,
    boxWidth,
    240,
    4,
  );

  // 画logo框
  drawRoundedRect(ctx, "#1e90ff", grd, canvas.width - 202, 48, 154, 154, 2);

  // 画logo
  await drawImage(canvas, LogoIcon, ctx, canvas.width - 200, 50, 150, 150);

  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.font = "32px sans-serif";

  // 画地址
  ctx.fillText(
    subTitle,
    (boxWidth - ctx.measureText(subTitle).width) / 2 + 16,
    canvas.height - 100,
  );

  // 画时间
  ctx.fillText(
    time,
    (boxWidth - ctx.measureText(time).width) / 2 + 16,
    canvas.height - 40,
  );

  // 画公司名称
  ctx.font = "48px Arial";
  ctx.fillText(
    mainTitle,
    (boxWidth - ctx.measureText(mainTitle).width) / 2 + 16,
    canvas.height - 180,
  );

  await Sleep(200);

  const res = await Taro.canvasToTempFilePath({
    canvas: canvas,
    quality: 0.8,
    fileType: "jpg",
  });

  return res.tempFilePath;
};

export { ChooseImage, GetImageSize, ResizeImage, Watermark };
