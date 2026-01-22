import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GameProgressProps {
  current: number;
  total: number;
}

export default function GameProgress({ current, total }: GameProgressProps) {
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";

  const progress = Math.min((current + 1) / total, 1);
  const displayCurrent = Math.min(current + 1, total);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isDanish ? "Udfordring" : "Challenge"} {displayCurrent}/{total}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
  },
  text: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF1493",
    borderRadius: 4,
  },
});
