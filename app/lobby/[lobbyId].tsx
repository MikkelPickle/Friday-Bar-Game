import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeToLobby } from "../../services/LobbyService";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function LobbyScreen() {
  const {
    lobbyId: initialLobbyId,
    gamePin: initialGamePin,
    playerName: initialPlayerName,
    initialPlayers,
  } = useLocalSearchParams();

  const router = useRouter();

  const [players, setPlayers] = useState<{ name: string }[]>(() => initialPlayers ? JSON.parse(initialPlayers as string) : []);
  const [pin, setPin] = useState<number | null>(initialGamePin ? Number(initialGamePin) : null);
  const [playerName, setPlayerName] = useState<string | null>(initialPlayerName ? String(initialPlayerName) : null);
  const [lobbyId] = useState<string | null>(initialLobbyId ? (initialLobbyId as string) : null);

  // Load player name from local storage if not passed
  useEffect(() => {
    if (!playerName) {
      const loadPlayerName = async () => {
        const storedName = await AsyncStorage.getItem("playerName");
        setPlayerName(storedName);
      };
      loadPlayerName();
    }
  }, [playerName]);

  // Subscribe to the given lobbyId
  useEffect(() => {
    if (!lobbyId) {
      console.warn("No lobbyId provided in route params");
      return;
    }

    console.log("Subscribing to lobby:", lobbyId);

    const unsubscribe = subscribeToLobby(lobbyId, (lobby: { players: any; pin: any; }) => {
      if (lobby) {
        setPlayers(lobby.players || []);
        setPin(lobby.pin || null);
      } else {
        console.warn("Lobby no longer exists:", lobbyId);
        // Optionally navigate back or show error screen
        router.back(); 
      }
    });

    return () => {
      console.log("Unsubscribing from lobby:", lobbyId);
      unsubscribe();
    };
  }, [lobbyId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby PIN: {pin}</Text>
      <Text style={styles.subtitle}>Players:</Text>
      {players.map((p, idx) => (
        <Text key={idx} style={styles.playerName}>
          {p.name}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1b1a1a", // dark background
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
});
