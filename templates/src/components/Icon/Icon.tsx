import type { ColorValue } from "react-native";
import { createNanoIconSet, type IconProps as NanoIconProps } from "react-native-nano-icons";
import { useCSSVariable } from "uniwind";

import glyphMap from "@/assets/icons/nanoicons.glyphmap.json";
import type { ColorTokenName } from "@/theme";

const NanoIcon = createNanoIconSet(glyphMap);

export type IconName = keyof typeof glyphMap.i;

export const iconFontFamily = glyphMap.m.f;

type CustomIconProps = Omit<NanoIconProps<IconName>, "color"> & {
  size?: number;
  /**
   * Explicit color. Accepts RN `ColorValue` so Expo Router `tabBarIcon` `color`
   * type-checks; nano-icons only accepts a string, so non-strings are coerced.
   */
  color?: ColorValue;
  colorToken?: ColorTokenName;
};

function resolveIconColor(color: ColorValue): string {
  return typeof color === "string" ? color : String(color);
}

export function Icon({ color, colorToken = "text-text-default", ...props }: CustomIconProps) {
  const tokenColor = useCSSVariable(`--color-${colorToken}`) as string;

  return (
    <NanoIcon {...props} color={color != null ? resolveIconColor(color) : tokenColor} />
  );
}

export { NanoIcon };
