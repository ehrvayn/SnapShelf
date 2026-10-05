import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import("expo-notifications");

let cached: NotificationsModule | null = null;

export function getNotifications(): NotificationsModule | null {
  if (isExpoGo && Platform.OS === "android") return null;
  if (!cached) {
    cached = require("expo-notifications") as NotificationsModule;
    cached.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
  return cached;
}

export async function registerForNotificationsAsync(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.log("Notifications are unavailable in Expo Go on Android");
    return false;
  }

  if (!Device.isDevice) {
    console.log("Must use a physical device for notifications");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}