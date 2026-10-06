import { Ionicons } from "@expo/vector-icons";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type Category = {
  label: string;
  icon: IconName;
  bg: string;
  fg: string;
};

export const CATEGORIES: Category[] = [
  { label: "Bill", icon: "document-text-outline", bg: "#F8E1F0", fg: "#9C3A74" },
  { label: "Receipt", icon: "receipt-outline", bg: "#DDF5EC", fg: "#1F8A6B" },
  { label: "School", icon: "school-outline", bg: "#E6E0FA", fg: "#5B49B0" },
  { label: "Work", icon: "briefcase-outline", bg: "#D9ECFA", fg: "#1F6FA8" },
  { label: "Promo", icon: "pricetag-outline", bg: "#FFF3C4", fg: "#8A6A00" },
  {
    label: "Other",
    icon: "ellipsis-horizontal-circle-outline",
    bg: "#EFEAE0",
    fg: "#6B647A",
  },
];

const normalize = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

export const getCategory = (value: string | null | undefined): Category =>
  CATEGORIES.find((c) => c.label.toLowerCase() === normalize(value)) ??
  CATEGORIES[CATEGORIES.length - 1];