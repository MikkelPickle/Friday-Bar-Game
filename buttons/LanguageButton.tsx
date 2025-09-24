import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { i18nInstance, SupportedLanguage } from "../languages/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Relative sizing
const BUTTON_SIZE = SCREEN_WIDTH * 0.17;
const BUTTON_SPACING = SCREEN_WIDTH * 0.02;
const BOTTOM_OFFSET = SCREEN_HEIGHT * 0.03;
const LEFT_OFFSET = SCREEN_WIDTH * 0.03;

const LANGUAGES: { code: SupportedLanguage; emoji: string }[] = [
  { code: "en", emoji: "🇬🇧" },
  { code: "da", emoji: "🇩🇰" },
];

const LanguageButton: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = (await AsyncStorage.getItem("userLang")) as SupportedLanguage;
        if (saved) {
          setCurrentLang(saved);
          await i18nInstance.changeLanguage(saved);
        }
      } catch (err) {
        console.error("Failed to load saved language", err);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang: SupportedLanguage) => {
    try {
      await i18nInstance.changeLanguage(lang);
      await AsyncStorage.setItem("userLang", lang);
      setCurrentLang(lang);
      setExpanded(false);
    } catch (err) {
      console.error("Failed to change language", err);
    }
  };

  const currentEmoji = LANGUAGES.find((l) => l.code === currentLang)?.emoji || "🌐";

  return (
    <View style={[styles.container, { bottom: BOTTOM_OFFSET, left: LEFT_OFFSET }]}>
      {/* Main button with vertical gradient */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
        ]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#DA3485", "#1b1a1bff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: BUTTON_SIZE / 2 }]}
        />
        <Text style={[styles.mainButtonText, { fontSize: BUTTON_SIZE * 0.5 }]}>
          {currentEmoji}
        </Text>
      </TouchableOpacity>

      {/* Expanded flags */}
      {expanded && (
        <View style={styles.flagsContainer}>
          {LANGUAGES.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.flagButton,
                {
                  width: BUTTON_SIZE,
                  height: BUTTON_SIZE,
                  borderRadius: BUTTON_SIZE / 2,
                  left: BUTTON_SIZE + (index + 1) * BUTTON_SPACING + index * BUTTON_SIZE,
                },
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={[styles.flagEmoji, { fontSize: BUTTON_SIZE * 0.5 }]}>
                {lang.emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  mainButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#DA3485",
    position: "absolute",
    bottom: 0,
    left: -10,
  },
  mainButtonText: {
    color: "#fff",
    zIndex: 2,
  },
  flagsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: BUTTON_SIZE,
  },
  flagButton: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
    position: "absolute",
    bottom: 0,
  },
  flagEmoji: {},
});

export default LanguageButton;
