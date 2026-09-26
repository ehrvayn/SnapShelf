export type ItemStatus =
  | "uploaded"
  | "processing"
  | "pending_review"
  | "confirmed"
  | "stored"
  | "done"
  | "needs_manual";

export type SyncStatus = "pending" | "synced";

export interface Item {
  id: string;
  local_image_uri: string;
  category: string | null;
  title: string | null;
  status: ItemStatus;
  deadline_at: string | null;
  deadline_confirmed_at: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}