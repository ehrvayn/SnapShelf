import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  DeadlineEntry,
  MONTHS,
  daysUntil,
  getTone,
} from "../hooks/useHomeData";
import { Item } from "../types/item";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const openItem = (id: string) =>
  router.push({ pathname: "/item/[id]", params: { id } });

const CATEGORIES: { label: string; icon: IconName }[] = [
  { label: "Bill", icon: "document-text-outline" },
  { label: "Receipt", icon: "receipt-outline" },
  { label: "School", icon: "school-outline" },
  { label: "Work", icon: "briefcase-outline" },
  { label: "Promo", icon: "pricetag-outline" },
  { label: "Other", icon: "ellipsis-horizontal-circle-outline" },
];

export function HomeHeader({ pendingCount }: { pendingCount: number }) {
  const h = new Date().getHours();
  const greeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  return (
    <View className="flex-row items-center justify-between px-5 mb-5">
      <View className="flex-1 pr-3">
        <Text className="text-3xl font-extrabold text-gray-900">
          {greeting}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? "item needs" : "items need"} your review`
            : "You're all caught up"}
        </Text>
      </View>
    </View>
  );
}

export function NextUpCard({ entry }: { entry: DeadlineEntry }) {
  const { item, days } = entry;
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openItem(item.id)}
      className="mx-5 mb-8 bg-indigo-600 rounded-3xl p-5 shadow-md"
    >
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="time-outline" size={14} color="#c7d2fe" />
        <Text className="text-xs font-bold uppercase tracking-widest text-indigo-200">
          Next up
        </Text>
      </View>
      <Text className="text-xl font-bold text-white mt-1" numberOfLines={2}>
        {item.title ?? "Untitled"}
      </Text>
      <View className="flex-row items-end justify-between mt-4">
        <View className="flex-row items-end gap-1.5">
          <Text className="text-5xl font-extrabold text-white leading-[52px]">
            {label}
          </Text>
          {days > 1 && (
            <Text className="text-base font-semibold text-indigo-200 pb-1.5">
              days left
            </Text>
          )}
        </View>
        <Text className="text-sm font-medium text-indigo-200 pb-1.5">
          {new Date(item.deadline_at!).toDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function SectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <View className="flex-row items-end justify-between px-5 mb-3">
      <View>
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-xs font-medium text-gray-400">{subtitle}</Text>
        )}
      </View>
      {!!count && (
        <View className="bg-indigo-100 rounded-full px-2.5 py-1">
          <Text className="text-xs font-bold text-indigo-600">{count}</Text>
        </View>
      )}
    </View>
  );
}

export function EmptyCard({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="mx-5 p-6 bg-white rounded-2xl border border-dashed border-gray-300 items-center gap-2">
      <Ionicons name={icon} size={26} color="#9ca3af" />
      <Text className="text-sm text-gray-400 font-medium text-center">
        {text}
      </Text>
    </View>
  );
}

export function ReviewCard({ item }: { item: Item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openItem(item.id)}
      className="w-60 bg-white border border-gray-200 rounded-3xl overflow-hidden mr-3 shadow-sm"
    >
      <Image
        source={{ uri: item.local_image_uri }}
        className="w-full h-28 bg-gray-100"
        resizeMode="cover"
      />
      <View className="p-3.5 gap-1">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
          {item.title ?? "Untitled"}
        </Text>
        <Text className="text-xs font-medium text-gray-400">
          {item.deadline_at
            ? `Due ${new Date(item.deadline_at).toDateString()}`
            : "No deadline detected"}
        </Text>
        <View className="mt-2 bg-indigo-600 rounded-xl py-2 flex-row items-center justify-center gap-1.5">
          <Text className="text-white text-sm font-semibold">Review</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function DeadlineRow({ item }: { item: Item }) {
  const date = new Date(item.deadline_at!);
  const tone = getTone(daysUntil(item.deadline_at!));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openItem(item.id)}
      className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-3 mb-2.5 gap-3"
    >
      <View
        className={`w-14 h-14 rounded-xl items-center justify-center ${tone.box}`}
      >
        <Text className={`text-[10px] font-bold tracking-wider ${tone.text}`}>
          {MONTHS[date.getMonth()]}
        </Text>
        <Text className={`text-xl font-extrabold ${tone.text}`}>
          {date.getDate()}
        </Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {item.title ?? "Untitled"}
        </Text>
        <Text className={`text-xs font-semibold mt-0.5 ${tone.text}`}>
          {tone.label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}

export function LibraryCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/library")}
      className="mx-5 bg-white border border-gray-200 rounded-3xl p-5 gap-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">Your Library</Text>
          <Text className="text-xs font-medium text-gray-400">
            Everything you've stored
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-indigo-600 font-semibold text-sm">Browse</Text>
          <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <View
            key={c.label}
            className="flex-row items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5"
          >
            <Ionicons name={c.icon} size={13} color="#4b5563" />
            <Text className="text-xs font-semibold text-gray-600">
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
