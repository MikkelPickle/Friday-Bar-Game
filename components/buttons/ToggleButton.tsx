// components/buttons/ToggleButton.tsx

import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Dimensions } from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BUTTON_SIZE = SCREEN_WIDTH * 0.2;
const TOP_OFFSET = SCREEN_HEIGHT * 0.075;
const RIGHT_OFFSET = SCREEN_WIDTH * 0.02;

type ToggleButtonProps = {
  activeMode: "global" | "study";
  onToggle: () => void;
};

export default function ToggleButton({ activeMode, onToggle }: ToggleButtonProps) {
  return (
    <Pressable onPress={onToggle} style={styles.button}>
      <Text style={styles.text}>
        {activeMode === "global" ? "All" : "Study"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: TOP_OFFSET,
    right: RIGHT_OFFSET,
    width: BUTTON_SIZE * 0.8,
    height: BUTTON_SIZE * 0.5,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(255,20,147,0.35)", //FF1493 with some transparency
    borderRadius: 8,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
