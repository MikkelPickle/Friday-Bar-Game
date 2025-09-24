// loadingScreen.tsx
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type LoadingScreenProps = {
  onFinish: () => void;
};

const LoadingScreenAlt: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={["#4e2489ff", "#1b1a1aff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Beer emoji at the top (can be replaced with your PNG later) */}
      <Text style={styles.beerIcon}>🍺🍺</Text>

      {/* Title stacked vertically */}
      <Text style={styles.title}>TOUR DE</Text>
      <Text style={styles.title}>FREDAGSBAR</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Spillet</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  beerIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 50,
    color: "#FFD700", // golden yellow
    fontFamily: "LuckiestGuy", // replace with your neon font
    textAlign: "center",
  },
  subtitle: {
    fontSize: 80,
    color: "#FF1493", // neon pink
    fontFamily: "LuckiestGuy", // pick a fun script font
    marginTop: -5,
  },
});

export default LoadingScreenAlt;
