import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { getItemsByStatus, getUpcomingItems } from "../db/items";
import { Item } from "../types/item";

export const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const daysUntil = (iso: string) =>
  Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 86400000);

export type DeadlineEntry = { item: Item; days: number };

export function useHomeData() {
  const [pending, setPending] = useState<Item[]>([]);
  const [upcoming, setUpcoming] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, u] = await Promise.all([
      getItemsByStatus("pending_review"),
      getUpcomingItems(),
    ]);
    setPending(p.filter((i) => !i.deadline_at || new Date(i.deadline_at) >= new Date()));
    setUpcoming(u.filter((i) => i.deadline_at));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const derived = useMemo(() => {
    const entries: DeadlineEntry[] = upcoming.map((item) => ({
      item,
      days: daysUntil(item.deadline_at!),
    }));
    const hero = entries.find((e) => e.days >= 0) ?? null;
    const rest = entries.filter((e) => e !== hero);
    return {
      hero,
      overdueCount: entries.filter((e) => e.days < 0).length,
      weekCount: entries.filter((e) => e.days >= 0 && e.days <= 7).length,
      groups: [
        { title: "This week", items: rest.filter((e) => e.days >= 0 && e.days <= 7) },
        { title: "Later", items: rest.filter((e) => e.days > 7) },
        { title: "Overdue", items: rest.filter((e) => e.days < 0) },
      ].filter((g) => g.items.length > 0),
    };
  }, [upcoming]);

  return { pending, upcoming, refreshing, refresh, ...derived };
}