import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import createNewLobby from "../services/LobbyService";
import { Intensity } from "../types/GameTypes";

const INTENSITIES: { value: Intensity; labelEn: string; labelDa: string; descEn: string; descDa: string; color: string }[] = [
  {
    value: "mild",
    labelEn: "Mild",
    labelDa: "Mild",
    descEn: "Light challenges, perfect for warming up",
    descDa: "Lette udfordringer, perfekt til opvarmning",
    color: "#4CAF50",
  },
  {
    value: "medium",
    labelEn: "Medium",
    labelDa: "Medium",
    descEn: "A good mix of fun and daring",
    descDa: "En god blanding af sjov og vovet",
    color: "#FF9800",
  },
  {
    value: "spicy",
    labelEn: "Spicy",
    labelDa: "Pikant",
    descEn: "Bold challenges for the brave!",
    descDa: "Vovede udfordringer for de modige!",
    color: "#F44336",
  },
];

export default function IntensityPickerScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";
  const [loading, setLoading] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState<Intensity | null>(null);

  const handleSelectIntensity = async (intensity: Intensity) => {
    if (loading) return;

    setSelectedIntensity(intensity);
    setLoading(true);

    try {
      // Store selected intensity for later use when starting game
      await AsyncStorage.setItem("selectedIntensity", intensity);

      const playerName = await AsyncStorage.getItem("playerName");
      const { lobbyId, gamePin } = await createNewLobby(playerName || "Player");

      router.replace({
        pathname: `/lobby/${lobbyId}`,
        params: { lobbyId, gamePin, playerName },
      });
    } catch (err: any) {
      console.error("Error creating lobby:", err);
      alert(err.message);
      setLoading(false);
      setSelectedIntensity(null);
    }
  };

  return (
    <LinearGradient
      colors={["#030300ff", "#103df3ff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {isDanish ? "Vaelg Intensitet" : "Choose Intensity"}
        </Text>
        <Text style={styles.subtitle}>
          {isDanish
            ? "Hvor vovede skal udfordringerne vaere?"
            : "How daring should the challenges be?"}
        </Text>

        <View style={styles.buttonList}>
          {INTENSITIES.map((intensity) => {
            const isSelected = selectedIntensity === intensity.value;
            const isLoading = loading && isSelected;

            return (
              <Pressable
                key={intensity.value}
                style={[
                  styles.intensityButton,
                  { borderColor: intensity.color },
                  isSelected && { backgroundColor: intensity.color },
                ]}
                onPress={() => handleSelectIntensity(intensity.value)}
                disabled={loading}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#FFF" />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.intensityLabel,
                        { color: isSelected ? "#FFF" : intensity.color },
                      ]}
                    >
                      {isDanish ? intensity.labelDa : intensity.labelEn}
                    </Text>
                    <Text
                      style={[
                        styles.intensityDesc,
                        { color: isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)" },
                      ]}
                    >
                      {isDanish ? intensity.descDa : intensity.descEn}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonList: {
    width: "100%",
    gap: 20,
  },
  intensityButton: {
    width: "100%",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  intensityLabel: {
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  intensityDesc: {
    fontSize: 14,
    textAlign: "center",
  },
});
