// components/BackButton.tsx
import React, { useRef } from "react";
import {
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BUTTON_SIZE = SCREEN_WIDTH * 0.2;
const TOP_OFFSET = SCREEN_HEIGHT * 0.05;
const LEFT_OFFSET = SCREEN_WIDTH * -0.02;

export default function BackButton() {
  const router = useRouter();

  const translateX = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const triggerBackAnimation = () => {
    Animated.timing(translateX, {
      toValue: -SCREEN_WIDTH * 0.5,
      easing: Easing.linear,
      duration: 120, // fast but readable
      useNativeDriver: true,
    }).start(() => router.back());
  };

  return (
    <Pressable
      hitSlop={16}
      onPressIn={() => {
        Animated.spring(pressScale, {
          toValue: 0.8,
          useNativeDriver: true,
          speed: 40,
          bounciness: 0,
        }).start();
      }}
      onPressOut={() => {
        // Smooth scale reset
        Animated.spring(pressScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 15,
        }).start();
      }}
      onPress={() => {
        // Only fires if user releases inside the button
        triggerBackAnimation();
      }}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.5 : 1 },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ translateX }, { scale: pressScale }],
        }}
      >
        <MaterialIcons
          name="keyboard-double-arrow-left"
          size={BUTTON_SIZE * 0.8}
          color="#FF1493"
        />
      </Animated.View>
    </Pressable>
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
