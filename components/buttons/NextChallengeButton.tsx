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
const SHADOW_HEIGHT = 10;

interface NextChallengeButtonProps {
  onPress: () => Promise<void>;
  isLast?: boolean;
}

export default function NextChallengeButton({ onPress, isLast }: NextChallengeButtonProps) {
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";
  const [loading, setLoading] = useState(false);

  const transition = useSharedValue(0);
  const isActive = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    top: interpolate(transition.value, [0, 1], [0, SHADOW_HEIGHT]),
  }));

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onPress();
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isLast
    ? isDanish ? "AFSLUT SPIL" : "FINISH GAME"
    : isDanish ? "NAESTE" : "NEXT";

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={16}
      disabled={loading}
      onPressIn={() => {
        if (loading) return;
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
      <View>
        <View style={[styles.shadow, isLast && styles.finishShadow]} />
        <Animated.View style={[styles.button, isLast && styles.finishButton, animatedStyle]}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.text}>{buttonText}</Text>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: "#9b0c58ff",
    height: 60,
    width: SCREEN_WIDTH * 0.6,
    borderRadius: 30,
    position: "absolute",
    top: SHADOW_HEIGHT,
  },
  finishShadow: {
    backgroundColor: "#0a6b2eff",
  },
  button: {
    backgroundColor: "#FF1493",
    height: 60,
    width: SCREEN_WIDTH * 0.6,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  finishButton: {
    backgroundColor: "#10B44C",
  },
  text: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
