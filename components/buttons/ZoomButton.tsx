import React, { useRef } from "react";
import { TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  onPress: () => void;
};

const ZoomButton: React.FC<Props> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      bounciness: 8,
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
        bounciness: 8,
      }),
    ]).start();

    onPress(); // call parent zoom function
  };

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={16}
        activeOpacity={0.7}
        style={styles.button}
      >
        <AntDesign name="aim" size={38} color="rgba(255, 255, 255, 0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const BUTTON_SIZE = 70;

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.87,
    left: SCREEN_WIDTH * 0.73,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    flex: 1,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "rgba(238, 0, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(238, 0, 255, 0.5)",
  },
});

export default ZoomButton;
