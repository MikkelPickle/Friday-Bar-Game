import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NewGameButton = ({ onPress }) => {
  const { t } = useTranslation(); // hook gives you the `t` function

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.text}>{t("newGame")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    // Extra shadow layer
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15, // Android shadow
    borderRadius: 35,
  },
  button: {
    backgroundColor: "#FF1493",
    paddingVertical: 20,
    paddingHorizontal: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",

    // inner shadow (for iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: SCREEN_WIDTH * 0.9,
  },
  text: {
    color: "#f0cd41ff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default NewGameButton;
