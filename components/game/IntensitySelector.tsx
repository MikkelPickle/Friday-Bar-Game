import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Intensity } from "../../types/GameTypes";

interface IntensitySelectorProps {
  selected: Intensity;
  onSelect: (intensity: Intensity) => void;
}

const INTENSITIES: { value: Intensity; labelEn: string; labelDa: string; color: string }[] = [
  { value: "mild", labelEn: "Mild", labelDa: "Mild", color: "#4CAF50" },
  { value: "medium", labelEn: "Medium", labelDa: "Medium", color: "#FF9800" },
  { value: "spicy", labelEn: "Spicy", labelDa: "Pikant", color: "#F44336" },
];

export default function IntensitySelector({ selected, onSelect }: IntensitySelectorProps) {
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{isDanish ? "Intensitet:" : "Intensity:"}</Text>
      <View style={styles.buttonsContainer}>
        {INTENSITIES.map((intensity) => {
          const isSelected = selected === intensity.value;
          return (
            <Pressable
              key={intensity.value}
              style={[
                styles.button,
                { borderColor: intensity.color },
                isSelected && { backgroundColor: intensity.color },
              ]}
              onPress={() => onSelect(intensity.value)}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isSelected ? "#FFF" : intensity.color },
                ]}
              >
                {isDanish ? intensity.labelDa : intensity.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  label: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
