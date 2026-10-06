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
  const { pending, upcoming, hero, groups, refreshing, refresh } =
    useHomeData();

  return (
    <View className="flex-1 bg-cream">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 128,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#FF8A4C"
            colors={["#FF8A4C"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader pendingCount={pending.length} />

        {hero && <NextUpCard entry={hero} />}

        <View className="mb-8">
          <SectionHeader
            title="To confirm"
            subtitle="Check what was read from your photos"
            count={pending.length}
          />
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
              <View key={g.title} className="px-5 mb-2">
                <Text
                  className={`text-sm font-body-bold mb-2 ${
                    g.title === "Overdue" ? "text-urgent-ink" : "text-ink-soft"
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
    </View>
  );
}
