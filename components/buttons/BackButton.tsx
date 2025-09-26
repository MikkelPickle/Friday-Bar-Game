// components/BackButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BUTTON_SIZE = SCREEN_WIDTH * 0.18;
const TOP_OFFSET = SCREEN_HEIGHT * 0.03;
const LEFT_OFFSET = SCREEN_WIDTH * -0.02;

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.back()}
      activeOpacity={0.8}
    >
      <MaterialIcons
        name="keyboard-double-arrow-left"
        size={BUTTON_SIZE * 0.7}
        color="#FF1493"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: TOP_OFFSET,
    left: LEFT_OFFSET,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});
