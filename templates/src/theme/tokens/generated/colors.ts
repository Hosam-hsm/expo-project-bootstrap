/* AUTO-GENERATED — do not edit. Run: bun run tokens:sync */
/**
 * Stub semantic colors keyed by Uniwind *appearance* (light/dark) for the default scaffold.
 * After Phase B (TOKEN_SYNC.md), prefer scheme-keyed maps (`colorSchemes.default`, …) for
 * Figma modes such as Default / Rider Tools — do not treat those modes as appearance dark.
 *
 * `colorSchemes` + `tokenAppearance` ship empty in the stub so `use-token-color` and the
 * Storybook theme bar typecheck in Phase A. Phase B replaces this file.
 */

const stubLight = {
  "text-text-default": "#333333",
  "text-text-secondary": "#666666",
  "text-text-link": "#183563",
  "surface-default": "#ffffff",
  "surface-secondary": "#f8f3ed",
  "surface-tertiary": "#f0f2f5",
  "button-button-primary": "#183563",
  "stroke-default": "#6782ad",
} as const;

const stubDark = {
  "text-text-default": "#ffffff",
  "text-text-secondary": "#d9d9d9",
  "text-text-link": "#96dbf8",
  "surface-default": "#12284b",
  "surface-secondary": "#16305a",
  "surface-tertiary": "#2d4a73",
  "button-button-primary": "#96dbf8",
  "stroke-default": "#6782ad",
} as const;

/** Product schemes — empty until Phase B. Appearance uses `colorTokens`. */
export const colorSchemes = {} as const;

export type ColorSchemeName = keyof typeof colorSchemes;

export const colorTokens = {
  light: stubLight,
  dark: stubDark,
} as const;

export type ColorTokenName = keyof typeof colorTokens.light;

export const appearanceSchemeMap = {
  light: "light",
  dark: "dark",
  source: "stub-appearance",
} as const;

export type TokenAppearanceKind = "light-only" | "light-and-dark" | "dark-only";

export const tokenAppearance: {
  kind: TokenAppearanceKind;
  schemes: readonly ColorSchemeName[];
} = {
  kind: "light-and-dark",
  schemes: [],
};
