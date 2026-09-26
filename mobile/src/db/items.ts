import { randomUUID } from "expo-crypto";
import { getDb } from "./index";
import { Item, ItemStatus } from "../types/item";

export async function insertItem(uri: string): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO items (id, local_image_uri, status, sync_status, created_at, updated_at)
     VALUES (?, ?, 'uploaded', 'pending', ?, ?)`,
    [id, uri, now, now],
  );

  return id;
}

export async function getItemsByStatus(status: ItemStatus): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>(
    "SELECT * FROM items WHERE status = ? ORDER BY created_at DESC",
    [status],
  );
}

export async function getAllItems(): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>("SELECT * FROM items ORDER BY created_at DESC");
}

export async function getUpcomingItems(): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>(
    `SELECT * FROM items
     WHERE status = 'confirmed' AND deadline_confirmed_at IS NOT NULL
     ORDER BY deadline_at ASC`
  );
}

export async function getItemById(id: string): Promise<Item | null> {
  const db = await getDb();
  return db.getFirstAsync<Item>("SELECT * FROM items WHERE id = ?", [id]);
}