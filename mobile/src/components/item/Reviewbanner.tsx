import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function ReviewBanner({
  labels,
  reviewing,
}: {
  labels: string[]; 
  reviewing: boolean; 
}) {
  if (labels.length === 0) {
    if (!reviewing) return null;
    return (
      <View className="flex-row items-center gap-3 bg-calm-soft rounded-3xl p-4">
        <Ionicons name="checkmark-circle" size={26} color="#1F8A6B" />
        <View className="flex-1">
          <Text className="text-sm font-body-bold text-calm-ink">
            Everything looks clear
          </Text>
          <Text className="text-xs font-body text-calm-ink">
            Confirm to save it.
          </Text>
        </View>
      </View>
    );
  }

  if (!reviewing) {
    return (
      <View className="flex-row items-center gap-3 bg-soon-soft rounded-2xl p-4">
        <Ionicons name="help-circle" size={22} color="#9A6400" />
        <Text className="flex-1 text-sm font-body-bold text-soon-ink">
          {labels.length}{" "}
          {labels.length === 1 ? "detail needs" : "details need"} a quick check
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-soon-soft border border-soon rounded-3xl p-4 gap-3">
      <View className="flex-row items-center gap-3">
        <Ionicons name="help-circle" size={26} color="#9A6400" />
        <View className="flex-1">
          <Text className="text-base font-heading text-soon-ink">
            Please check {labels.length === 1 ? "this" : "these"} first
          </Text>
          <Text className="text-xs font-body text-soon-ink">
            Not sure I read {labels.length === 1 ? "it" : "them"} right.
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {labels.map((label) => (
          <View
            key={label}
            className="bg-paper rounded-full px-3 py-1.5 border border-dashed border-soon"
          >
            <Text className="text-xs font-body-bold text-soon-ink">
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
