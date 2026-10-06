import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DeleteItemModal from "../../components/modal/DeleteItemModal";
import { getCategory } from "../../constants/categories";
import { getTone } from "../../constants/tones";
import {
  confirmItem,
  deleteItem,
  getItemById,
  getItemFields,
  updateItem,
  updateItemField,
  updateItemStatus,
} from "../../db/items";
import { daysUntil } from "../../hooks/useHomeData";
import { syncReminders } from "../../services/notifications";
import { ItemField } from "../../types/item";

// Fields the AI is less sure about get a gentle visual cue, not a number.
const LOW_CONFIDENCE = 0.7;

const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Review() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
        <View className="flex-1 items-center justify-center bg-cream">
          <Text className="text-ink-faint font-body-medium">Loading...</Text>
        </View>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Stack.Screen options={{ title: "Not found" }} />
        <View className="flex-1 items-center justify-center bg-cream">
          <Text className="text-ink-soft font-body-medium">
            Item not found.
          </Text>
        </View>
      </>
    );
  }

  const isOverdue = item.deadline_at
    ? new Date(item.deadline_at) < new Date(Date.now())
    : false;

  const needsReview = item.status === "pending_review" && !isOverdue;
  const fieldsEditable = needsReview || isEditing;

  const tone = item.deadline_at ? getTone(daysUntil(item.deadline_at)) : null;
  const cat = getCategory(item.category);

  // A field is "low" until the person changes its value.
  const isLow = (f: ItemField) =>
    f.confidence !== null &&
    f.confidence < LOW_CONFIDENCE &&
    (editedValues[f.id] ?? "") === (f.value ?? "");

  const lowCount = fields ? fields.filter(isLow).length : 0;

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

      if (editedDeadline) {
        await confirmItem(id);
      } else if (item.status === "pending_review") {
        await updateItemStatus(id, "stored");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["item", id] }),
        queryClient.invalidateQueries({ queryKey: ["itemFields", id] }),
      ]);
      await syncReminders();
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteItem(id);
      await syncReminders();
      setShowDelete(false);
      router.back();
      queryClient.removeQueries({ queryKey: ["item", id] });
      queryClient.removeQueries({ queryKey: ["itemFields", id] });
    } catch {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: needsReview ? "Review" : "Details",
          headerStyle: { backgroundColor: "#FFF8EC" },
          headerShadowVisible: false,
          headerTintColor: "#2B2438",
          headerTitleStyle: { fontFamily: "Nunito_800ExtraBold" },
          headerRight: () => (
            <View className="flex-row items-center gap-5">
              {!needsReview && (
                <TouchableOpacity
                  disabled={isSaving}
                  onPress={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                >
                  <Text className="text-brand-ink font-body-bold text-base">
                    {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isSaving}
                onPress={() => setShowDelete(true)}
                hitSlop={10}
              >
                <Ionicons name="trash-outline" size={22} color="#C73E37" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-cream"
        contentContainerClassName="p-5 pb-12 gap-5"
      >
        {/* Photo */}
        {item.local_image_uri && (
          <View className="bg-paper border border-line rounded-3xl overflow-hidden p-2">
            <Image
              className="w-full h-[400px] rounded-2xl"
              source={{ uri: item.local_image_uri }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Title and deadline */}
        {fieldsEditable ? (
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-body-bold text-ink-soft">
                Title
              </Text>
              <TextInput
                className="text-xl font-heading text-ink bg-paper border border-line rounded-2xl px-4 py-3"
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Untitled"
                placeholderTextColor="#A39DB0"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-body-bold text-ink-soft">
                Deadline
              </Text>
              {editedDeadline ? (
                <View className="flex-row items-center bg-paper border border-line rounded-2xl px-4 py-3">
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
                        <Text className="text-base font-body-medium text-ink">
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
                  className="bg-paper border border-dashed border-line rounded-2xl px-4 py-4 items-center"
                  onPress={() => setEditedDeadline(new Date())}
                >
                  <Text className="text-sm font-body-bold text-brand-ink">
                    + Add deadline
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row items-center gap-2 flex-wrap">
              <View
                className="flex-row items-center gap-1 rounded-full px-3 py-1"
                style={{ backgroundColor: cat.bg }}
              >
                <Ionicons name={cat.icon} size={13} color={cat.fg} />
                <Text
                  className="text-xs font-body-bold"
                  style={{ color: cat.fg }}
                >
                  {cat.label}
                </Text>
              </View>
              {tone && (
                <View className={`${tone.box} rounded-full px-3 py-1`}>
                  <Text className={`text-xs font-body-bold ${tone.text}`}>
                    {tone.label}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-3xl font-display text-ink">
              {item.title ?? "Untitled"}
            </Text>
            {item.deadline_at && (
              <Text className="text-sm font-body-medium text-ink-soft">
                {new Date(item.deadline_at).toDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Low-confidence summary */}
        {lowCount > 0 && (
          <View className="flex-row items-center gap-3 bg-soon-soft rounded-2xl p-4">
            <Ionicons name="help-circle" size={24} color="#9A6400" />
            <View className="flex-1">
              <Text className="text-sm font-body-bold text-soon-ink">
                {lowCount} {lowCount === 1 ? "detail needs" : "details need"} a
                quick check
              </Text>
              <Text className="text-xs font-body text-soon-ink">
                Tap a highlighted field to fix it.
              </Text>
            </View>
          </View>
        )}

        {/* Extracted fields */}
        {fields && fields.length > 0 && (
          <View className="bg-paper rounded-3xl p-5 border border-line gap-4">
            <Text className="text-lg font-heading text-ink">Details</Text>
            <View className="gap-4">
              {fields.map((field) => {
                const low = isLow(field);
                return (
                  <View key={field.id} className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-body-bold text-ink-soft">
                        {formatKey(field.key)}
                      </Text>
                      {low && (
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name="help-circle-outline"
                            size={14}
                            color="#9A6400"
                          />
                          <Text className="text-xs font-body-bold text-soon-ink">
                            Check this
                          </Text>
                        </View>
                      )}
                    </View>

                    {fieldsEditable ? (
                      <TextInput
                        className={`text-base font-body-medium text-ink rounded-2xl px-4 py-3 border ${
                          low
                            ? "bg-soon-soft border-dashed border-soon"
                            : "bg-cream border-line"
                        }`}
                        value={editedValues[field.id] ?? ""}
                        onChangeText={(text) =>
                          setEditedValues((prev) => ({
                            ...prev,
                            [field.id]: text,
                          }))
                        }
                      />
                    ) : (
                      <Text
                        className={`text-base font-body-medium text-ink rounded-2xl px-4 py-3 ${
                          low
                            ? "bg-soon-soft border border-dashed border-soon"
                            : ""
                        }`}
                      >
                        {field.value}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {needsReview && (
          <TouchableOpacity
            className="w-full bg-brand py-4 rounded-full items-center justify-center mt-1"
            activeOpacity={0.85}
            disabled={isSaving}
            onPress={handleSave}
          >
            <Text className="text-white font-heading text-base">
              {isSaving ? "Saving..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <DeleteItemModal
        visible={showDelete}
        deleting={isDeleting}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
