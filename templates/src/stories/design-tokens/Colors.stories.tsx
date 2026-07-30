import type { Meta, StoryObj } from "@storybook/react-native";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useUniwind } from "uniwind";

import { ThemedText } from "@/components/ThemedText";
import {
  type ColorPrimitiveGroup,
  type ColorTokenGroup,
  colorPrimitiveGroups,
  colorTokenGroups,
  type SemanticColorName,
  semanticColorClasses,
  semanticColors,
  tokenCounts,
} from "@/stories/design-tokens/token-definitions";

function ColorSwatch({ name }: { name: SemanticColorName }) {
  const { theme } = useUniwind();
  const mode = theme === "dark" ? "dark" : "light";
  const hex = semanticColors[mode][name];

  return (
    <View className="mb-sm w-[46%] overflow-hidden rounded-panel border border-stroke-default">
      <View className={`h-14 ${semanticColorClasses[name]}`} />
      <View className="gap-2xs bg-surface-secondary p-xs">
        <ThemedText variant="global-body-xxs">{name}</ThemedText>
        <ThemedText variant="global-body-xxs" colorToken="text-text-secondary">
          {hex}
        </ThemedText>
      </View>
    </View>
  );
}

function PrimitiveSwatch({ tokenName, value }: { tokenName: string; value: string }) {
  return (
    <View className="mb-sm w-[46%] overflow-hidden rounded-panel border border-stroke-default">
      <View className="h-14" style={{ backgroundColor: value }} />
      <View className="gap-2xs bg-surface-secondary p-xs">
        <ThemedText variant="global-body-xxs" numberOfLines={2}>
          {tokenName}
        </ThemedText>
        <ThemedText variant="global-body-xxs" colorToken="text-text-secondary">
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

function TokenGroupSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-sm">
      <ThemedText variant="global-body-small-bold">{title}</ThemedText>
      <View className="flex-row flex-wrap justify-between">{children}</View>
    </View>
  );
}

function ColorsShowcase() {
  const { theme } = useUniwind();
  const tokenGroups = Object.keys(colorTokenGroups) as ColorTokenGroup[];
  const primitiveGroups = Object.keys(colorPrimitiveGroups) as ColorPrimitiveGroup[];

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-base gap-lg">
      <View className="gap-2xs">
        <ThemedText variant="heading-app-section">Color Tokens</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          {tokenCounts.colorTokens} semantic tokens · {tokenCounts.colorPrimitives} color primitives
          · {tokenCounts.figmaTotal} total tokens in code · {theme === "dark" ? "dark" : "light"}{" "}
          mode
        </ThemedText>
      </View>

      {tokenGroups.map((group) => (
        <TokenGroupSection key={group} title={group}>
          {colorTokenGroups[group].map((token) => (
            <ColorSwatch key={token.tokenName} name={token.tokenName as SemanticColorName} />
          ))}
        </TokenGroupSection>
      ))}

      <View className="gap-2xs pt-base">
        <ThemedText variant="heading-app-section">Color Primitives</ThemedText>
        <ThemedText variant="global-body-small" colorToken="text-text-secondary">
          Static brand palette (no mode)
        </ThemedText>
      </View>

      {tokenCounts.colorPrimitives > 0 &&
        primitiveGroups.map((group) => (
          <TokenGroupSection key={group} title={`primitive / ${group}`}>
            {[...colorPrimitiveGroups[group]].map((token) => (
              <PrimitiveSwatch
                key={token.tokenName}
                tokenName={token.tokenName}
                value={token.value}
              />
            ))}
          </TokenGroupSection>
        ))}
    </ScrollView>
  );
}

const meta = {
  title: "Design Tokens/Colors",
  component: ColorsShowcase,
} satisfies Meta<typeof ColorsShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllTokenGroups: Story = {};
