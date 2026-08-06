import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { spacingTokens } from "@/stories/design-tokens/token-definitions";

function SpacingShowcase() {
  const entries = Object.entries(spacingTokens) as [keyof typeof spacingTokens, number][];

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-base gap-base">
      <View className="gap-xs">
        <ThemedText variant="heading-app-section">Spacing Scale</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          Size tokens from generated spacing.css (Figma Foundations when synced)
        </ThemedText>
      </View>

      {entries.map(([name, px]) => (
        <View key={name} className="flex-row items-center gap-sm">
          <View className="w-28">
            <ThemedText variant="global-body-xxs">{name}</ThemedText>
            <ThemedText variant="global-body-xxs" colorToken="text-text-secondary">
              {px}px
            </ThemedText>
          </View>
          <View className="h-6 bg-button-button-primary" style={{ width: px }} />
          <View
            className="h-6 rounded-tile border border-dashed border-stroke-default bg-surface-secondary"
            style={{ width: px, height: px }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const meta = {
  title: "Design Tokens/Spacing",
  component: SpacingShowcase,
} satisfies Meta<typeof SpacingShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
