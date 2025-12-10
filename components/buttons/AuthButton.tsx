import React, { useState } from "react";
import { Text, View, StyleSheet, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import EmailSignIn from "../auth/EmailSignIn";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DURATION = 180;
const SHADOW_HEIGHT = 12;

const AuthButton = () => {
  const transition = useSharedValue(0);
  const isActive = useSharedValue(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    top: interpolate(transition.value, [0, 1], [0, SHADOW_HEIGHT]),
  }));


  const handleAuth = () => {
    setShowPrompt(true); // show glassmorphic popup
  };

  return (
    <><Pressable
      onPress={handleAuth}
      hitSlop={16}
      onPressIn={() => {
        isActive.value = true;
        transition.value = withTiming(1, { duration: DURATION }, () => {
          if (!isActive.value) {
            transition.value = withTiming(0, { duration: DURATION });
          }
        });
      } }
      onPressOut={() => {
        transition.value = withTiming(0, { duration: DURATION });
        isActive.value = false;
      } }
    >
      <View>
        {/* Shadow layer */}
        <View style={styles.shadow} />

        {/* Button layer */}
        <Animated.View style={[styles.button, animatedStyle]}>
          <Text style={styles.text}>Sign In</Text>
        </Animated.View>
      </View>
    </Pressable><EmailSignIn
        visible={showPrompt}
        onClose={() => setShowPrompt(false)} /></>
  );
};

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: "#9b0c58ff",
    height: 60,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 35,
    position: "absolute",
    top: SHADOW_HEIGHT,
  },
  button: {
    backgroundColor: "#FF1493",
    height: 60,
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#E3C134",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AuthButton;
