import { Stack, useLocalSearchParams } from "expo-router";
import {
  Image,
  Platform,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getItemById,
  getItemFields,
  updateItem,
  updateItemField,
  updateItemStatus,
} from "../../db/items";
import { ItemField } from "../../types/item";

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDeadline, setEditedDeadline] = useState<Date | null>(null);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (fields) {
      const initial: Record<number, string> = {};
      fields.forEach((f) => {
        initial[f.id] = f.value ?? "";
      });
      setEditedValues(initial);
    }
  }, [fields]);

  useEffect(() => {
    if (item) {
      setEditedTitle(item.title ?? "");
      setEditedDeadline(item.deadline_at ? new Date(item.deadline_at) : null);
    }
  }, [item]);

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

  const formatConfidence = (confidence: number | null) => {
    if (confidence === null) return "—";
    return `${Math.round(confidence * 100)}%`;
  };

  const isOverdue = item.deadline_at
    ? new Date(item.deadline_at) < new Date(Date.now())
    : false;

  const needsReview = item.status === "pending_review" && !isOverdue;
  const fieldsEditable = needsReview || isEditing;

  const handleDateChange = (_event: unknown, date: Date) => {
    setShowAndroidPicker(false);
    setEditedDeadline(date);
  };

  const handleSave = async () => {
    if (!fields || isSaving) return;
    setIsSaving(true);
    try {
      await updateItem(id, {
        title: editedTitle.trim() || null,
        deadline: editedDeadline ? editedDeadline.toISOString() : null,
      });

      for (const field of fields) {
        const newValue = editedValues[field.id];
        if (newValue !== undefined && newValue !== (field.value ?? "")) {
          await updateItemField(field.id, newValue);
        }
      }

      if (item.status === "pending_review") {
        await updateItemStatus(id, "stored");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["item", id] }),
        queryClient.invalidateQueries({ queryKey: ["itemFields", id] }),
      ]);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: needsReview ? "Review" : "Details",
          headerRight: () =>
            !needsReview ? (
              <TouchableOpacity
                disabled={isSaving}
                onPress={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                <Text className="text-indigo-600 font-semibold text-base">
                  {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

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

        {fieldsEditable ? (
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Title
              </Text>
              <TextInput
                className="text-xl font-bold text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-2"
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Untitled"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Deadline
              </Text>
              {editedDeadline ? (
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                  {Platform.OS === "ios" ? (
                    <DateTimePicker
                      value={editedDeadline}
                      mode="date"
                      display="compact"
                      onValueChange={handleDateChange}
                    />
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => setShowAndroidPicker(true)}
                      >
                        <Text className="text-base text-gray-800 font-medium">
                          {editedDeadline.toDateString()}
                        </Text>
                      </TouchableOpacity>
                      {showAndroidPicker && (
                        <DateTimePicker
                          value={editedDeadline}
                          mode="date"
                          onValueChange={handleDateChange}
                          onDismiss={() => setShowAndroidPicker(false)}
                        />
                      )}
                    </>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-gray-50 border border-dashed border-gray-300 rounded-md px-3 py-3 items-center"
                  onPress={() => setEditedDeadline(new Date())}
                >
                  <Text className="text-sm text-indigo-600 font-medium">
                    + Add deadline
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="gap-2">
            {item.deadline_at && (
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isOverdue ? "text-red-600" : "text-indigo-600"
                  }`}
                >
                  {isOverdue ? "Overdue" : "Deadline"}
                </Text>
                <Text className="text-xs text-gray-400 font-medium">
                  {new Date(item.deadline_at).toDateString()}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-bold text-gray-900">
              {item.title ?? "Untitled"}
            </Text>
          </View>
        )}

        {fields && fields.length > 0 && (
          <View className="bg-gray-50 rounded-md p-4 border border-gray-200 gap-4">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Details
            </Text>
            <View className="gap-3">
              {fields.map((field) => (
                <View key={field.id} className="flex-col gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-gray-400">
                      {formatKey(field.key)}
                    </Text>
                    <Text className="text-xs font-medium text-gray-400">
                      {formatConfidence(field.confidence)} sure
                    </Text>
                  </View>

                  {fieldsEditable ? (
                    <TextInput
                      className="text-base text-gray-800 font-medium bg-white border border-gray-200 rounded-md px-3 py-2"
                      value={editedValues[field.id] ?? ""}
                      onChangeText={(text) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          [field.id]: text,
                        }))
                      }
                    />
                  ) : (
                    <Text className="text-base text-gray-800 font-medium px-3 py-2">
                      {field.value}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {needsReview && (
          <TouchableOpacity
            className="w-full bg-indigo-600 py-4 rounded-xl items-center justify-center mt-2 shadow-sm"
            activeOpacity={0.8}
            disabled={isSaving}
            onPress={handleSave}
          >
            <Text className="text-white font-semibold text-base">
              {isSaving ? "Saving..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}
