import { Stack } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DeadlineGroup,
  MascotHeader,
  NextUpCard,
  ReviewCard,
  SectionHeader,
} from "../components/home/HomeParts";
import { DeadlineEntry, useHomeData } from "../hooks/useHomeData";

function getMessage(s: {
  hero: DeadlineEntry | null;
  overdueCount: number;
  weekCount: number;
  pendingCount: number;
}) {
  if (s.overdueCount > 0)
    return `${s.overdueCount} overdue. Let's start there.`;
  if (s.hero && s.hero.days <= 1)
    return s.hero.days === 0
      ? "Something is due today."
      : "Something is due tomorrow.";
  if (s.pendingCount > 0)
    return `${s.pendingCount} ${s.pendingCount === 1 ? "date needs" : "dates need"} a quick check.`;
  if (s.weekCount > 0) return `${s.weekCount} due this week. You're on track.`;
  if (s.hero) return `Nothing urgent. Next deadline is in ${s.hero.days} days.`;
  return "Nothing to remember yet. Snap something!";
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const {
    pending,
    hero,
    groups,
    overdueCount,
    weekCount,
    refreshing,
    refresh,
  } = useHomeData();

  const isEmpty = !hero && pending.length === 0 && groups.length === 0;

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
        <MascotHeader
          message={getMessage({
            hero,
            overdueCount,
            weekCount,
            pendingCount: pending.length,
          })}
        />

        {hero && <NextUpCard entry={hero} />}

        {pending.length > 0 && (
          <View className="mb-8">
            <SectionHeader
              title="To confirm"
              subtitle="Check the uncertainties from these photos"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {pending.map((item) => (
                <ReviewCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

        {groups.length > 0 && (
          <View>
            <SectionHeader title="Upcoming" />
            {groups.map((g) => (
              <DeadlineGroup key={g.title} title={g.title} items={g.items} />
            ))}
          </View>
        )}

        {isEmpty && (
          <Text className="text-sm font-body-medium text-ink-faint text-center px-10 mt-6">
            Deadlines from your photos will show up here.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
