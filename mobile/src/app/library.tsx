import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getItemsByStatus, getAllItems } from "../db/items";
import { Item } from "../types/item";

const CATEGORIES = ["Bill", "Receipt", "School", "Work", "Promo", "Other"];

const normalize = (value: string | null) => (value ?? "").trim().toLowerCase();

const getCategoryOf = (item: Item) => {
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === normalize(item.category),
  );
  return match ?? "Other";
};

export default function Library() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState("All");

  useFocusEffect(
    useCallback(() => {
      getAllItems().then(setItems);
    }, []),
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: items.length };
    CATEGORIES.forEach((c) => (result[c] = 0));
    items.forEach((i) => {
      result[getCategoryOf(i)] += 1;
    });
    return result;
  }, [items]);

  const filtered = useMemo(
    () =>
      selected === "All"
        ? items
        : items.filter((i) => getCategoryOf(i) === selected),
    [items, selected],
  );

  return (
    <>
      <Stack.Screen options={{ title: "Library" }} />

      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-5 py-3 gap-2"
          >
            {["All", ...CATEGORIES].map((cat) => {
              const active = selected === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.7}
                  onPress={() => setSelected(cat)}
                  className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                    active
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {cat}
                  </Text>
                  <Text
                    className={`text-xs font-bold ${
                      active ? "text-indigo-200" : "text-gray-400"
                    }`}
                  >
                    {counts[cat]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-5 pb-36"
          ListEmptyComponent={
            <View className="p-6 bg-white rounded-2xl border border-dashed border-gray-300 items-center">
              <Text className="text-sm text-gray-400 font-medium">
                {items.length === 0
                  ? "No items yet. Snap something!"
                  : `No ${selected.toLowerCase()} items.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/item/[id]",
                  params: { id: item.id },
                })
              }
              className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-3 mb-3 gap-3 shadow-sm"
            >
              <Image
                source={{ uri: item.local_image_uri }}
                className="w-[72px] h-[72px] rounded-xl bg-gray-100"
                resizeMode="cover"
              />
              <View className="flex-1 gap-1">
                <Text
                  className="text-base font-bold text-gray-900"
                  numberOfLines={2}
                >
                  {item.title ?? "Untitled"}
                </Text>
                <View className="self-start bg-indigo-50 rounded-full px-2.5 py-0.5">
                  <Text className="text-xs font-semibold text-indigo-600">
                    {getCategoryOf(item)}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-gray-400">
                  Added {new Date(item.created_at).toDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />

      </View>
    </>
  );
}
