import { randomUUID } from "expo-crypto";
import { getDb } from "./index";
import { Item, ItemStatus, ExtractedData, ItemField } from "../types/item";

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

export async function getItemFields(itemId: string): Promise<ItemField[]> {
  if (!itemId) return [];
  const db = await getDb();
  return db.getAllAsync<ItemField>(
    "SELECT * FROM item_fields WHERE item_id = ?",
    [itemId],
  );
}

export async function getUpcomingItems(): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>(
    `SELECT * FROM items
     WHERE status = 'confirmed' AND deadline_confirmed_at IS NOT NULL
     ORDER BY deadline_at ASC`,
  );
}

export async function getItemById(id: string): Promise<Item | null> {
  if (!id) return null;
  const db = await getDb();
  return db.getFirstAsync<Item>("SELECT * FROM items WHERE id = ?", [id]);
}

export async function saveExtractedData(
  itemId: string,
  extracted: ExtractedData,
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const status = extracted.deadline ? "pending_review" : "stored";

  await db.runAsync(
    `UPDATE items
     SET category = ?, title = ?, deadline_at = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [
      extracted.category,
      extracted.title,
      extracted.deadline,
      status,
      now,
      itemId,
    ],
  );

  for (const [key, field] of Object.entries(extracted.fields)) {
    await db.runAsync(
      `INSERT INTO item_fields (item_id, key, value, confidence, user_edited)
       VALUES (?, ?, ?, ?, 0)`,
      [itemId, key, field.value, field.confidence],
    );
  }
}
