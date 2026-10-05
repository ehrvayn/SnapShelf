import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FloatingNav from "../components/FloatingNav";
import { useEffect } from "react";
import { registerForNotificationsAsync } from "../services/notifications";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    registerForNotificationsAsync();
  }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ animation: "fade" }} />
          <FloatingNav />
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
