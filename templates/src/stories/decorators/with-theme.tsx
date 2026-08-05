import type { Decorator } from "@storybook/react-native";
import { Pressable, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";

import { IconFontLoader } from "@/components/IconFontLoader";
import { ThemedText } from "@/components/ThemedText";
import { type ColorSchemeName, tokenAppearance } from "@/theme/tokens/generated/colors";

type ThemeMode = "light" | "dark" | ColorSchemeName;

function ThemeToggleBar() {
  const { theme } = useUniwind();
  // Appearance always; product schemes from Phase B `tokenAppearance.schemes` (empty in stub).
  const modes: ThemeMode[] = ["light", "dark", ...tokenAppearance.schemes];

  return (
    <View className="flex-row flex-wrap gap-xs border-b border-stroke-default bg-surface-secondary px-base py-xs">
      <ThemedText variant="global-body-small" className="mr-xs">
        Theme:
      </ThemedText>
      {modes.map((mode) => (
        <Pressable
          key={mode}
          onPress={() => Uniwind.setTheme(mode)}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${mode} theme`}
          accessibilityHint="Changes the Storybook preview theme"
          className={`rounded-panel px-sm py-2xs ${
            theme === mode ? "bg-button-button-primary" : "bg-surface-tertiary"
          }`}
        >
          <ThemedText
            variant="global-body-small"
            colorToken={theme === mode ? "surface-default" : "text-text-default"}
            className="capitalize"
          >
            {mode}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export const withAppProviders: Decorator = (Story) => (
  <SafeAreaProvider>
    <IconFontLoader>
      <View className="flex-1 bg-surface-default">
        <ThemeToggleBar />
        <Story />
      </View>
    </IconFontLoader>
  </SafeAreaProvider>
);
