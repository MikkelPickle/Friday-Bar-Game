import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Dimensions, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DURATION = 180;
const SHADOW_HEIGHT = 12;

interface StartGameButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
}

export default function StartGameButton({ onPress, disabled }: StartGameButtonProps) {
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";
  const [loading, setLoading] = useState(false);

  const transition = useSharedValue(0);
  const isActive = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    top: interpolate(transition.value, [0, 1], [0, SHADOW_HEIGHT]),
  }));

  const handlePress = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={16}
      disabled={disabled || loading}
      onPressIn={() => {
        if (disabled || loading) return;
        isActive.value = true;
        transition.value = withTiming(1, { duration: DURATION }, () => {
          if (!isActive.value) {
            transition.value = withTiming(0, { duration: DURATION });
          }
        });
      }}
      onPressOut={() => {
        transition.value = withTiming(0, { duration: DURATION });
        isActive.value = false;
      }}
    >
      <View style={disabled ? styles.disabledContainer : undefined}>
        <View style={styles.shadow} />
        <Animated.View style={[styles.button, animatedStyle]}>
          {loading ? (
            <ActivityIndicator size="small" color="#E3C134" />
          ) : (
            <Text style={styles.text}>
              {isDanish ? "START SPIL" : "START GAME"}
            </Text>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabledContainer: {
    opacity: 0.5,
  },
  shadow: {
    backgroundColor: "#0a6b2eff",
    height: 70,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 35,
    position: "absolute",
    top: SHADOW_HEIGHT,
  },
  button: {
    backgroundColor: "#10B44C",
    height: 70,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
