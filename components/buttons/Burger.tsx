import React, { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, StyleSheet, View, Dimensions, ViewStyle } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BUTTON_SIZE = SCREEN_WIDTH * 0.12;
const BUTTON_SPACING = SCREEN_WIDTH * 0.02;
const TOP_OFFSET = SCREEN_HEIGHT * 0.1;
const LEFT_OFFSET = SCREEN_WIDTH * 0.05;
const LINE_HEIGHT = BUTTON_SIZE * 0.12;
const LINE_WIDTH = BUTTON_SIZE * 0.8;

const Burger = ({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) => {
  const animation = useRef(new Animated.Value(open ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);

  // ✅ Top line
  const topLineStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, BUTTON_SPACING * 2] }) } as any,
      { rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] }) } as any,
    ],
  };

  // ✅ Middle line
  const middleLineStyle: Animated.WithAnimatedObject<ViewStyle> = {
    opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) as any,
  };

  // ✅ Bottom line
  const bottomLineStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [
      { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -BUTTON_SPACING * 2] }) } as any,
      { rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-45deg"] }) } as any,
    ],
  };

   const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.75,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }).start();
    };
  
    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 20,
      }).start();
    };

  const handlePress = () => {
      // Optional pulse animation
      Animated.stagger(50, [
        Animated.spring(scaleAnim, {
          toValue: 0.7,
          useNativeDriver: true,
          speed: 20,
          bounciness: 0,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 20,
        }),
      ]).start();
  
      setOpen(!open); // call parent zoom function
    };

  return (
    <Animated.View
      style={[
        styles.burger,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        hitSlop={16}
        onPress={handlePress}
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut}
        activeOpacity={0.6}
        style={{ width: "100%", height: "100%", justifyContent: "space-around", alignItems: "center" }}
      >
        <Animated.View style={[styles.line, topLineStyle]} />
        <Animated.View style={[styles.line, middleLineStyle]} />
        <Animated.View style={[styles.line, bottomLineStyle]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  burger: {
    position: "absolute",
    top: TOP_OFFSET,
    left: LEFT_OFFSET,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 20,
  },
  line: {
    width: LINE_WIDTH,
    height: LINE_HEIGHT,
    backgroundColor: "#DA3485",
    borderRadius: 2,
  },
});

export default Burger;
