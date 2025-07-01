import { FC, useCallback, useRef, useState } from "react";
import { Input, View } from "@tarojs/components";

interface ItemProps {
  focus: boolean;
  onInput: (v: string) => void;
}

const Item: FC<ItemProps> = ({ onInput, focus }) => {
  const ref = useRef();

  const getValue = (e: any) => {
    onInput(e.detail.value as string);
  };

  return (
    <Input
      focus={focus}
      ref={ref}
      onInput={getValue}
      className="item"
      type="number"
      maxlength={1}
    />
  );
};

export interface CaptchaProps {
  count: number;
  focus: number;
  onInput: (value: string, pos: number) => void;
}

const Captcha: FC<CaptchaProps> = ({ count, onInput, focus }) => {
  const x = new Array<string>(count).fill("");
  const [captcha, setCaptcha] = useState<string[]>([]);

  const onChange = useCallback(
    (idx: number, value: string) => {
      let next = [...captcha];
      next[idx] = value;
      setCaptcha(next);
      onInput(next.join(""), idx);
    },
    [captcha, setCaptcha],
  );

  return (
    <View className="app-captcha">
      {x.map((_, idx) => (
        <Item
          key={idx}
          focus={idx == focus}
          onInput={(v: any) => {
            onChange(idx, v);
          }}
        />
      ))}
    </View>
  );
};

export default Captcha;
