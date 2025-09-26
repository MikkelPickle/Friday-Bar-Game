// app/index.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LanguageButton from "../buttons/LanguageButton";
import Burger from "../buttons/Burger";
import Menu from "./Menu";
import JoinGameButton from "../buttons/JoinGameButton";
import NewGameButton from "../buttons/NewGameButton";

export default function HomeScreen() {
  const [open, setOpen] = useState(false);

  return (
    <LinearGradient
      colors={["#4e2489ff", "#1b1a1aff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Burger open={open} setOpen={setOpen} />

      {open && (
        <Pressable style={styles.overlay} onPress={() => setOpen(false)} />
      )}

      <Menu open={open} />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 25 }}>
        <NewGameButton onPress={() => console.log("New Game pressed!")} />
        <JoinGameButton onPress={() => console.log("Join Game pressed!")} />

      </View>

      <View style={styles.languageButton}>
        <LanguageButton />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  button: {
    padding: 12,
    backgroundColor: "#4e2489",
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
