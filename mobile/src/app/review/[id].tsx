import { Stack, useLocalSearchParams } from "expo-router";
import { Image, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getItemById, getItemFields } from "../../db/items";
import { ItemField } from "../../types/item";

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id),
    enabled: !!id,
  });

  const { data: fields, isLoading: fieldsLoading } = useQuery<ItemField[]>({
    queryKey: ["itemFields", id],
    queryFn: () => getItemFields(id),
    enabled: !!id,
  });

  if (itemLoading || fieldsLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-400 font-medium">Loading...</Text>
        </View>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: "Not Found" }} />
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-gray-500 font-medium">Item not found.</Text>
        </View>
      </>
    );
  }

  const formatKey = (key: string) => {
    return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <Stack.Screen options={{ title: "Review" }} />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="p-5 pb-12 gap-6"
      >
        {item.local_image_uri && (
          <View className="bg-gray-50 border rounded-md border-gray-200 overflow-hidden items-center justify-center p-2">
            <Image
              className="w-full h-[450px]"
              source={{ uri: item.local_image_uri }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Deadline
            </Text>
            <Text className="text-xs text-gray-400 font-medium">
              {item.deadline_at
                ? new Date(item.deadline_at).toDateString()
                : "No deadline"}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            {item.title ?? "Untitled"}
          </Text>
        </View>

        {fields && fields.length > 0 && (
          <View className="bg-gray-50 rounded-md p-4 border border-gray-200 gap-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Details
            </Text>
            <View className="gap-3">
              {fields.map((field) => (
                <View key={field.id} className="flex-col gap-0.5">
                  <Text className="text-xs font-medium text-gray-400">
                    {formatKey(field.key)}
                  </Text>
                  <Text className="text-base text-gray-800 font-medium">
                    {field.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          className="w-full bg-indigo-600 py-4 rounded-xl items-center justify-center mt-2 shadow-sm"
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <Text className="text-white font-semibold text-base">Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
