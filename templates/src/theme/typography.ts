import { extendTailwindMerge } from "tailwind-merge";

import type { ColorTokenName } from "@/theme/tokens/generated/colors";
import {
  type TypographyTokenName,
  typographyClassNames,
} from "@/theme/tokens/generated/typography";

export type { TypographyTokenName };
export { typographyClassNames };

/**
 * Custom font files for `expo-font` / `useFonts` (root `IconFontLoader` + Storybook).
 *
 * Keys **Regular**, **Medium**, **SemiBold**, and **Bold** must match Uniwind `@theme`
 * `--font-*` utilities (`font-Regular`, …) in `typography-primitives.css`. In React Native,
 * weight must be a separate loaded face — `font-normal` / `font-bold` do not switch
 * custom fonts.
 *
 * Phase B: point values at brand `.ttf`s (or Expo Google Font modules) and keep keys
 * stable. When present, `--font-*` values should equal the native names expo-font
 * registers (usually these same keys).
 */
export const expoFontSourceMap = {
  // Regular: require("../../assets/fonts/Brand-Regular.ttf"),
  // Medium: require("../../assets/fonts/Brand-Medium.ttf"),
  // SemiBold: require("../../assets/fonts/Brand-SemiBold.ttf"),
  // Bold: require("../../assets/fonts/Brand-Bold.ttf"),
} as const;

export type ExpoFontFace = keyof typeof expoFontSourceMap;

/**
 * Recognises this design system's utilities as conflict groups, matched by shape so
 * any generated scale key works without mirroring the CSS scales in TS:
 * `text-size-*` (size), `leading-*` (line height), `font-Capitalised` (RN weight face,
 * distinct from Tailwind's lowercase `font-bold` weights).
 */
export const typographyTwMerge = extendTailwindMerge({
  override: {
    // Unlike Tailwind's `text-lg`, `text-size-*` carries no implicit line height,
    // so a size override must not drop the recipe's `leading-*`.
    conflictingClassGroups: { "font-size": [] },
  },
  extend: {
    classGroups: {
      "font-size": [{ text: [{ size: [() => true] }] }],
      leading: [{ leading: [(value: string) => /^[A-Za-z][\w-]*$/.test(value)] }],
      "font-family": [{ font: [(value: string) => /^[A-Z]/.test(value)] }],
    },
  },
});

export function isLinkVariant(variant: TypographyTokenName): boolean {
  return variant.includes("underlined-links");
}

export type TypographyClassNameOptions = {
  /** When false, omit `leading-*` from the variant recipe. Default true. */
  withLineHeight?: boolean;
};

function stripLeadingUtilities(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token.length > 0 && !/(?:^|:)leading-/.test(token))
    .join(" ");
}

/**
 * Variant recipe from generated tokens. Pass `{ withLineHeight: false }` to drop leading.
 */
export function typographyClassName(
  variant: TypographyTokenName,
  options?: TypographyClassNameOptions,
): string {
  const base = typographyClassNames[variant];
  if (options?.withLineHeight === false) {
    return stripLeadingUtilities(base);
  }
  return base;
}

export function colorClassName(colorToken: ColorTokenName): string {
  return `text-${colorToken}`;
}

/** Prefer this over string-join when composing ThemedText / variant + overrides. */
export function mergeTypographyClassName(
  ...classes: Array<string | undefined | null | false>
): string {
  return typographyTwMerge(...classes.filter((c): c is string => Boolean(c)));
}
