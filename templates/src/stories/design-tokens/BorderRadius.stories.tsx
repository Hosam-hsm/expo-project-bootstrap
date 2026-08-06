import type { Meta, StoryObj } from "@storybook/react-native";
import { ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { radiusTokens } from "@/stories/design-tokens/token-definitions";

function RadiusShowcase() {
  const entries = Object.entries(radiusTokens) as [keyof typeof radiusTokens, number][];

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-base gap-base">
      <View className="gap-xs">
        <ThemedText variant="heading-app-section">Border Radius</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          Radius tokens from generated spacing.css
        </ThemedText>
      </View>

      <View className="flex-row flex-wrap gap-lg">
        {entries.map(([name, px]) => (
          <View key={name} className="items-center gap-xs">
            <View
              className="h-20 w-20 border-2 border-stroke-default bg-button-button-secondary"
              style={{ borderRadius: px }}
            />
            <ThemedText variant="global-body-xxs">{name}</ThemedText>
            <ThemedText variant="global-body-xxs" colorToken="text-text-secondary">
              {px}px
            </ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const meta = {
  title: "Design Tokens/Border Radius",
  component: RadiusShowcase,
} satisfies Meta<typeof RadiusShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tokens: Story = {};
