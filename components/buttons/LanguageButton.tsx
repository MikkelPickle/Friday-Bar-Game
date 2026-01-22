import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { i18nInstance, SupportedLanguage } from "../../languages/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGES: { code: SupportedLanguage; emoji: string }[] = [
  { code: "en", emoji: "🇬🇧" },
  { code: "da", emoji: "🇩🇰" },
];

const LanguageButton: React.FC = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Relative sizing
  const BUTTON_SIZE = SCREEN_WIDTH * 0.17;
  const BUTTON_SPACING = SCREEN_WIDTH * 0.03;
  const BOTTOM_OFFSET = SCREEN_HEIGHT * 0.05;
  const LEFT_OFFSET = SCREEN_WIDTH * 0.01;
  const [expanded, setExpanded] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en");

  // Animated values per flag (0 = hidden, 1 = visible)
  const animatedValues = useRef(LANGUAGES.map(() => new Animated.Value(0))).current;

  // New: Press animation for main + flags
  const pressScaleMain = useRef(new Animated.Value(1)).current;
  const pressScaleFlags = useRef(LANGUAGES.map(() => new Animated.Value(1))).current;

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

  const expand = () => {
    const springs = animatedValues.map((av) =>
      Animated.spring(av, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 20,
      })
    );
    Animated.stagger(80, springs).start();
  };

  const collapse = () => {
    const timings = animatedValues.map((av) =>
      Animated.timing(av, {
        toValue: 0,
        duration: 130,
        easing: Easing.in(Easing.linear),
        useNativeDriver: true,
      })
    );
    Animated.stagger(50, timings.reverse()).start();
  };

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (next) expand();
      else collapse();
      return next;
    });
  };

  const changeLanguage = async (lang: SupportedLanguage) => {
  try {
    const index = LANGUAGES.findIndex((l) => l.code === lang);

    // 🔥 Pulse animation on selected flag
    Animated.sequence([
      Animated.spring(pressScaleFlags[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 25,
      }),
      Animated.spring(pressScaleFlags[index], {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 25,
      }),
    ]).start();

    await i18nInstance.changeLanguage(lang);
    await AsyncStorage.setItem("userLang", lang);
    setCurrentLang(lang);

    // collapse after selecting
    collapse();
    setExpanded(false);

  } catch (err) {
    console.error("Failed to change language", err);
  }
};


  const currentEmoji =
    LANGUAGES.find((l) => l.code === currentLang)?.emoji || "🌐";

  return (
    <View style={[styles.container, { bottom: BOTTOM_OFFSET, left: LEFT_OFFSET, width: SCREEN_WIDTH, height: SCREEN_WIDTH }]}>
      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.mainButton,
          { width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
          { transform: [{ scale: pressScaleMain }] },
        ]}
        onPress={toggleExpanded}
        activeOpacity={0.8}
        onPressIn={() => {
          Animated.spring(pressScaleMain, {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 20,
            bounciness: 0,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(pressScaleMain, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 35,
          }).start();
        }}
      >
        <LinearGradient
          colors={["#DA3485", "#591059ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: BUTTON_SIZE / 2 }]}
        />
        <Text style={[styles.mainButtonText, { fontSize: BUTTON_SIZE * 0.5 }]}>
          {currentEmoji}
        </Text>
      </TouchableOpacity>

      {/* Flags (animated) */}
      <View style={[styles.flagsContainer, { height: BUTTON_SIZE }]} pointerEvents="box-none">
        {LANGUAGES.map((lang, i) => {
          const offset = BUTTON_SIZE + i * BUTTON_SPACING + i * BUTTON_SIZE;

          const translateX = animatedValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, offset],
          });

          const scale = animatedValues[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          });

          const opacity = animatedValues[i];

          return (
            <Animated.View
              key={lang.code}
              style={[
                styles.flagAnimatedContainer,
                {
                  width: BUTTON_SIZE,
                  height: BUTTON_SIZE,
                  transform: [{ translateX }, { scale }],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.flagButton,
                  { borderRadius: 35, width: BUTTON_SIZE, height: BUTTON_SIZE },
                  { transform: [{ scale: pressScaleFlags[i] }] },
                ]}
                onPress={() => changeLanguage(lang.code)}
                activeOpacity={0.8}
                onPressIn={() => {
                  Animated.spring(pressScaleFlags[i], {
                    toValue: 0.85,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 0,
                  }).start();
                }}
                onPressOut={() => {
                  Animated.spring(pressScaleFlags[i], {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 50,
                  }).start();
                }}
              >
                <Text style={[styles.flagEmoji, { fontSize: BUTTON_SIZE * 0.5 }]}>
                  {lang.emoji}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
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
    zIndex: 5,
  },
  flagsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    justifyContent: "center",
  },
  flagAnimatedContainer: {
    position: "absolute",
    bottom: 0,
  },
  flagButton: {
    backgroundColor: "rgba(125, 125, 125, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
    borderColor: "#DA3485",
    shadowColor: "rgba(246, 17, 223, 0.9)",
    shadowOpacity: 0.75,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  flagEmoji: {
    shadowColor: "#8c62f8ff",
    shadowOpacity: 0.65,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});

export default LanguageButton;
