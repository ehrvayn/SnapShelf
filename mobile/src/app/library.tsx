import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DeleteItemModal from "../components/modal/DeleteItemModal";
import { CATEGORIES, getCategory } from "../constants/categories";
import { getTone } from "../constants/tones";
import { deleteItems, getAllItems } from "../db/items";
import { daysUntil } from "../hooks/useHomeData";
import { syncReminders } from "../services/notifications";
import { Item } from "../types/item";

export default function Library() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState("All");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(() => getAllItems().then(setItems), []);

  const exitSelection = useCallback(() => {
    setSelecting(false);
    setPicked(new Set());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (selecting) {
          exitSelection();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [load, selecting, exitSelection]),
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: items.length };
    CATEGORIES.forEach((c) => (result[c.label] = 0));
    items.forEach((i) => {
      result[getCategory(i.category).label] += 1;
    });
    return result;
  }, [items]);

  const filtered = useMemo(
    () =>
      selected === "All"
        ? items
        : items.filter((i) => getCategory(i.category).label === selected),
    [items, selected],
  );

  const allPicked =
    filtered.length > 0 && filtered.every((i) => picked.has(i.id));

  const togglePick = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () =>
    setPicked(allPicked ? new Set() : new Set(filtered.map((i) => i.id)));

  const handlePress = (item: Item) => {
    if (selecting) togglePick(item.id);
    else router.push({ pathname: "/item/[id]", params: { id: item.id } });
  };

  const handleLongPress = (item: Item) => {
    if (!selecting) {
      setSelecting(true);
      setPicked(new Set([item.id]));
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(picked);
      await deleteItems(ids);
      await syncReminders();
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: ["item", id] });
        queryClient.removeQueries({ queryKey: ["itemFields", id] });
      });
      await load();
      exitSelection();
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 bg-cream">
        <View className="px-5" style={{ paddingTop: insets.top + 16 }}>
          <View className="h-14 flex-row items-center justify-between">
            {selecting ? (
              <>
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={exitSelection}
                    className="w-10 h-10 rounded-full bg-paper border border-line items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="#2B2438" />
                  </TouchableOpacity>
                  <Text className="text-xl font-heading text-ink">
                    {picked.size} selected
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={toggleAll}
                    className="h-10 px-4 rounded-full bg-paper border border-line items-center justify-center"
                  >
                    <Text className="text-sm font-body-bold text-brand-ink">
                      {allPicked ? "Clear" : "Select all"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={picked.size === 0}
                    onPress={() => setShowDelete(true)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      picked.size === 0 ? "bg-urgent-soft" : "bg-urgent"
                    }`}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text className="text-3xl font-display text-ink">
                    Library
                  </Text>
                  <Text className="text-xs font-body-medium text-ink-faint">
                    {items.length} {items.length === 1 ? "item" : "items"}{" "}
                    stored
                  </Text>
                </View>

                {items.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelecting(true)}
                    className="h-10 px-4 flex-row items-center gap-1.5 rounded-full bg-paper border border-line"
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#C2531A"
                    />
                    <Text className="text-sm font-body-bold text-brand-ink">
                      Select
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerClassName="px-5 pt-3 pb-4 gap-2"
        >
          {["All", ...CATEGORIES.map((c) => c.label)].map((cat) => {
            const active = selected === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelected(cat)}
                className={`flex-row items-center gap-2 px-4 h-10 rounded-full border ${
                  active ? "bg-brand border-brand" : "bg-paper border-line"
                }`}
              >
                <Text
                  className={`text-sm font-body-bold ${
                    active ? "text-white" : "text-ink"
                  }`}
                >
                  {cat}
                </Text>
                <Text
                  className={`text-xs font-body-bold ${
                    active ? "text-white/80" : "text-ink-faint"
                  }`}
                >
                  {counts[cat]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          extraData={[selecting, picked]}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-40"
          ListEmptyComponent={
            <View className="p-8 bg-paper rounded-3xl border border-dashed border-line items-center gap-2">
              <Ionicons name="albums-outline" size={28} color="#A39DB0" />
              <Text className="text-sm font-body-medium text-ink-faint text-center">
                {items.length === 0
                  ? "No items yet. Snap something!"
                  : `No ${selected.toLowerCase()} items.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPicked = picked.has(item.id);
            const cat = getCategory(item.category);
            const tone = item.deadline_at
              ? getTone(daysUntil(item.deadline_at))
              : null;

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={300}
                className={`flex-row items-center rounded-3xl p-3 mb-3 gap-3 border ${
                  isPicked
                    ? "bg-brand-soft border-brand"
                    : "bg-paper border-line"
                }`}
              >
                {selecting && (
                  <Ionicons
                    name={isPicked ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={isPicked ? "#FF8A4C" : "#D9D0C0"}
                  />
                )}
                <Image
                  source={{ uri: item.local_image_uri }}
                  className="w-[72px] h-[72px] rounded-2xl bg-cream"
                  resizeMode="cover"
                />
                <View className="flex-1 gap-1.5">
                  <Text
                    className="text-base font-heading text-ink"
                    numberOfLines={2}
                  >
                    {item.title ?? "Untitled"}
                  </Text>
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <View
                      className="flex-row items-center gap-1 rounded-full px-2.5 py-0.5"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <Ionicons name={cat.icon} size={11} color={cat.fg} />
                      <Text
                        className="text-xs font-body-bold"
                        style={{ color: cat.fg }}
                      >
                        {cat.label}
                      </Text>
                    </View>
                    {tone ? (
                      <View
                        className={`${tone.box} rounded-full px-2.5 py-0.5`}
                      >
                        <Text className={`text-xs font-body-bold ${tone.text}`}>
                          {tone.label}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-xs font-body-medium text-ink-faint">
                        {new Date(item.created_at).toDateString()}
                      </Text>
                    )}
                  </View>
                </View>
                {!selecting && (
                  <Ionicons name="chevron-forward" size={18} color="#D9D0C0" />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <DeleteItemModal
        visible={showDelete}
        deleting={isDeleting}
        count={picked.size}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
