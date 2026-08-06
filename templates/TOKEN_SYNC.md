# Design token sync — Phase B

When intake **Sync design tokens** is on — after A2 (or A when EAS off), before C. Needs **Design tokens source** (GitHub URL **or** local path to a design-tokens JSON file). Do not copy this file into the app.

Icons: export SVGs to `assets/icons/` separately.

## Goal

Rerunnable `bun run tokens:sync` that loads the intake tokens source (clone a GitHub repo **or** read a local JSON file) and writes Uniwind files under `src/theme/tokens/generated/`. Normalize plugin exports inside the script — do not invent an intermediate `raw/` layer.

## Appearance vs color schemes (critical)

These are **different axes**. Do not conflate them.

| Axis | Meaning | Examples | App control |
|------|---------|----------|-------------|
| **Appearance** | Light / dark UI chrome | OS dark mode; Figma modes named exactly `light` / `dark` | `themePreference` + `Uniwind.setTheme("light"|"dark"|"system")` |
| **Color scheme** | Named product / brand themes | `Default`, `Rider Tools` | `colorScheme` + `Uniwind.setTheme(schemeSlug)` (often all appearance-light) |

**Never** treat an arbitrary second mode (e.g. `Rider Tools`) as appearance-dark.

### Auto-detect from the export (no intake questions)

Classify **Color Tokens** (or equivalent) collection modes during Phase B review. **Do not ask** appearance/scheme fields at intake — only the tokens source (GitHub URL or local JSON path).

| Mode name (case-insensitive) | Treat as |
|------------------------------|----------|
| Exactly `light`, `dark`, or `system` | **Appearance** axis |
| Anything else (`Default`, `Rider Tools`, `Ocean`, …) | **Color scheme** |
| Size/typography modes (`sm`, `md`, `lg+`, `sm/md`, …) | Not color — ignore here |
| Feature flags (Phases, …) | Skip |

Derive wiring:

| Detected | Appearance | Schemes | Settings UI |
|----------|------------|---------|-------------|
| Only `light` + `dark` (no other color modes) | `light-and-dark` | Use appearance axis for CSS; no product scheme toggle | Appearance only |
| ≥1 non-appearance mode, **no** `light`/`dark` modes | `light-only` | All of those modes; default = `Default`/`default` if present, else **agent asks** which scheme backs light (and dark for future) | Scheme toggle if ≥2 |
| Both appearance **and** non-appearance modes | `light-and-dark` + schemes | Non-appearance → schemes; light/dark → appearance | Both panels |
| Single color mode total | `light-only` (unless that mode is literally `dark`) | One scheme; no scheme toggle | Minimal |

**Default scheme / appearance pin:** Pin `APPEARANCE_SCHEME_MAP` in `scripts/sync-design-tokens.mjs` (agent — never interactive in the script).

| Situation | Agent action |
|-----------|----------------|
| Exact Figma `light`/`dark` appearance modes | Use those for `@variant light`/`dark` in `theme.css`; no ask |
| Named scheme `Default` / `default` | Pin `APPEARANCE_SCHEME_MAP = { light: "default", dark: "default" }` without asking (dark mirrored for future OS dark) |
| Product schemes only, **no** named Default | **Ask the user** which scheme slug maps to light and which to dark, then pin those constants. Dark may equal light until a dark-oriented scheme exists |
| Ambiguous mode names (`Day`/`Night`, …) | Ask only then (existing rule) |

Register product schemes as Uniwind `extraThemes`. Emit `@variant light` / `@variant dark` from the pinned map so dark can be enabled later — still **do not** expose dark in Settings when appearance is light-only.

**Ask only if ambiguous** (e.g. `Day`/`Night`, `Light Mode`/`Dark Mode` — not exact `light`/`dark`) **or** there is no named Default for the light/dark appearance pin. Otherwise proceed and note the detection in the Phase B / run report.

Wire `colorScheme` in `preferences-store` **separately** from `themePreference`. Appearance panel only when `light-and-dark`; color scheme panel only when ≥2 schemes.

**Nav chrome + Storybook (required with schemes):**

| Surface | Requirement |
|---------|-------------|
| Expo Router `ThemeProvider` | Use `isDarkUniwindTheme(theme)` from `@/theme/is-dark-uniwind-theme` — `dark` **or** `*-night` → `DarkTheme`. Never `theme === "dark"` alone (product night schemes would keep light nav chrome). |
| Storybook `with-theme.tsx` | Modes = `["light","dark", ...tokenAppearance.schemes]`. Stub ships empty `schemes`; Phase B fills `tokenAppearance` in `colors.ts` — **do not** hardcode scheme chips. |
| Colors story hex labels | `useCSSVariable(\`--color-${name}\`)` (fall back to `semanticColors.light` when empty). |

## 1 — Review tokens source

**GitHub URL:** shallow-clone / `gh` the intake URL. **Local JSON:** open the file (and sibling exports in the same folder if present). Inventory export layout (Tokens Studio, Variables JSON, Style Dictionary, etc.). Run the auto-detect table above. Note size/typography breakpoint modes (sm / md / lg+) separately. Skip Phases / feature-flag collections.

## 2 — Implement `scripts/sync-design-tokens.mjs`

| Requirement | Detail |
|-------------|--------|
| Source | Pin intake source as `TOKENS_SOURCE` (or `TOKENS_GITHUB_URL` for repos) — GitHub URL **or** absolute/relative path to a `.json` file |
| Fetch | GitHub: clone/pull each run (cache under `.tokens-cache/`, gitignored). Local: resolve path and read the JSON (no clone) |
| Output | Overwrite `generated/*` per contract below |
| Headers | `AUTO-GENERATED — do not edit. Run: bun run tokens:sync` |
| Storybook | Regenerate `src/stories/design-tokens/token-definitions.ts` when Storybook is on — [**STORYBOOK_TOKEN_DEFINITIONS.md**](./STORYBOOK_TOKEN_DEFINITIONS.md) (export names + shapes; content varies per design system) |
| Idempotent | Same inputs → stable outputs |
| Document | Script header: detected appearance, scheme slugs, default scheme |

```json
"tokens:sync": "node scripts/sync-design-tokens.mjs"
```

### Uniwind / TS output contract

Match `templates/src/theme/tokens/generated/` **shape intent**; Phase B replaces stubs to match **detection** (stubs may still show `light`/`dark` for the default scaffold’s appearance demo — that is not a Figma mode map).

| File | Role |
|------|------|
| `theme.css` | Semantic `--color-*` under Uniwind variants: appearance `light`/`dark` from exact modes **or** from agent-pinned `APPEARANCE_SCHEME_MAP`; product schemes as `@variant <slug>`. Prefer `var(--primitive-*)` when the Figma value aliases a color primitive |
| `colors.ts` | Token **names** + scheme/appearance metadata only (`colorTokenNames`, `colorSchemeNames`, `appearanceSchemeMap`, `tokenAppearance`). Values live in `theme.css` — read via `useCSSVariable(\`--color-${token}\`)` |
| `metro.config.js` | `tokens:sync` patches `extraThemes: […]` under `withUniwindConfig` (no sidecar JSON). **Idempotent:** if the array already matches the detected scheme slugs, leave the file untouched (do not throw). Only throw when `extraThemes` is missing from the config. |
| `spacing.css` | Size → `@theme` (+ sm / md / lg+ overrides) |
| `typography-primitives.css` | **`@theme`** typography primitives: `--text-size-*` → `text-size-*`; `--leading-*` → `leading-*` (unitless); `--font-Regular\|Medium\|SemiBold\|Bold` → weight faces (see Typography below) |
| `typography.ts` | Composite class recipes: `text-size-*` + `leading-*` + `font-Regular\|Medium\|SemiBold\|Bold` (**not** hardcoded `text-[Npx]` / `leading-[Npx]` / `font-normal`) |
| `primitives.css` | Color + size primitive CSS vars (`--primitive-*`). Semantic `theme.css` tokens reference these via `var(--primitive-*)` when aliased |

**Preferred `colors.ts` shape (multi-scheme):**

```ts
export const colorTokenNames = [/* semantic token slugs */] as const;
export type ColorTokenName = (typeof colorTokenNames)[number];

export const colorSchemeNames = ["default", "rider-tools"] as const;
export type ColorSchemeName = (typeof colorSchemeNames)[number];
export const defaultColorScheme = "default" satisfies ColorSchemeName;

export const appearanceSchemeMap = { light: "default", dark: "default", source: "named-default" } as const;

export type TokenAppearanceKind = "light-only" | "light-and-dark" | "dark-only";

export const tokenAppearance: {
  kind: TokenAppearanceKind;
  schemes: readonly ColorSchemeName[];
} = {
  kind: "light-only",
  schemes: ["default", "rider-tools"],
};
```

Switch schemes with `Uniwind.setTheme(schemeSlug)` — **not** `setTheme("dark")` unless detection classified that mode as appearance-dark.

**Single scheme:** one entry in `colorSchemeNames`; no scheme toggle UI.

Keep `@/theme` import paths. Prefer CSS-safe names. Match stub file names under `generated/`.

### Resolve & emit checklist (do not skip)

| Area | Requirement |
|------|-------------|
| Alias resolution | Follow aliases before emit. **Primitive** refs → `var(--primitive-*)` in `theme.css` (hex stays in `primitives.css`). Raw colors and unresolved chains stay hex/rgba. Storybook `semanticColors` still gets concrete hex. |
| Color values | Accept `#hex` **and** `rgb()` / `rgba()` / `hsl()` / `hsla()`. |
| Color schemes | Emit **every** retained non-appearance color mode under its own slug. No silent drop; no light/dark rename of product schemes. |
| Appearance | From exact `light`/`dark` modes only; else light-only. |
| Size tokens | Preserve Figma path slugs in CSS names: `space/5` → `--spacing-space-5` → `p-space-5` / `gap-space-5`. Emit one key only—do not also emit a stripped `--spacing-5` alias. Also emit `--radius-*`, `--border-width-*` (strokes), padding as spacing keys if needed, and `--responsive-*`. |
| Size modes | Mobile-first: **sm** base; **md** `@media (min-width: 768px)`; **lg+** `1024px` (match `global.css` breakpoints). |
| Typography | All composite styles for sm/md + lg+. Emit **tokenized** classes only — see **Typography (Uniwind)** below. **Do not** emit scaffold aliases (e.g. `heading-app-section`) when Figma composites exist — rename app / Storybook `variant` strings to the generated Figma token names. **If the export has faces/weights only (no composite text styles):** retain scaffold `typographyClassNames`, load brand faces via `expoFontSourceMap`, and report the gap in Phase R — do not invent Figma style names. |
| Primitives | Emit color **and** size primitives. Register typography size / leading / weight faces in `@theme`. |
| Skip | Feature-flag collections (Phases, etc.). |
| Stub `colors.ts` | Always export `colorTokenNames`, `tokenAppearance.schemes` (may be `[]`), and `appearanceSchemeMap` so Phase A typechecks before Phase B. |

### Typography (Uniwind) — required shape

Compose from declared primitives (same idea as a Tailwind `theme.extend` + `getTextVariantTailwindClassName` map). **Do not** bake pixel sizes or line-heights into class strings.

```ts
// generated/typography.ts — good
"global-body-base": "text-size-400 leading-md font-Regular lg:text-size-450",
"global-body-small-bold": "text-size-350 leading-md font-Medium lg:text-size-400",

// bad — hardcodes px / CSS font-weight (broken for custom fonts on RN)
"global-body-base": "text-[16px] leading-[19px] font-normal font-sans",
```

| Piece | `@theme` token | Utility | Source |
|-------|----------------|---------|--------|
| Font size | `--text-size-400: 16px` | `text-size-400` | Typography size primitives (`size.size-400`) |
| Line height | `--leading-md: 1.2` | `leading-md` | Leading primitives (unitless). Default `md` when composites omit line-height — do not invent per-style leading maps unless Figma exports them |
| Weight face | `--font-Regular: "Regular"` | `font-Regular` | **RN weight faces** — see below |

**RN weight faces (critical):** React Native ignores CSS `font-weight` on custom fonts. Map Figma weights to separate loaded families:

| Figma weight | Uniwind class | App load + CSS |
|--------------|---------------|----------------|
| Regular (and thin/light fallbacks) | `font-Regular` | `expoFontSourceMap.Regular` + `--font-Regular` in `typography-primitives.css` |
| Medium (500) | `font-Medium` | `…Medium` |
| SemiBold (600) | `font-SemiBold` | `…SemiBold` |
| Bold (700+) | `font-Bold` | `…Bold` |

- Emit **one** face class per style (`font-Bold`), never `font-bold` + `font-sans`.
- Map weight **600** / `"semibold"` → `SemiBold` (check semibold **before** bold in string matching — `"semibold".includes("bold")` is true).
- `IconFontLoader` / root loader: `useFonts({ ...expoFontSourceMap })`.
- `--font-*` values must equal the **native names** expo-font registers (usually the map keys when custom files are loaded).
- Phase B: install/load the brand `.ttf`s (or Google font packages) and keep keys `Regular` / `Medium` / `SemiBold` / `Bold` stable when swapping files.
- **Mono / second family:** only add extra faces (e.g. `MonoRegular`) when the design system needs a separate loaded mono stack. Do not invent mono faces by default — map monospaced composites to the same Regular/Medium/SemiBold/Bold faces unless intake fonts include a dedicated mono.

Keep `expoFontSourceMap` in `src/theme/typography.ts` as the hand-maintained **load map**. Sync emits `--font-*` in `typography-primitives.css` and class recipes in `generated/typography.ts` — do not maintain a separate `fonts.ts` or empty `font-families.css` import. Delete stale `typography-primitives.ts` / `typography-classes.ts` if present.

**Class overrides:** `ThemedText` (and any variant + `className` composition) must use `tailwind-merge` via `mergeTypographyClassName` / `typographyTwMerge` in `src/theme/typography.ts`. Match utilities by shape (`text-size-*`, `leading-*`, capitalised `font-*` faces) and clear the default `font-size` → `leading` conflict (`override.conflictingClassGroups`) so a size override does not drop the recipe’s line height. Do not string-join conflicting utilities — later overrides would not win reliably.

**Line height gate:** Generated recipes include `leading-*`, but applying leading is optional per instance. `ThemedText` exposes `withLineHeight` (default `true`). Pass `withLineHeight={false}` (or `typographyClassName(variant, { withLineHeight: false })`) to omit leading utilities — do not fork variants just to drop line height.

### Coverage gate

Compare source leaves → generated output (or log from the script). Missing schemes, colors, size leaves, or typography = **not done**. Fix `transformAndWrite`; do not hand-edit `generated/*`.

Carry the same inventory into the Phase R run report **Design token import gaps** section (when sync on): schemes, semantic colors, primitives, size/typography (incl. sm/md/lg+), unresolved aliases, intentionally skipped collections (e.g. Phases), font packages / `expo-font` load gaps, and Settings / `extraThemes` wiring. See skills/bootstrap/SKILL.md run report template.

Example Tokens Studio bundle: top-level `files[]` with `collectionName`, `modeName`, `tokens`; aliases like `{neutrals.black-20}` and `{text.text-link-hover}`. Modes such as `Default` / `Rider Tools` are **schemes** (auto light-only); exact `light`/`dark` would be appearance.

### Storybook `token-definitions.ts` contract

When Storybook is on, Phase B also overwrites `src/stories/design-tokens/token-definitions.ts`.  
Design-token stories import **fixed export names and TypeScript shapes**; only keys/values change per project.

**Full spec:** [STORYBOOK_TOKEN_DEFINITIONS.md](./STORYBOOK_TOKEN_DEFINITIONS.md)  
**Reference stub:** [src/stories/design-tokens/token-definitions.ts](./src/stories/design-tokens/token-definitions.ts)

Summary:

| Must emit | Shape stories expect |
|-----------|----------------------|
| `spacingTokens`, `radiusTokens` | `Record<string, number>` (px, not `"16px"` strings) |
| `colorTokenGroups`, `semanticColors`, `semanticColorClasses` | Grouped semantic colors + light/dark maps |
| `colorPrimitiveGroups` | Grouped `{ tokenName, value }[]` or `{}` |
| `fontFamilies` | `Record<string, string>` (not an array) |
| `typographyVariants`, `typographyTokenEntries` | Arrays; `name`/`key` match `generated/typography.ts` |
| `tokenCounts` | Coverage summary for Colors story header |

**Gate:** `bunx tsc --noEmit` with Storybook stories included. Wrong shape = Phase B incomplete.

## 3 — Run & hand off to Phase C

```bash
bun run tokens:sync
# Include detected scheme slugs as --theme extras when regenerating types:
bunx uniwind generate-artifacts --css ./src/global.css --dts ./src/uniwind-types.d.ts --theme <scheme>…
```

Then Phase C (`lint` / `test` / `tsc`) once — do not re-verify inside B. Fix the script — do not one-off edit `generated/*`. After fonts change: install packages matching exported families; load via `expo-font` ([templates/README.md](./README.md)).

**Gate:** real generated tokens + coverage checklist + correct appearance/scheme wiring from auto-detect. When Storybook is on: `token-definitions.ts` matches [STORYBOOK_TOKEN_DEFINITIONS.md](./STORYBOOK_TOKEN_DEFINITIONS.md) and `tsc` passes. If blocked: keep stubs; document; do not mark B complete.
