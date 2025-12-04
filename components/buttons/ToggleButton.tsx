import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BUTTON_SIZE = SCREEN_WIDTH * 0.2;
const TOP_OFFSET = SCREEN_HEIGHT * 0.075;
const RIGHT_OFFSET = SCREEN_WIDTH * 0.02;

type ToggleButtonProps = {
  activeMode: "global" | "study";
  onToggle: () => void;
};

export default function ToggleButton({ activeMode, onToggle }: ToggleButtonProps) {
  const [mode, setMode] = useState(activeMode);
  const [color, setColor] = useState("rgba(255, 20, 243, 0.35)");

  const buttonScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Fade text out
    Animated.timing(textOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Switch text after fade out
      setMode((prev) => (prev === "global" ? "study" : "global"));

      // Fade text back in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    // Toggle background color
    setColor((prev) =>
      prev === "rgba(255, 20, 243, 0.35)"
        ? "rgba(33, 96, 245, 0.6)"
        : "rgba(255, 20, 243, 0.35)"
    );

    onToggle();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 25,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.button, { backgroundColor: color }]}
        >
          <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
            {mode === "global" ? "All" : "Study"}
          </Animated.Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: TOP_OFFSET,
    right: RIGHT_OFFSET,
  },
    button: {
  width: BUTTON_SIZE * 0.9,
  height: BUTTON_SIZE * 0.6,
  borderRadius: 12,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",

  // Stronger border
  borderWidth: 2,
  borderColor: "rgba(69, 213, 238, 0.45)",

  // Outer shadow
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 12,
  elevation: 6,
},
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
});
