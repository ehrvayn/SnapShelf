import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
import { getItemsByStatus, getUpcomingItems } from "../db/items";
import { Item } from "../types/item";

export default function Home() {
  const [pending, setPending] = useState<Item[]>([]);
  const [upcoming, setUpcoming] = useState<Item[]>([]);

  useFocusEffect(
    useCallback(() => {
      getItemsByStatus("pending_review").then(setPending);
      getUpcomingItems().then(setUpcoming);
    }, []),
  );

  const sections = [
    { title: `To Confirm (${pending.length})`, data: pending },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      className="flex-1 bg-white"
      contentContainerClassName="p-5 pb-12 gap-1"
      renderSectionHeader={({ section }) => (
        <View className="py-3 bg-white">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {section.title}
          </Text>
        </View>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <View className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Text className="text-sm text-gray-400 font-medium">
              Nothing here yet.
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/review/[id]", params: { id: item.id } })
          }
          className="bg-gray-50 border border-gray-300 p-4 mb-3 gap-1"
          activeOpacity={0.7}
        >
          <Text className="text-base font-bold text-gray-900">
            {item.title ?? "Untitled"}
          </Text>
          <Text className="text-xs font-medium text-gray-400">
            {item.deadline_at
              ? new Date(item.deadline_at).toDateString()
              : "No deadline"}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
