# Storybook `token-definitions.ts` contract

When **Storybook** and **token sync** are both on, Phase B must regenerate  
`src/stories/design-tokens/token-definitions.ts` on every `bun run tokens:sync`.

**Canonical stub (structure only — values change per design system):**  
[`src/stories/design-tokens/token-definitions.ts`](./src/stories/design-tokens/token-definitions.ts)

**Consumers (do not change export names/shapes without updating these stories):**

| Story | Imports |
|-------|---------|
| [`Colors.stories.tsx`](./src/stories/design-tokens/Colors.stories.tsx) | `colorTokenGroups`, `colorPrimitiveGroups`, `semanticColors`, `semanticColorClasses`, `tokenCounts`, types |
| [`Spacing.stories.tsx`](./src/stories/design-tokens/Spacing.stories.tsx) | `spacingTokens` |
| [`BorderRadius.stories.tsx`](./src/stories/design-tokens/BorderRadius.stories.tsx) | `radiusTokens` |
| [`Typography.stories.tsx`](./src/stories/design-tokens/Typography.stories.tsx) | `fontFamilies`, `typographyVariants` |

[`Icons.stories.tsx`](./src/stories/design-tokens/Icons.stories.tsx) and [`Shadows.stories.tsx`](./src/stories/design-tokens/Shadows.stories.tsx) do **not** import this file (placeholders only).

---

## Contract vs content

The contract is **export names + TypeScript shapes + field semantics**.  
Token **keys**, **counts**, and **hex values** vary per Figma export — stories iterate whatever is emitted.

Do **not** hand-edit `token-definitions.ts`. Do **not** emit alternate shapes (e.g. arrays where stories expect records).

---

## Required exports

Emit **every** export below. Use `as const` on object literals. Derive types from values (`keyof typeof …`) where the stub does.

| Export | Type / shape | Used for |
|--------|----------------|----------|
| `colorTokenGroups` | `Record<group, readonly ColorTokenEntry[]>` | Semantic colors grouped by first path segment (`text`, `surface`, …) |
| `ColorTokenGroup` | `keyof typeof colorTokenGroups` | |
| `colorPrimitiveGroups` | `Record<group, readonly { tokenName: string; value: string }[]>` | Brand palette swatches; `{}` when no primitives |
| `ColorPrimitiveGroup` | `keyof typeof colorPrimitiveGroups` | |
| `semanticColors` | `{ light: Record<tokenName, hex>; dark: Record<tokenName, hex> }` | Swatch labels; see appearance note below |
| `SemanticColorName` | `keyof typeof semanticColors.light` | |
| `semanticColorClasses` | `Record<SemanticColorName, string>` | Uniwind bg class per semantic token (`bg-${tokenName}`) |
| `spacingTokens` | `Record<string, number>` | **Numeric px** — keys like `space-spacing-base` |
| `radiusTokens` | `Record<string, number>` | **Numeric px** — keys like `radius-panel` |
| `sizePrimitiveGroups` | `{} as const` (extend when size-primitive stories exist) | Reserved |
| `SizePrimitiveGroup` | `keyof typeof sizePrimitiveGroups` | |
| `typographyPrimitiveGroups` | `{} as const` (extend when needed) | Reserved |
| `TypographyPrimitiveGroup` | `keyof typeof typographyPrimitiveGroups` | |
| `typographyTokenEntries` | `readonly TypographyTokenEntry[]` | Metadata per composite style |
| `fontFamilies` | `Record<displayName, cssStack>` | **Record**, not array — e.g. `{ "Helvetica Neue": "\"Helvetica Neue\", …" }` |
| `typographyVariants` | `readonly TypographyVariant[]` | Drives `ThemedText` variant gallery |
| `tokenCounts` | see below | Story headers / coverage summary |

### `ColorTokenEntry`

```ts
{
  figmaName: string;   // slash path, e.g. "text/text-default"
  tokenName: string;   // slug, e.g. "text-text-default" — matches colors.ts keys
  cssVar: string;      // e.g. "--color-text-text-default"
  className: string;   // e.g. "bg-text-text-default"
  light: string;       // resolved hex/rgb for appearance-light pin (see TOKEN_SYNC APPEARANCE_SCHEME_MAP)
  dark: string;        // resolved hex for appearance-dark pin (may equal light when light-only)
}
```

### `TypographyTokenEntry`

```ts
{
  path: string;        // human path with slashes, e.g. "global/body/base"
  key: string;         // slug — must match typography-classes.ts key / TypographyTokenName
  family: string;      // resolved family label
  size: number;        // lg+ px (number, not string)
  weight: string;      // CSS weight string: "400" | "500" | "700"
  sizeSmMd: number;    // sm/md base px
  weightSmMd: string;
}
```

### `TypographyVariant`

```ts
{
  name: string;        // typography-classes key
  label: string;       // display label (spaces, lower case)
  size: number;        // lg+ px
  sizeSmMd: number;
  lineHeight: number;  // px or 0 when unknown
  lineHeightSmMd: number;
  weight: string;
  weightSmMd: string;
}
```

### `tokenCounts`

```ts
{
  colorTokens: number;           // semantic color leaves (one scheme)
  colorPrimitives: number;       // color primitive leaves
  sizeTokens: number;            // size token leaves (sm mode)
  sizePrimitives: number;
  typographyTokens: number;        // composite typography styles
  typographyPrimitives: number;
  figmaTotal: number;              // sum useful for header copy
  figmaPhasesSkipped: number;    // intentionally skipped collections (e.g. Phases)
}
```

---

## Mapping from generated runtime tokens

Use the **same slug rules** as `colors.ts` / `typography-classes.ts` (path segments → kebab-case, `/` → `-`).

| Export field | Source |
|--------------|--------|
| `colorTokenGroups[*][].tokenName` | Keys of `colorSchemes[defaultScheme]` |
| `colorTokenGroups` group key | First segment of token path (`text`, `surface`, `button`, …) |
| `semanticColors.light` / `.dark` | `colorSchemes[APPEARANCE_SCHEME_MAP.light]` and `.dark` |
| `semanticColorClasses[name]` | `` `bg-${name}` `` |
| `colorPrimitiveGroups` | Color Primitives collection — group by top-level path segment |
| `spacingTokens` keys | Size Tokens **sm** spacing leaves → `space-spacing-${slug}` |
| `spacingTokens` values | Resolved **number** px (`parseFloat`, no `"px"` suffix) |
| `radiusTokens` keys | Size Tokens **sm** radius leaves → `radius-${slug}` |
| `radiusTokens` values | Numeric px |
| `typographyTokenEntries` / `typographyVariants` | Typography Tokens styles; `key`/`name` = slugified style path |
| `fontFamilies` | Distinct `family.*` primitives from Typography Primitives |
| `tokenCounts.*` | Count leaves / styles from source after skips |

**Appearance light-only:** `semanticColors.light` and `.dark` may be identical (both pinned to Default). Stories still require both keys.

---

## Empty / missing collections

| Situation | Emit |
|-----------|------|
| No color primitives | `colorPrimitiveGroups = {} as const` · `tokenCounts.colorPrimitives = 0` |
| No size primitives | `sizePrimitiveGroups = {} as const` · count `0` |
| Single color scheme | Full `semanticColors`; `colorTokenGroups` still populated |
| No shadow tokens | Do not add `shadowTokens` — Shadows story is a placeholder |

Never substitute a different type (e.g. `spacingTokens: { tokenName, value: "16px" }[]`) — Phase C `tsc` will fail.

---

## Phase B checklist (Storybook)

- [ ] Storybook enabled at intake (`src/stories/design-tokens/` present)
- [ ] `transformAndWrite` writes `src/stories/design-tokens/token-definitions.ts` with **all** exports above
- [ ] File banner: `AUTO-GENERATED — do not edit. Run: bun run tokens:sync`
- [ ] Keys/counts reflect **this** design system; shapes match stub
- [ ] `typographyVariants[].name` / `typographyTokenEntries[].key` exist in `typography-classes.ts`
- [ ] `tokenAppearance.schemes` in generated `colors.ts` lists every product scheme (Storybook theme bar reads this — no hardcoding)
- [ ] Colors story uses `resolveColorTokens(theme)` for swatch hex (scheme-aware)
- [ ] Phase C: `bunx tsc --noEmit` passes (stories type-check against exports)

---

## Gate

Storybook contract is part of Phase B when sync + Storybook are on.  
Incomplete or wrong-shaped `token-definitions.ts` → Phase B not done → do not start Phase C.

See also: [TOKEN_SYNC.md](./TOKEN_SYNC.md) (Uniwind `generated/*` contract).
