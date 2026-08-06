import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { fontFamilies, typographyVariants } from "@/stories/design-tokens/token-definitions";
import type { TypographyTokenName } from "@/theme";

function TypographyShowcase() {
  return (
    <ScrollView className="flex-1" contentContainerClassName="p-base gap-lg">
      <View className="gap-xs">
        <ThemedText variant="heading-app-section">Font Families</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          Distinct families from Figma typography export (token-definitions)
        </ThemedText>
      </View>

      {(Object.entries(fontFamilies) as [string, string][]).map(([name, stack]) => (
        <View
          key={name}
          className="gap-2xs rounded-panel border border-stroke-default bg-surface-secondary p-sm"
        >
          <ThemedText
            variant="global-body-xxs"
            colorToken="text-text-secondary"
            style={{ textTransform: "uppercase" }}
          >
            {name}
          </ThemedText>
          <ThemedText variant="global-body-base" style={{ fontFamily: name }}>
            The quick brown fox — {stack.split(",")[0]}
          </ThemedText>
        </View>
      ))}

      <View className="gap-xs">
        <ThemedText variant="heading-app-section">Typography Variants</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          All typography tokens via ThemedText
        </ThemedText>
      </View>

      {typographyVariants.map((variant) => (
        <View key={variant.name} className="gap-2xs border-b border-stroke-default pb-sm">
          <ThemedText variant="global-body-xxs" colorToken="text-text-secondary">
            {variant.label} — {variant.size}px / {variant.lineHeight ?? "auto"} lh /{" "}
            {variant.weight}
          </ThemedText>
          <ThemedText variant={variant.name as TypographyTokenName}>
            {variant.label}: design system sample
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

const meta = {
  title: "Design Tokens/Typography",
  component: TypographyShowcase,
} satisfies Meta<typeof TypographyShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FontFamiliesAndVariants: Story = {};
