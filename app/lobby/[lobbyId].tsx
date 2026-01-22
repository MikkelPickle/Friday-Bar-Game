import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { subscribeToLobby } from "../../services/LobbyService";
import { startGame } from "../../services/GameService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lobby, LobbyPlayer } from "../../types/LobbyTypes";
import { Intensity } from "../../types/GameTypes";
import { LinearGradient } from "expo-linear-gradient";
import ImageViewer from "../../components/ImageViewer";
import LeaveButton from "../../components/buttons/LeaveButton";
import StartGameButton from "../../components/buttons/StartGameButton";

export default function LobbyScreen() {
  const {
    lobbyId: paramLobbyId,
    gamePin: paramGamePin,
    playerName: paramPlayerName,
    playerUid: paramPlayerUid,
  } = useLocalSearchParams();

  const router = useRouter();

  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [pin, setPin] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerUid, setPlayerUid] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<Intensity>("medium");

  // Check if current player is the leader
  const isLeader = players.find((p) => p.uid === playerUid)?.isLeader ?? false;

  /* ---------------------------------------------
   * Sync route params (they arrive asynchronously)
   * --------------------------------------------- */
  useEffect(() => {
    if (paramLobbyId) {
      setLobbyId(String(paramLobbyId));
    }

    if (paramGamePin != null) {
      setPin(Number(paramGamePin));
    }

    if (paramPlayerName) {
      setPlayerName(String(paramPlayerName));
    }

    if (paramPlayerUid) {
      setPlayerUid(String(paramPlayerUid));
    }
  }, [paramLobbyId, paramGamePin, paramPlayerName, paramPlayerUid]);

  /* ---------------------------------------------
   * Load player UID from AsyncStorage (fallback)
   * --------------------------------------------- */
  useEffect(() => {
    if (playerUid) return;

    const loadPlayerUid = async () => {
      try {
        const storedUid = await AsyncStorage.getItem("playerUid");
        if (storedUid) {
          setPlayerUid(storedUid);
        }
      } catch (err) {
        console.warn("Failed to load playerUid:", err);
      }
    };

    loadPlayerUid();
  }, [playerUid]);

  /* ---------------------------------------------
   * Load player name from AsyncStorage (fallback)
   * --------------------------------------------- */
  useEffect(() => {
    if (playerName) return;

    const loadPlayerName = async () => {
      try {
        const storedName = await AsyncStorage.getItem("playerName");
        if (storedName) {
          setPlayerName(storedName);
        }
      } catch (err) {
        console.warn("Failed to load playerName:", err);
      }
    };

    loadPlayerName();
  }, [playerName]);

  /* ---------------------------------------------
   * Load intensity from AsyncStorage
   * --------------------------------------------- */
  useEffect(() => {
    const loadIntensity = async () => {
      try {
        const storedIntensity = await AsyncStorage.getItem("selectedIntensity");
        if (storedIntensity && (storedIntensity === "mild" || storedIntensity === "medium" || storedIntensity === "spicy")) {
          setIntensity(storedIntensity as Intensity);
        }
      } catch (err) {
        console.warn("Failed to load intensity:", err);
      }
    };

    loadIntensity();
  }, []);

  /* ---------------------------------------------
   * Subscribe to lobby updates
   * --------------------------------------------- */
  useEffect(() => {
    if (!lobbyId) {
      console.warn("No lobbyId available");
      return;
    }

    console.log("Subscribing to lobby:", lobbyId);

    const unsubscribe = subscribeToLobby(lobbyId, (lobby: Lobby | null) => {
      if (!lobby) {
        console.warn("Lobby no longer exists:", lobbyId);
        router.push("/HomeScreen");
        return;
      }

      setPlayers(lobby.players ?? []);
      setGameStatus(lobby.gameStatus ?? null);

      // Only update pin if backend actually provides it
      if (lobby.gamePin != null) {
        setPin(Number(lobby.gamePin));
      }

      // Navigate to game screen when game starts
      if (lobby.gameStatus === "playing") {
        router.push({
          pathname: "/lobby/Game",
          params: {
            lobbyId: lobby.lobbyId,
            playerUid: playerUid,
          },
        });
      }
    });

    return () => {
      console.log("Unsubscribing from lobby:", lobbyId);
      unsubscribe();
    };
  }, [lobbyId, playerUid]);

  /* ---------------------------------------------
   * Handle Start Game
   * --------------------------------------------- */
  const handleStartGame = async () => {
    if (!lobbyId || !playerUid) {
      console.error("Missing lobbyId or playerUid");
      return;
    }

    try {
      await startGame(lobbyId, playerUid, intensity);
      // Navigation will happen automatically via subscription
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  /* ---------------------------------------------
   * Render
   * --------------------------------------------- */
  return (
    <LinearGradient
      colors={["#030300ff", "#103df3ff"]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Game PIN:{" "}
            <Text style={styles.pin}>
              {pin}
            </Text>
          </Text>
        </View>

        {/* Player Grid */}
        <View style={styles.grid}>
          {players.map((p, idx) => (
            <View key={idx} style={styles.playerCard}>
              <ImageViewer
                img={p.avatarUrl}
                changeImage={() => {}}
                scale={0.12}
              />
              <Text style={styles.playerName}>
                {p.name} {p.isLeader ? "👑" : ""}
              </Text>
            </View>
          ))}
        </View>

        {/* Leader Controls */}
        {isLeader && gameStatus !== "playing" && (
          <View style={styles.leaderControls}>
            <StartGameButton onPress={handleStartGame} />
          </View>
        )}

        {/* Non-leader waiting message */}
        {!isLeader && gameStatus !== "playing" && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for the leader to start the game...
            </Text>
          </View>
        )}

        <View style={styles.leaveButtonContainer}>
          <LeaveButton/>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* ---------------------------------------------
 * Styles
 * --------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 90,
    paddingHorizontal: 15,
    paddingBottom: 40,
  },

  titleContainer: {
    alignItems: "center",
    paddingBottom: 35,
    borderBottomWidth: 1,
    borderBottomColor: "yellow",
  },

  title: {
    fontSize: 32,
    fontWeight: "400",
    color: "white",
  },

  grid: {
    paddingTop: 40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },

  playerCard: {
    width: "45%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    padding: 10,
  },

  playerName: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },

  pin: {
    color: "#e62bd3ff",
    fontWeight: "800",
    fontSize: 35
  },

  leaderControls: {
    alignItems: "center",
    marginTop: 30,
    gap: 20,
  },

  waitingContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
  },

  waitingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    textAlign: "center",
  },

  leaveButtonContainer: {
    zIndex: 10,
    marginTop: 40,
    alignItems: "center",
  },
});
