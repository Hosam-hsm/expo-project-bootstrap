import { ActivityIndicator, type ActivityIndicatorProps } from "react-native";
import { useCSSVariable } from "uniwind";

import type { ColorTokenName } from "@/theme";

type StyledActivityIndicatorProps = ActivityIndicatorProps & {
  colorToken?: ColorTokenName;
};

export function StyledActivityIndicator({
  color,
  colorToken = "text-text-default",
  ...props
}: StyledActivityIndicatorProps) {
  const tokenColor = useCSSVariable(`--color-${colorToken}`) as string;

  return <ActivityIndicator {...props} color={color ?? tokenColor} />;
}
