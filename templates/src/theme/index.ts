/**
 * Design system — tokens and typography utilities.
 * CSS entry: src/global.css (must live under src/ — not theme/ — so Uniwind scans all classNames)
 * When token sync is on: bun run tokens:sync
 */

export type { ColorTokenName } from "@/theme/tokens/generated/colors";
export type { TypographyTokenName } from "@/theme/tokens/generated/typography-classes";
export { isDarkUniwindTheme } from "@/theme/is-dark-uniwind-theme";
export type { ExpoFontFace } from "@/theme/typography";
export {
  bgClassName,
  colorClassName,
  expoFontSourceMap,
  isLinkVariant,
  mergeTypographyClassName,
  typographyClassName,
  typographyTwMerge,
} from "@/theme/typography";
