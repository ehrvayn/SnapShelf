import { Stack } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DeadlineRow,
  EmptyCard,
  HomeHeader,
  LibraryCard,
  NextUpCard,
  ReviewCard,
  SectionHeader,
} from "../components/HomeParts";
import { useHomeData } from "../hooks/useHomeData";

export default function Home() {
  const insets = useSafeAreaInsets();
  const {
    pending,
    upcoming,
    hero,
    groups,
    overdueCount,
    weekCount,
    refreshing,
    refresh,
  } = useHomeData();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 48,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader pendingCount={pending.length} />

        {hero && <NextUpCard entry={hero} />}

        <View className="mb-8">
          <SectionHeader title="To confirm" count={pending.length} />
          {pending.length === 0 ? (
            <EmptyCard
              icon="checkmark-circle-outline"
              text="Nothing to review. Snap something new!"
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {pending.map((item) => (
                <ReviewCard key={item.id} item={item} />
              ))}
            </ScrollView>
          )}
        </View>

        <View className="mb-4">
          <SectionHeader title="Upcoming" count={upcoming.length} />
          {groups.length === 0 && !hero ? (
            <EmptyCard
              icon="calendar-clear-outline"
              text="No upcoming deadlines yet."
            />
          ) : (
            groups.map((g) => (
              <View key={g.title} className="px-5 mb-3">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    g.title === "Overdue" ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {g.title}
                </Text>
                {g.items.map((e) => (
                  <DeadlineRow key={e.item.id} item={e.item} />
                ))}
              </View>
            ))
          )}
        </View>

        <LibraryCard />
      </ScrollView>
    </>
  );
}
