import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CATEGORIES, IconName, getCategory } from "../constants/categories";
import { getTone, softShadow } from "../constants/tones";
import { DeadlineEntry, MONTHS, daysUntil } from "../hooks/useHomeData";
import { Item } from "../types/item";

const openItem = (id: string) =>
  router.push({ pathname: "/item/[id]", params: { id } });

function CategoryChip({ value }: { value: string | null }) {
  const c = getCategory(value);
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1 self-start"
      style={{ backgroundColor: c.bg }}
    >
      <Ionicons name={c.icon} size={12} color={c.fg} />
      <Text className="text-xs font-body-bold" style={{ color: c.fg }}>
        {c.label}
      </Text>
    </View>
  );
}

export function HomeHeader({ pendingCount }: { pendingCount: number }) {
  const now = new Date();
  const h = now.getHours();
  const greeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="px-5 mb-6">
      <Text className="text-sm font-body-medium text-ink-faint">{today}</Text>
      <Text className="text-3xl font-display text-ink mt-0.5">{greeting}</Text>
      <Text className="text-base font-body text-ink-soft mt-1">
        {pendingCount > 0
          ? `${pendingCount} ${pendingCount === 1 ? "item needs" : "items need"} your review`
          : "You're all caught up"}
      </Text>
    </View>
  );
}

export function NextUpCard({ entry }: { entry: DeadlineEntry }) {
  const { item, days } = entry;
  const tone = getTone(days);
  const big =
    days < 0
      ? "Overdue"
      : days === 0
        ? "Today"
        : days === 1
          ? "Tomorrow"
          : `${days}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openItem(item.id)}
      className={`mx-5 mb-8 rounded-3xl p-5 ${tone.hero}`}
      style={softShadow}
    >
      <View className="flex-row items-center justify-between">
        <Text className={`text-sm font-body-bold ${tone.heroSub}`}>
          Next up
        </Text>
        <CategoryChip value={item.category} />
      </View>
      <Text
        className={`text-2xl font-display mt-2 ${tone.heroText}`}
        numberOfLines={2}
      >
        {item.title ?? "Untitled"}
      </Text>
      <View className="flex-row items-end justify-between mt-5">
        <View className="flex-row items-end gap-1.5">
          <Text
            className={`text-5xl font-display leading-[54px] ${tone.heroText}`}
          >
            {big}
          </Text>
          {days > 1 && (
            <Text className={`text-base font-body-bold pb-2 ${tone.heroSub}`}>
              days left
            </Text>
          )}
        </View>
        <Text className={`text-sm font-body-medium pb-2 ${tone.heroSub}`}>
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
        <Text className="text-xl font-heading text-ink">{title}</Text>
        {subtitle && (
          <Text className="text-xs font-body-medium text-ink-faint">
            {subtitle}
          </Text>
        )}
      </View>
      {!!count && (
        <View className="bg-brand-soft rounded-full px-3 py-1">
          <Text className="text-xs font-body-bold text-brand-ink">{count}</Text>
        </View>
      )}
    </View>
  );
}

export function EmptyCard({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View className="mx-5 p-6 bg-paper rounded-3xl border border-dashed border-line items-center gap-2">
      <Ionicons name={icon} size={26} color="#A39DB0" />
      <Text className="text-sm font-body-medium text-ink-faint text-center">
        {text}
      </Text>
    </View>
  );
}

export function ReviewCard({ item }: { item: Item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openItem(item.id)}
      className="w-60 bg-paper border border-line rounded-3xl overflow-hidden mr-3"
      style={softShadow}
    >
      <View>
        <Image
          source={{ uri: item.local_image_uri }}
          className="w-full h-28 bg-cream"
          resizeMode="cover"
        />
        <View className="absolute top-2 left-2">
          <CategoryChip value={item.category} />
        </View>
      </View>
      <View className="p-4 gap-1">
        <Text className="text-base font-heading text-ink" numberOfLines={1}>
          {item.title ?? "Untitled"}
        </Text>
        <Text className="text-xs font-body-medium text-ink-faint">
          {item.deadline_at
            ? `Due ${new Date(item.deadline_at).toDateString()}`
            : "No deadline detected"}
        </Text>
        <View className="mt-3 bg-brand rounded-full py-2.5 flex-row items-center justify-center gap-1.5">
          <Text className="text-white text-sm font-body-bold">Review</Text>
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
      activeOpacity={0.8}
      onPress={() => openItem(item.id)}
      className="flex-row bg-paper border border-line rounded-3xl mb-3 overflow-hidden"
    >
      <View className={`w-1.5 ${tone.bar}`} />
      <View className="flex-1 flex-row items-center p-3 gap-3">
        <View
          className={`w-14 h-14 rounded-2xl items-center justify-center ${tone.box}`}
        >
          <Text className={`text-xs font-body-bold ${tone.text}`}>
            {MONTHS[date.getMonth()]}
          </Text>
          <Text className={`text-xl font-display ${tone.text}`}>
            {date.getDate()}
          </Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-base font-heading text-ink" numberOfLines={1}>
            {item.title ?? "Untitled"}
          </Text>
          <Text className={`text-xs font-body-bold ${tone.text}`}>
            {tone.label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D9D0C0" />
      </View>
    </TouchableOpacity>
  );
}

export function LibraryCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/library")}
      className="mx-5 bg-paper border border-line rounded-3xl p-5 gap-4"
      style={softShadow}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-heading text-ink">Your library</Text>
          <Text className="text-xs font-body-medium text-ink-faint">
            Everything you've stored
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-brand-ink font-body-bold text-sm">Browse</Text>
          <Ionicons name="chevron-forward" size={16} color="#C2531A" />
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <View
            key={c.label}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: c.bg }}
          >
            <Ionicons name={c.icon} size={13} color={c.fg} />
            <Text className="text-xs font-body-bold" style={{ color: c.fg }}>
              {c.label}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
