import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Item } from "../types/item";

const TONES = {
  red: { box: "bg-red-50", text: "text-red-600" },
  amber: { box: "bg-amber-50", text: "text-amber-600" },
  indigo: { box: "bg-indigo-50", text: "text-indigo-600" },
  gray: { box: "bg-gray-100", text: "text-gray-500" },
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Processing",
  pending_review: "To confirm",
  confirmed: "Confirmed",
  stored: "Stored",
};

function getDeadlineChip(deadline: string | null) {
  if (!deadline) return null;
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return { label: "Overdue", tone: TONES.red };
  if (days === 0) return { label: "Today", tone: TONES.amber };
  if (days === 1) return { label: "Tomorrow", tone: TONES.amber };
  if (days <= 7) return { label: `${days} days left`, tone: TONES.indigo };
  return { label: `${days} days left`, tone: TONES.gray };
}

export default function ItemCard({
  item,
  showStatus = false,
}: {
  item: Item;
  showStatus?: boolean;
}) {
  const chip = getDeadlineChip(item.deadline_at);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({ pathname: "/item/[id]", params: { id: item.id } })
      }
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 gap-3 shadow-sm"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text
          className="flex-1 text-base font-bold text-gray-900"
          numberOfLines={2}
        >
          {item.title ?? "Untitled"}
        </Text>
        {showStatus && (
          <View className="bg-gray-100 rounded-full px-2.5 py-1">
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium text-gray-400">
          {item.deadline_at
            ? new Date(item.deadline_at).toDateString()
            : "No deadline"}
        </Text>
        {chip && (
          <View className={`${chip.tone.box} rounded-full px-2.5 py-1`}>
            <Text className={`text-xs font-semibold ${chip.tone.text}`}>
              {chip.label}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}