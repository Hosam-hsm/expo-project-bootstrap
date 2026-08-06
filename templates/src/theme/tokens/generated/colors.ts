/* AUTO-GENERATED — do not edit. Run: bun run tokens:sync */
/**
 * Semantic color *names* + appearance/scheme metadata.
 * Resolved values live in theme.css (`--color-*` per Uniwind variant).
 * Read them in JS via `useCSSVariable(`--color-${token}`)`.
 *
 * `colorSchemeNames` + `tokenAppearance.schemes` ship empty in the stub so Phase A
 * typechecks. Phase B replaces this file.
 */

export const colorTokenNames = [
  "text-text-default",
  "text-text-secondary",
  "text-text-link",
  "surface-default",
  "surface-secondary",
  "surface-tertiary",
  "button-button-primary",
  "stroke-default",
] as const;

export type ColorTokenName = (typeof colorTokenNames)[number];

export const colorSchemeNames = [] as const;

export type ColorSchemeName = (typeof colorSchemeNames)[number];

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
