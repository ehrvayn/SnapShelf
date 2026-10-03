const API_URL = "http://192.168.1.8:3000";

import { File } from "expo-file-system";

export async function uploadPhoto(uri: string): Promise<any> {
  const file = new File(uri);

  const formData = new FormData();
  formData.append("photo", file, "photo.jpg");

  const response = await fetch(`${API_URL}/items/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return response.json();
}