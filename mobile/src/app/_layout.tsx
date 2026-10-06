import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FloatingNav from "../components/FloatingNav";
import { useEffect } from "react";
import {
  registerForNotificationsAsync,
  syncReminders,
} from "../services/notifications";
import { Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Nunito_700Bold,
    Nunito_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    registerForNotificationsAsync();
  }, []);

  useEffect(() => {
    registerForNotificationsAsync().then((granted) => {
      if (granted) syncReminders();
    });
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{ contentStyle: { backgroundColor: "#FFF8EC" } }}
          />

          <FloatingNav />
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
