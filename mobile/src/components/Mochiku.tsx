import { View } from "react-native";

type Mood = "idle" | "happy" | "sleeping";

export default function Mochiku({
  mood = "idle",
  size = 56,
}: {
  mood?: Mood;
  size?: number;
}) {
  const sleeping = mood === "sleeping";
  const happy = mood === "happy";

  return (
    <View
      style={{ width: size, height: size * 0.85 }}
      className="bg-cream rounded-[999px] items-center justify-center relative border border-line"
    >
      {/* cheeks */}
      <View className="absolute flex-row w-full justify-between px-2 top-[38%]">
        <View
          style={{ width: size * 0.22, height: size * 0.22 }}
          className="rounded-full bg-brand-soft"
        />
        <View
          style={{ width: size * 0.22, height: size * 0.22 }}
          className="rounded-full bg-brand-soft"
        />
      </View>

      {/* eyes */}
      <View className="flex-row gap-3">
        {sleeping ? (
          <>
            <View className="w-2.5 h-0.5 rounded-full bg-ink" />
            <View className="w-2.5 h-0.5 rounded-full bg-ink" />
          </>
        ) : (
          <>
            <View
              style={{ height: happy ? size * 0.08 : size * 0.12 }}
              className="w-1.5 rounded-full bg-ink"
            />
            <View
              style={{ height: happy ? size * 0.08 : size * 0.12 }}
              className="w-1.5 rounded-full bg-ink"
            />
          </>
        )}
      </View>

      {sleeping && (
        <View className="absolute -top-2 -right-1">
          <View className="w-2 h-2 rounded-sm bg-ink-faint rotate-45" />
        </View>
      )}
    </View>
  );
}
