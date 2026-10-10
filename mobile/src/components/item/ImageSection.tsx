import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { softShadow } from "../../constants/tones";

export default function ImageSection({ uri }: { uri: string }) {
  const [open, setOpen] = useState(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2.5);
        savedScale.value = 2.5;
      }
    });

  const gestures = Gesture.Simultaneous(
    pinch,
    Gesture.Simultaneous(pan, doubleTap),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          resetZoom();
          setOpen(true);
        }}
        className="bg-paper border border-line rounded-3xl p-2 relative"
        style={softShadow}
      >
        <Image
          className="w-full h-80 rounded-2xl bg-cream"
          source={{ uri }}
          resizeMode="contain"
        />
        <View className="absolute bottom-4 right-4 bg-ink/70 px-3 py-1.5 rounded-full flex-row items-center gap-1">
          <Ionicons name="expand-outline" size={14} color="#FFF8EC" />
          <Text className="text-xs font-body-bold text-cream">Tap to zoom</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-ink/95 justify-center items-center overflow-hidden">
            <GestureDetector gesture={gestures}>
              <View className="w-full h-full justify-center items-center">
                <Animated.Image
                  source={{ uri }}
                  resizeMode="contain"
                  style={[{ width: "100%", height: "100%" }, animatedStyle]}
                />
              </View>
            </GestureDetector>

            <TouchableOpacity
              onPress={() => setOpen(false)}
              className="absolute top-12 right-6 bg-paper/20 p-2.5 rounded-full z-50"
            >
              <Ionicons name="close" size={24} color="#FFF8EC" />
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </>
  );
}
