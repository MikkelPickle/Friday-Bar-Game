import React from "react";
import { Text, View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useRouter } from "expo-router";

const router = useRouter();
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DURATION = 180;
const SHADOW_HEIGHT = 12;

const LeaveButton = () => {
  const transition = useSharedValue(0);
  const isActive = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    top: interpolate(transition.value, [0, 1], [0, SHADOW_HEIGHT]),
  }));

  const handleLeave = async () => {
      setTimeout(() => {
        router.back();
      }, 150); 
    };

  return (
    <Pressable
      onPress={handleLeave}
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
          <Text style={styles.text}>Leave lobby</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: "#9b0c58ff",
    height: 70,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 35,
    position: "absolute",
    top: SHADOW_HEIGHT,
  },
  button: {
    backgroundColor: "#FF1493",
    height: 70,
    width: SCREEN_WIDTH * 0.7,
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

export default LeaveButton;
