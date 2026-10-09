import { Image, ScrollView, Text, View } from "react-native";
import { Item } from "../types/item";

export default function DraftStrip({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="text-xs font-body-bold text-ink-faint px-5 mb-2">
        Mochiku is still reading {items.length}{" "}
        {items.length === 1 ? "photo" : "photos"}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-5 gap-2"
      >
        {items.map((item) => (
          <View
            key={item.id}
            className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-brand/40"
          >
            <Image
              source={{ uri: item.local_image_uri }}
              className="w-full h-full opacity-50"
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}