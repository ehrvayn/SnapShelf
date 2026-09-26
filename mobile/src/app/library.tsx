import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { getAllItems } from "../db/items";
import { Item } from "../types/item";

export default function Library() {
  const [items, setItems] = useState<Item[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllItems().then(setItems);
    }, []),
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text>No items yet. Snap something!</Text>}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "row",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: item.local_image_uri }}
            style={{ width: 72, height: 72, borderRadius: 8, marginRight: 12 }}
          />
          <View>
            <Text style={{ fontWeight: "600" }}>
              {item.title ?? "Untitled"}
            </Text>
            <Text>{item.status}</Text>
          </View>
        </View>
      )}
    />
  );
}
