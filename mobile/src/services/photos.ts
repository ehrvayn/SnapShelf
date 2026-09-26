import { randomUUID } from "expo-crypto";
import { File, Paths } from "expo-file-system";

export function savePhotoPermanently(tempUri: string): string {
  const source = new File(tempUri);
  const destination = new File(Paths.document, `${randomUUID()}.jpg`);
  source.copy(destination);
  return destination.uri;
}
