import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LanguageButton from "./buttons/LanguageButton";
import { initI18n } from "./languages/i18n";
import Burger from "./buttons/Burger";
import Menu from "./screens/Menu";
import LoadingScreen from "./screens/LoadingScreen";
import JoinGameButton from "./buttons/JoinGameButton";
import NewGameButton from "./buttons/NewGameButton";

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // wait for i18n init + 3s minimum splash
        await Promise.all([initI18n(), new Promise(r => setTimeout(r, 3000))]);
        setAppReady(true);
      } catch (err) {
        console.error("Init failed", err);
        setAppReady(true);
      }
    };
    initialize();
  }, []);

  if (!appReady) {
    return <LoadingScreen onFinish={() => {}} />;
  }

  return (
    <LinearGradient
      colors={["#4e2489ff", "#1b1a1aff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Burger */}
      <Burger open={open} setOpen={setOpen} />

      {/* Overlay */}
      {open && <Pressable style={styles.overlay} onPress={() => setOpen(false)} />}

      {/* Slide-in menu */}
      <Menu open={open} />

      {/* Main content */}
     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 25 }}>
      <NewGameButton onPress={() => console.log("New Game pressed!")} />
      <JoinGameButton onPress={() => console.log("Join Game pressed!")} />
     </View>


      {/* Language button */}
      <View style={styles.languageButton}>
        <LanguageButton />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  languageButton: { position: "absolute", bottom: 20, left: 20 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },
});
