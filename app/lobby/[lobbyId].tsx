import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeToLobby } from "../../services/LobbyService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lobby, LobbyPlayer } from "../../types/LobbyTypes";
import { LinearGradient } from "expo-linear-gradient";  

export default function LobbyScreen() {
  const {
    lobbyId: initialLobbyId,
    gamePin: initialGamePin,
    playerName: initialPlayerName
  } = useLocalSearchParams();

  const router = useRouter();

  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [pin, setPin] = useState<number | null>(
    initialGamePin ? Number(initialGamePin) : null
  );
  const [playerName, setPlayerName] = useState<string | null>(
    initialPlayerName ? String(initialPlayerName) : null
  );
  const [lobbyId] = useState<string | null>(
    initialLobbyId ? (initialLobbyId as string) : null
  );

  // Load player name from local storage if not passed
  useEffect(() => {
    if (!playerName) {
      const loadPlayerName = async () => {
        const storedName = await AsyncStorage.getItem("playerName");
        if (storedName) setPlayerName(storedName);
      };
      loadPlayerName();
    }
  }, [playerName]);

  // Subscribe to lobby real-time updates
  useEffect(() => {
    if (!lobbyId) {
      console.warn("No lobbyId provided in route params");
      return;
    }

    console.log("Subscribing to lobby:", lobbyId);

    const unsubscribe = subscribeToLobby(lobbyId, (lobby: Lobby | null) => {
      if (lobby) {
        setPlayers(lobby.players || []);
        setPin(lobby.gamePin || null); // match your backend field
      } else {
        console.warn("Lobby no longer exists:", lobbyId);
        // Navigate back or show a message
        router.push("/HomeScreen");
      }
    });

    return () => {
      console.log("Unsubscribing from lobby:", lobbyId);
      unsubscribe();
    };
  }, [lobbyId]);

return (
  <LinearGradient colors={["#030300ff", "#ba10f3ff"]} style={styles.container}>
    {/* Title */}
    <View style={styles.titleContainer}>
      <Text style={styles.title}>Lobby PIN: {pin}</Text>
    </View>

    <Text style={styles.subtitle}>Players</Text>

    {/* Player Grid */}
    <View style={styles.grid}>
      {players.map((p, idx) => (
        <View key={idx} style={styles.playerCard}>
          <Text style={styles.playerName}>
            {p.name} {p.isLeader ? "👑" : ""}
          </Text>
        </View>
      ))}
    </View>
  </LinearGradient>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 150,
    paddingHorizontal: 15,
  },

  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },

  subtitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },

  // GRID: 2 columns
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },

  // Each player bubble
  playerCard: {
    width: "45%",            // fits 4 across with perfect spacing
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    padding: 40,
  },

  playerName: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});

