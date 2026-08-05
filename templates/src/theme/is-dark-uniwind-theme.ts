/**
 * Whether the active Uniwind theme should use React Navigation DarkTheme.
 *
 * Appearance `dark` and night-oriented product schemes (e.g. `driver-night`) count as dark
 * nav chrome. Do not treat arbitrary second schemes as dark — only exact `dark` or `*-night`.
 */
export function isDarkUniwindTheme(theme: string): boolean {
  return theme === "dark" || theme.endsWith("-night");
}
