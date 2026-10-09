import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditableHeader({
  title,
  onTitleChange,
  deadline,
  onDeadlineChange,
  deadlineLow,
}: {
  title: string;
  onTitleChange: (text: string) => void;
  deadline: Date | null;
  onDeadlineChange: (date: Date) => void;
  deadlineLow: boolean;
}) {
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleChange = (_event: unknown, date: Date) => {
    setShowAndroidPicker(false);
    onDeadlineChange(date);
  };

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-body-bold text-ink-soft">Title</Text>
        <TextInput
          className="text-xl font-heading text-ink bg-paper border border-line rounded-2xl px-4 py-3"
          value={title}
          onChangeText={onTitleChange}
          placeholder="Untitled"
          placeholderTextColor="#A39DB0"
        />
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-body-bold text-ink-soft">Deadline</Text>
          {deadlineLow && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="help-circle-outline" size={14} color="#9A6400" />
              <Text className="text-xs font-body-bold text-soon-ink">
                Check this
              </Text>
            </View>
          )}
        </View>

        {deadline ? (
          <TouchableOpacity onPress={() => setShowAndroidPicker(true)}>
            <View
              className={`flex-row items-center rounded-2xl px-4 py-3 border ${
                deadlineLow
                  ? "bg-soon-soft border-dashed border-soon"
                  : "bg-paper border-line"
              }`}
            >
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  display="compact"
                  onValueChange={handleChange}
                />
              ) : (
                <>
                  <Text className="text-base font-body-medium text-ink">
                    {deadline.toDateString()}
                  </Text>
                  {showAndroidPicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="date"
                      onValueChange={handleChange}
                      onDismiss={() => setShowAndroidPicker(false)}
                    />
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-paper border border-dashed border-line rounded-2xl px-4 py-4 items-center"
            onPress={() => onDeadlineChange(new Date())}
          >
            <Text className="text-sm font-body-bold text-brand-ink">
              + Add deadline
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
