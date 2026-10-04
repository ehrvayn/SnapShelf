import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  deleting: boolean;
  count?: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteItemModal({
  visible,
  deleting,
  count = 1,
  onCancel,
  onConfirm,
}: Props) {
  const plural = count > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={deleting ? undefined : onCancel}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-8">
        <View className="w-full bg-white rounded-3xl p-6 items-center gap-4">
          <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center">
            <Ionicons name="trash-outline" size={26} color="#dc2626" />
          </View>

          <View className="items-center gap-1.5">
            <Text className="text-xl font-bold text-gray-900">
              {plural ? `Delete ${count} items?` : "Delete item?"}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              {plural
                ? "These items and their details will be permanently removed. This can't be undone."
                : "This will permanently remove it and its details. This can't be undone."}
            </Text>
          </View>

          <View className="w-full flex-row gap-3 mt-2">
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={deleting}
              onPress={onCancel}
              className="flex-1 py-3.5 rounded-xl bg-gray-100 items-center"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={deleting}
              onPress={onConfirm}
              className="flex-1 py-3.5 rounded-xl bg-red-600 items-center justify-center"
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Delete
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
