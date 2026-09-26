import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, View } from "react-native";
import { getItemById } from "../../db/items";
import { Item } from "../../types/item";

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    getItemById(id).then(setItem);
  }, [id]);

  if (!item) return <Text style={{ padding: 16 }}>Loading...</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Image
        source={{ uri: item.local_image_uri }}
        style={{ width: "100%", height: 300, borderRadius: 12 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 28, fontWeight: "700", marginTop: 16 }}>
        {item.deadline_at
          ? new Date(item.deadline_at).toDateString()
          : "No deadline"}
      </Text>
      <Text>{item.title ?? "Untitled"}</Text>
    </View>
  );
}
