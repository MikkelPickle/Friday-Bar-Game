import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import BackButton from "../components/buttons/BackButton";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
import JoinGameButton from "../components/buttons/JoinGameButton";
import { useTranslation } from "react-i18next";
import { joinExistingLobby } from "./LobbyService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function JoinLobbyScreen() {
  const [pin, setPin] = useState("");
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<{ name: string }[]>([]);

  const handleJoin = async () => {
  try {
    const { lobbyId, players } = await joinExistingLobby(Number(pin), name);

    router.push({
      pathname: `/lobby/${lobbyId}`,
      params: { initialPlayers: JSON.stringify(players) }, // 👈 pass players
    });
  } catch (err: any) {
    alert(err.message);
  }
};

  return (
    <LinearGradient
      colors={["#1317efff", "#160f0fff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <BackButton />
        </View>

        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          placeholder={t("enterPin")}
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          maxLength={6}
          autoFocus={true}
        />

        <View>
        <JoinGameButton onPress={() => {
          handleJoin();
          console.log("Join Game pressed!");
          router.push("/LobbyScreen"); 
        }} />
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 170,
  },
  header: { position: "absolute", top: SCREEN_HEIGHT * 0.04, left: SCREEN_WIDTH * 0.04, zIndex: 10 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 30,
    fontSize: 32,
    padding: 16,
    width: SCREEN_WIDTH * 0.8,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 30,
  }
});
