import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { softShadow } from "../constants/tones";

const VISIBLE_ON = ["/home", "/library"];

export default function FloatingNav() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!VISIBLE_ON.includes(pathname)) return null;

  const libraryActive = pathname === "/library";
  const homeActive = pathname === "/home";

  return (
    <View
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + 12, height: 88 }}
      className="absolute left-5 right-5"
    >
      <View
        className="absolute bottom-0 left-12 right-12 h-16 bg-paper rounded-full border border-line"
        style={softShadow}
      />

      <View
        pointerEvents="box-none"
        className="absolute inset-0 left-12 right-12 flex-row items-end justify-between px-5"
      >
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => !homeActive && router.navigate("/home")}
          className={`w-16 h-12 mb-2 rounded-full items-center justify-center ${
            homeActive ? "bg-brand-soft" : ""
          }`}
        >
          <Ionicons
            name={homeActive ? "home" : "home-outline"}
            size={26}
            color={homeActive ? "#C2531A" : "#A39DB0"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.navigate("/")}
          className="w-[72px] h-[72px] mb-3 rounded-full bg-brand items-center justify-center border-4 border-cream"
          style={softShadow}
        >
          <Ionicons name="camera" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => !libraryActive && router.navigate("/library")}
          className={`w-16 h-12 mb-2 rounded-full items-center justify-center ${
            libraryActive ? "bg-brand-soft" : ""
          }`}
        >
          <Ionicons
            name={libraryActive ? "albums" : "albums-outline"}
            size={26}
            color={libraryActive ? "#C2531A" : "#A39DB0"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
