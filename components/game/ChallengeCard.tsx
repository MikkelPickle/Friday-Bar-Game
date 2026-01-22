import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { ResolvedChallenge } from "../../types/GameTypes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChallengeCardProps {
  challenge: ResolvedChallenge;
}

const CATEGORY_COLORS: Record<string, string> = {
  drinking: "#FF1493",
  dare: "#FF9800",
  truth: "#9C27B0",
  embarrassing: "#F44336",
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";

  const text = isDanish ? challenge.textDa : challenge.text;
  const categoryColor = CATEGORY_COLORS[challenge.category] || "#FF1493";

  return (
    <View style={[styles.card, { borderColor: categoryColor }]}>
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryText}>
          {challenge.category.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.challengeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    minHeight: 200,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 3,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryBadge: {
    position: "absolute",
    top: -12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  categoryText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  challengeText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 34,
  },
});
