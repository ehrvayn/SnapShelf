import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { getCategory } from "../constants/categories";
import { getTone } from "../constants/tones";
import { daysUntil } from "../hooks/useHomeData";
import { Item } from "../types/item";

export default function LibraryItemRow({
  item,
  isPicked,
  selecting,
  onPress,
  onLongPress,
}: {
  item: Item;
  isPicked: boolean;
  selecting: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const cat = getCategory(item.category);
  const tone = item.deadline_at ? getTone(daysUntil(item.deadline_at)) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      className={`flex-row items-center rounded-3xl p-3 mb-3 gap-3 border ${
        isPicked ? "bg-brand-soft border-brand" : "bg-paper border-line"
      }`}
    >
      <View className="relative">
        <Image
          source={{ uri: item.local_image_uri }}
          className={`w-[72px] h-[72px] rounded-2xl bg-cream ${
            isPicked ? "opacity-50" : ""
          }`}
          resizeMode="cover"
        />
        {isPicked && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-8 h-8 rounded-full bg-brand items-center justify-center">
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
          </View>
        )}
        {!selecting && (
          <View
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: cat.bg }}
          >
            <Ionicons name={cat.icon} size={12} color={cat.fg} />
          </View>
        )}
      </View>

      <View className="flex-1 gap-1.5">
        <Text className="text-base font-heading text-ink" numberOfLines={2}>
          {item.title ?? "Untitled"}
        </Text>
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-xs font-body-medium" style={{ color: cat.fg }}>
            {cat.label}
          </Text>
          {tone && (
            <View className={`${tone.box} rounded-full px-2.5 py-0.5`}>
              <Text className={`text-xs font-body-bold ${tone.text}`}>
                {tone.label}
              </Text>
            </View>
          )}
        </View>
      </View>

      {!selecting && (
        <Ionicons name="chevron-forward" size={18} color="#D9D0C0" />
      )}
    </TouchableOpacity>
  );
}