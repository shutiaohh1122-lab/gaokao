import clsx from "clsx";

export function cn(...inputs: Array<string | undefined | null | false>) {
  return clsx(inputs);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}
