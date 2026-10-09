import { Image, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Item } from "../types/item";

function ThinkingDots() {
  const puff = useSharedValue(0);

  useEffect(() => {
    puff.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 500 }),
      ),
      -1,
    );
  }, []);

  const dotStyle = (delay: number) =>
    useAnimatedStyle(() => ({
      opacity: 0.4 + puff.value * 0.6,
      transform: [{ scale: 0.85 + puff.value * 0.3 * (1 - delay * 0.3) }],
    }));

  return (
    <View className="flex-row gap-1">
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={dotStyle(i)}
          className="w-1.5 h-1.5 rounded-full bg-brand"
        />
      ))}
    </View>
  );
}

export default function DraftRow({ item }: { item: Item }) {
  return (
    <View className="flex-row items-center rounded-3xl p-3 mb-3 gap-3 bg-paper border border-dashed border-brand/30">
      <View className="w-14 h-14 rounded-2xl overflow-hidden bg-cream">
        <Image
          source={{ uri: item.local_image_uri }}
          className="w-full h-full opacity-60"
          resizeMode="cover"
        />
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-sm font-heading text-ink">
          Mochiku's holding onto this one
        </Text>
        <Text className="text-xs font-body-medium text-ink-faint">
          Will snap into place once you're back online
        </Text>
      </View>

      <ThinkingDots />
    </View>
  );
}
