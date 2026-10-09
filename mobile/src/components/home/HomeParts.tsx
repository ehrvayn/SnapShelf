import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getCategory } from "../../constants/categories";
import { getTone, softShadow } from "../../constants/tones";
import { DeadlineEntry, MONTHS } from "../../hooks/useHomeData";
import { Item } from "../../types/item";

const openItem = (id: string) =>
  router.push({ pathname: "/item/[id]", params: { id } });

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

function CategoryTag({ value }: { value: string | null }) {
  const c = getCategory(value);
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={c.icon} size={12} color={c.fg} />
      <Text className="text-xs font-body-bold" style={{ color: c.fg }}>
        {c.label}
      </Text>
    </View>
  );
}

export function MascotHeader({
  message,
  avatar,
}: {
  message: string;
  avatar?: ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-4 px-5 mb-8">
      {avatar ?? (
        <View className="w-16 h-16 rounded-full bg-brand-soft items-center justify-center">
          <Ionicons name="paw" size={26} color="#C2531A" />
        </View>
      )}
      <View className="flex-1 justify-center">
        <View className="bg-paper border border-line rounded-3xl px-4 py-3.5">
          <Text className="text-base font-heading text-ink">{message}</Text>
        </View>
        <View className="absolute -left-1.5 top-1/2 -mt-1.5 w-3 h-3 bg-paper border-l border-b border-line rotate-45" />
      </View>
    </View>
  );
}

export function NextUpCard({ entry }: { entry: DeadlineEntry }) {
  const { item, days } = entry;
  const tone = getTone(days);
  const word = days === 0 ? "Today" : days === 1 ? "Tomorrow" : String(days);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openItem(item.id)}
      className="mx-5 mb-8 flex-row bg-paper border border-line rounded-3xl overflow-hidden"
      style={softShadow}
    >
      <View className={`w-24 items-center justify-center py-5 ${tone.hero}`}>
        <Text
          className={`font-display ${tone.heroText} ${
            days > 1 ? "text-4xl" : "text-lg"
          }`}
        >
          {word}
        </Text>
        {days > 1 && (
          <Text className={`text-sm font-body-bold ${tone.heroSub}`}>
            days left
          </Text>
        )}
      </View>

      <View className="flex-1 p-4 gap-1.5">
        <Text className="text-xs font-body-bold text-ink-faint">Next up</Text>
        <Text className="text-lg font-heading text-ink" numberOfLines={2}>
          {item.title ?? "Untitled"}
        </Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-sm font-body-medium text-ink-soft">
            {shortDate(item.deadline_at!)}
          </Text>
          <CategoryTag value={item.category} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="px-5 mb-3">
      <Text className="text-xl font-heading text-ink">{title}</Text>
      {subtitle && (
        <Text className="text-xs font-body-medium text-ink-faint mt-0.5">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/** Compact card for an item whose deadline the AI was unsure about. */
export function ReviewCard({ item }: { item: Item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openItem(item.id)}
      className="w-72 flex-row items-center gap-3 bg-paper border border-line rounded-3xl p-3 mr-3"
    >
      <Image
        source={{ uri: item.local_image_uri }}
        className="w-14 h-14 rounded-2xl bg-cream"
        resizeMode="cover"
      />
      <View className="flex-1 gap-1">
        <Text className="text-base font-heading text-ink" numberOfLines={1}>
          {item.title ?? "Untitled"}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-soon" />
          <Text
            className="flex-1 text-xs font-body-bold text-soon-ink"
            numberOfLines={1}
          >
            {item.deadline_at
              ? `Read as ${shortDate(item.deadline_at)}`
              : "No date found"}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D9D0C0" />
    </TouchableOpacity>
  );
}

function DeadlineRow({
  entry,
  first,
}: {
  entry: DeadlineEntry;
  first: boolean;
}) {
  const { item, days } = entry;
  const date = new Date(item.deadline_at!);
  const tone = getTone(days);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => openItem(item.id)}
      className={`flex-row items-center gap-4 px-4 py-3.5 ${
        first ? "" : "border-t border-line"
      }`}
    >
      <View className="w-10 items-center">
        <Text className="text-xs font-body-bold text-ink-faint">
          {MONTHS[date.getMonth()]}
        </Text>
        <Text className="text-xl font-display text-ink">{date.getDate()}</Text>
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-heading text-ink" numberOfLines={1}>
          {item.title ?? "Untitled"}
        </Text>
        <CategoryTag value={item.category} />
      </View>

      {/* urgency is carried by this one colored label */}
      <Text className={`text-xs font-body-bold ${tone.text}`}>
        {tone.label}
      </Text>
    </TouchableOpacity>
  );
}

export function DeadlineGroup({
  title,
  items,
}: {
  title: string;
  items: DeadlineEntry[];
}) {
  return (
    <View className="px-5 mb-5">
      <Text
        className={`text-sm font-body-bold mb-2 ${
          title === "Overdue" ? "text-urgent-ink" : "text-ink-soft"
        }`}
      >
        {title}
      </Text>
      <View className="bg-paper border border-line rounded-3xl overflow-hidden">
        {items.map((e, i) => (
          <DeadlineRow key={e.item.id} entry={e} first={i === 0} />
        ))}
      </View>
    </View>
  );
}
