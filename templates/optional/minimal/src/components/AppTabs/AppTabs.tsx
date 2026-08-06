import { Tabs } from "expo-router";
import { useCSSVariable } from "uniwind";

import { Icon } from "@/components/Icon";
import type { ColorTokenName } from "@/theme";

const tabColorTokens = [
  "text-text-default",
  "text-text-secondary",
  "surface-default",
  "stroke-default",
] as const satisfies readonly ColorTokenName[];

const tabColorVars = tabColorTokens.map((token) => `--color-${token}`);

export default function AppTabs() {
  const [textDefault, textSecondary, surfaceDefault, strokeDefault] = useCSSVariable(
    tabColorVars,
  ) as [string, string, string, string];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: textDefault,
        tabBarInactiveTintColor: textSecondary,
        tabBarStyle: {
          backgroundColor: surfaceDefault,
          borderTopColor: strokeDefault,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Icon name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
