import { Text, View } from "react-native";

export default function SleepyMochi() {
  return (
    <View className="items-center">
      <View className="w-24 h-20 rounded-[40px] bg-brand-soft items-center justify-center">
        <View className="flex-row gap-5 mb-1">
          <View className="w-3 h-0.5 rounded-full bg-ink-faint -rotate-6" />
          <View className="w-3 h-0.5 rounded-full bg-ink-faint rotate-6" />
        </View>
      </View>
      <Text className="text-lg text-ink-faint mt-1">z z z</Text>
    </View>
  );
}