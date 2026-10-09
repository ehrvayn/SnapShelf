import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { ItemField } from "../../types/item";

export const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function FieldRow({
  field,
  value,
  editable,
  low,
  onChange,
}: {
  field: ItemField;
  value: string;
  editable: boolean;
  low: boolean;
  onChange: (text: string) => void;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-body-bold text-ink-soft">
          {formatKey(field.key)}
        </Text>
        {low && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="help-circle-outline" size={14} color="#9A6400" />
            <Text className="text-xs font-body-bold text-soon-ink">
              Check this
            </Text>
          </View>
        )}
      </View>

      {editable ? (
        <TextInput
          className={`text-base font-body-medium text-ink rounded-2xl px-4 py-3 border ${
            low
              ? "bg-soon-soft border-dashed border-soon"
              : "bg-cream border-line"
          }`}
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <Text
          className={`text-base font-body-medium text-ink rounded-2xl px-4 py-3 ${
            low ? "bg-soon-soft border border-dashed border-soon" : ""
          }`}
        >
          {field.value}
        </Text>
      )}
    </View>
  );
}
