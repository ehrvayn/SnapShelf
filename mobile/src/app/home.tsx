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
    { title: `To confirm (${pending.length})`, data: pending },
    { title: "Upcoming", data: upcoming },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderSectionHeader={({ section }) => (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          {section.title}
        </Text>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <Text style={{ color: "#888" }}>Nothing here yet.</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/review/[id]", params: { id: item.id } })
          }
          style={{ paddingVertical: 10 }}
        >
          <Text style={{ fontWeight: "600" }}>{item.title ?? "Untitled"}</Text>
          <Text>
            {item.deadline_at
              ? new Date(item.deadline_at).toDateString()
              : "No deadline"}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
