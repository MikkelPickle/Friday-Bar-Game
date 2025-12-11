// app/index.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LanguageButton from "../buttons/LanguageButton";
import Burger from "../buttons/Burger";
import Menu from "./Menu";
import JoinGameButton from "../buttons/JoinGameButton";
import NewGameButton from "../buttons/NewGameButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import createNewLobby from "../../services/LobbyService"; // adjust import path
const router = useRouter();

const handleCreate = async () => {
  try {
    const playerName = await AsyncStorage.getItem("playerName");
    const { lobbyId, gamePin } = await createNewLobby(playerName); // pass name
    router.push({
      pathname: `/lobby/${lobbyId}`,
      params: { gamePin, playerName },
    });
  } catch (err: any) {
    alert(err.message);
  }
};

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const checkName = async () => {
      const [[, name], [, study], [, score], [, fileExtension]] = await AsyncStorage.multiGet(["playerName", "playerStudy", "playerScore", "fileExtension"]);
      if (!name || !study) {
        router.replace("/WelcomeScreen");
      }
      console.log("Name:", name, "Field of Study:", study, "Score:", score, "File Extension:", fileExtension);
      
    };
    checkName();
  }, []);

  return (
    <LinearGradient
      colors={["#521c9fff", "#292828ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Burger open={open} setOpen={setOpen} />

      {open && (
        <Pressable style={styles.overlay} 
        onPress={() => setOpen(false)} />
      )}

      <Menu open={open} />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
        <View style={{ marginBottom: 50, zIndex: 10 }}>
          <NewGameButton
            onPress={() => {
              console.log("New Game pressed!");
              handleCreate();
            }}
          />
        </View>

        <View style={{ zIndex: 10 }}>
          <JoinGameButton
            onPress={() => {
              console.log("Join Game pressed!");
              router.push("/JoinLobbyScreen");
            }}
          />
        </View>

        <LanguageButton />
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  }
});
