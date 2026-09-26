import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { getItemsByStatus, insertItem } from "../db/items";
import { savePhotoPermanently } from "../services/photos";
import { router } from "expo-router";
import { uploadPhoto } from "../services/upload";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ marginBottom: 12 }}>
          Camera access is needed to snap photos.
        </Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  const snap = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    if (photo) {
      const permanentUri = savePhotoPermanently(photo.uri);
      setLastPhoto(permanentUri);
      await insertItem(permanentUri);

      try {
        const result = await uploadPhoto(permanentUri);
        console.log("Upload result:", result);
      } catch (err) {
        console.log("Upload failed (offline?):", err);
      }

      const items = await getItemsByStatus("uploaded");
      console.log("Items in DB:", items);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/library")}
          style={{ position: "absolute", right: 50, bottom: 30 }}
        >
          <Text style={{ color: "white" }}>Library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={snap}
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "white",
            borderWidth: 4,
            borderColor: "#999",
          }}
        />

        <TouchableOpacity
          onPress={() => router.push("/home")}
          style={{ position: "absolute", left: 50, bottom: 30 }}
        >
          <Text style={{ color: "white" }}>Home</Text>
        </TouchableOpacity>

        {lastPhoto && (
          <Text style={{ color: "white", marginTop: 8 }}>Photo saved</Text>
        )}
      </View>
    </View>
  );
}
