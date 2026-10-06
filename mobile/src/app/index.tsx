import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import { router, Stack } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { insertItem, saveExtractedData } from "../db/items";
import { savePhotoPermanently } from "../services/photos";
import { uploadPhoto } from "../services/upload";

type Status = "idle" | "processing" | "retrying" | "done" | "error";

const STATUS_COPY: Record<Exclude<Status, "idle">, string> = {
  processing: "Reading your photo...",
  retrying: "Service busy, retrying...",
  done: "Saved to your shelf",
  error: "Couldn't read it. Photo not saved",
};

const RETRY_HINT_DELAY_MS = 4000;

const ZOOM_STEPS = [
  { label: "1x", value: 0 },
  { label: "2x", value: 0.15 },
  { label: "3x", value: 0.3 },
];

function Corner({ className }: { className: string }) {
  return <View className={`absolute w-9 h-9 border-brand ${className}`} />;
}
export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [status, setStatus] = useState<Status>("idle");
  const [zoom, setZoom] = useState(0);
  const zoomStart = useRef(0);

  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      zoomStart.current = zoom;
    })
    .onUpdate((e) => {
      const next = zoomStart.current + (e.scale - 1) * 0.5;
      setZoom(Math.min(1, Math.max(0, next)));
    });

  if (!permission) {
    return (
      <View className="flex-1 bg-black">
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-cream items-center justify-center px-8 gap-6">
        <View className="w-20 h-20 rounded-3xl bg-brand-soft items-center justify-center">
          <Ionicons name="camera-outline" size={36} color="#C2531A" />
        </View>
        <View className="items-center gap-2">
          <Text className="text-2xl font-display text-ink">
            Allow camera access
          </Text>
          <Text className="text-sm font-body text-ink-soft text-center">
            mochiku needs your camera to scan bills, receipts and notices.
          </Text>
        </View>
        <TouchableOpacity
          onPress={requestPermission}
          activeOpacity={0.85}
          className="w-full bg-brand py-4 rounded-full items-center"
        >
          <Text className="text-white font-heading text-base">
            Allow camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const busy = status === "processing" || status === "retrying";

  const snap = async () => {
    if (busy) return;
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (!photo) return;

    setStatus("processing");
    const retryHintTimer = setTimeout(() => {
      setStatus((s) => (s === "processing" ? "retrying" : s));
    }, RETRY_HINT_DELAY_MS);

    try {
      const result = await uploadPhoto(photo.uri);

      if (!result.ok) {
        setStatus("error");
        return;
      }

      const permanentUri = savePhotoPermanently(photo.uri);
      const itemId = await insertItem(permanentUri);
      await saveExtractedData(itemId, result.extracted);
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(retryHintTimer);
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const flip = () => {
    setZoom(0);
    setFacing(facing === "back" ? "front" : "back");
  };

  return (
    <View className="flex-1 bg-night">
      <Stack.Screen options={{ headerShown: false }} />

      <GestureDetector gesture={pinch}>
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            flash={flash}
            zoom={zoom}
          />
        </View>
      </GestureDetector>

      <View
        pointerEvents="box-none"
        className="absolute inset-0"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-row items-center justify-between px-5">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
            className="w-11 h-11 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={20}
              color={flash === "on" ? "#fde047" : "#fff"}
            />
          </TouchableOpacity>

          <Text className="text-white text-base font-bold tracking-wide">
            mochiku
          </Text>
        </View>

        <View
          pointerEvents="none"
          className="flex-1 items-center justify-center px-10"
        >
          <View className="w-full aspect-[3/4] max-h-[70%]">
            <Corner className="top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl" />
            <Corner className="top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl" />
            <Corner className="bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl" />
            <Corner className="bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl" />
          </View>

          <View className="mt-5 h-9 justify-center">
            {status === "idle" ? (
              <Text className="text-white/80 text-sm font-body-medium">
                Fit the document inside the frame
              </Text>
            ) : (
              <View className="flex-row items-center gap-2 bg-night/80 rounded-full px-4 py-2">
                {busy && <ActivityIndicator size="small" color="#fff" />}
                {status === "done" && (
                  <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                )}
                {status === "error" && (
                  <Ionicons name="alert-circle" size={18} color="#fbbf24" />
                )}
                <Text className="text-white text-sm font-body-bold">
                  {STATUS_COPY[status]}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row justify-center gap-2 mb-5">
          {ZOOM_STEPS.map((z) => {
            const active = Math.abs(zoom - z.value) < 0.07;
            return (
              <TouchableOpacity
                key={z.label}
                activeOpacity={0.7}
                onPress={() => setZoom(z.value)}
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  active ? "bg-white" : "bg-black/40"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    active ? "text-gray-900" : "text-white"
                  }`}
                >
                  {z.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between px-8">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/home")}
            className="w-14 h-14 rounded-2xl bg-black/40 border border-white/30 overflow-hidden items-center justify-center"
          >
            <Ionicons name="home-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={busy}
            onPress={snap}
            className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
          >
            <View
              className={`w-[60px] h-[60px] rounded-full items-center justify-center ${busy ? "bg-white/60" : "bg-white"}`}
            >
              {busy && <ActivityIndicator color="#FF8A4C" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={flip}
            className="w-14 h-14 rounded-full bg-black/40 items-center justify-center"
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
