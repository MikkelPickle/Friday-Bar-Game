import React from "react";
import { Text, View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DURATION = 180; // slightly snappier for your large button
const SHADOW_HEIGHT = 12;

const NewGameButton = ({ onPress }) => {
  const { t } = useTranslation();
  const transition = useSharedValue(0);
  const isActive = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    top: interpolate(transition.value, [0, 1], [0, SHADOW_HEIGHT]),
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      onPressIn={() => {
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
        {/* Shadow layer */}
        <View style={styles.shadow} />

        {/* Button layer */}
        <Animated.View style={[styles.button, animatedStyle]}>
          <Text style={styles.text}>{t("newGame")}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: "#9b0c58ff", // darker pink for shadow depth
    height: 70,
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 35,
    position: "absolute",
    top: SHADOW_HEIGHT,
  },
  button: {
    backgroundColor: "#FF1493",
    height: 70,
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#E3C134",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
export default NewGameButton;
