import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

const JoinGameButton = ({ onPress }) => {
  const { t } = useTranslation(); // hook gives you the `t` function

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.9}>
        <Text style={styles.text}>{t("joinGame")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
    borderRadius: 35,
  },
  button: {
    backgroundColor: "#FF1493",
    paddingVertical: 20,
    paddingHorizontal: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: 350,
  },
  text: {
    color: "#E3C134",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default JoinGameButton;
