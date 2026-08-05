import "@/global.css";
import "@/i18n";
import "@/stores/preferences-store";

import { BottomSheetProvider } from "@swmansion/react-native-bottom-sheet";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useUniwind } from "uniwind";

import { AppToast } from "@/components/AppToast";
import { IconFontLoader } from "@/components/IconFontLoader";
import { SplashScreenController } from "@/components/SplashScreenController";
import { AnalyticsScreenTracker } from "@/services/analytics";
import { usePreferencesStore } from "@/stores/preferences-store";
import { isDarkUniwindTheme } from "@/theme/is-dark-uniwind-theme";

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardProvider>
        <BottomSheetProvider>
          <IconFontLoader>
            <ThemeProvider value={isDarkUniwindTheme(theme) ? DarkTheme : DefaultTheme}>
              <SplashScreenController />
              <AnalyticsScreenTracker />
              <RootNavigator />
              <AppToast />
            </ThemeProvider>
          </IconFontLoader>
        </BottomSheetProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const hasCompletedOnboarding = usePreferencesStore((state) => state.hasCompletedOnboarding);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      <Stack.Protected guard={hasCompletedOnboarding}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
