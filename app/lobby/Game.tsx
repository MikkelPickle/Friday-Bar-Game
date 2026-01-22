import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

import { subscribeToGameState, nextChallenge, endGame } from "../../services/GameService";
import { subscribeToLobby } from "../../services/LobbyService";
import { GameState } from "../../types/GameTypes";
import { Lobby, LobbyPlayer } from "../../types/LobbyTypes";
import ChallengeCard from "../../components/game/ChallengeCard";
import GameProgress from "../../components/game/GameProgress";
import NextChallengeButton from "../../components/buttons/NextChallengeButton";
import LeaveButton from "../../components/buttons/LeaveButton";

export default function GameScreen() {
  const { lobbyId: paramLobbyId, playerUid: paramPlayerUid } = useLocalSearchParams();
  const router = useRouter();
  const { i18n } = useTranslation();
  const isDanish = i18n.language === "da";

  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerUid, setPlayerUid] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isLeader, setIsLeader] = useState(false);

  /* ---------------------------------------------
   * Sync route params
   * --------------------------------------------- */
  useEffect(() => {
    if (paramLobbyId) {
      setLobbyId(String(paramLobbyId));
    }
    if (paramPlayerUid) {
      setPlayerUid(String(paramPlayerUid));
    }
  }, [paramLobbyId, paramPlayerUid]);

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
   * Subscribe to lobby for player info
   * --------------------------------------------- */
  useEffect(() => {
    if (!lobbyId) return;

    const unsubscribe = subscribeToLobby(lobbyId, (lobby: Lobby | null) => {
      if (!lobby) {
        router.push("/HomeScreen");
        return;
      }
      setPlayers(lobby.players ?? []);
    });

    return () => unsubscribe();
  }, [lobbyId]);

  /* ---------------------------------------------
   * Update isLeader when players or playerUid changes
   * --------------------------------------------- */
  useEffect(() => {
    if (playerUid && players.length > 0) {
      const leader = players.find((p) => p.uid === playerUid)?.isLeader ?? false;
      setIsLeader(leader);
    }
  }, [playerUid, players]);

  /* ---------------------------------------------
   * Subscribe to game state
   * --------------------------------------------- */
  useEffect(() => {
    if (!lobbyId) return;

    const unsubscribe = subscribeToGameState(lobbyId, (state: GameState | null) => {
      setGameState(state);

      // Navigate back to lobby if game finished
      if (state?.status === "finished") {
        // Stay on game screen to show finished state
      }
    });

    return () => unsubscribe();
  }, [lobbyId]);

  /* ---------------------------------------------
   * Handle Next Challenge
   * --------------------------------------------- */
  const handleNextChallenge = async () => {
    if (!lobbyId || !playerUid) return;

    try {
      await nextChallenge(lobbyId, playerUid);
    } catch (error) {
      console.error("Failed to advance challenge:", error);
    }
  };

  /* ---------------------------------------------
   * Handle End Game
   * --------------------------------------------- */
  const handleEndGame = async () => {
    if (!lobbyId || !playerUid) return;

    try {
      await endGame(lobbyId, playerUid);
      router.push("/HomeScreen");
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  /* ---------------------------------------------
   * Get current challenge
   * --------------------------------------------- */
  const currentChallenge = gameState?.challenges?.[gameState.currentChallengeIndex];
  const isLastChallenge = gameState
    ? gameState.currentChallengeIndex >= gameState.totalChallenges - 1
    : false;
  const isFinished = gameState?.status === "finished";

  /* ---------------------------------------------
   * Render loading state
   * --------------------------------------------- */
  if (!gameState) {
    return (
      <LinearGradient colors={["#030300ff", "#103df3ff"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isDanish ? "Indlaeser spil..." : "Loading game..."}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  /* ---------------------------------------------
   * Render finished state
   * --------------------------------------------- */
  if (isFinished) {
    return (
      <LinearGradient colors={["#030300ff", "#103df3ff"]} style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>
            {isDanish ? "SPIL FAERDIGT!" : "GAME FINISHED!"}
          </Text>
          <Text style={styles.finishedSubtitle}>
            {isDanish
              ? "Tak fordi I spillede med!"
              : "Thanks for playing!"}
          </Text>
          <View style={styles.finishedButton}>
            <LeaveButton />
          </View>
        </View>
      </LinearGradient>
    );
  }

  /* ---------------------------------------------
   * Render game screen
   * --------------------------------------------- */
  return (
    <LinearGradient colors={["#030300ff", "#103df3ff"]} style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <GameProgress
            current={gameState.currentChallengeIndex}
            total={gameState.totalChallenges}
          />
        </View>

        {/* Challenge Card */}
        <View style={styles.cardContainer}>
          {currentChallenge && <ChallengeCard challenge={currentChallenge} />}
        </View>

        {/* Leader Controls */}
        {isLeader && (
          <View style={styles.controlsContainer}>
            <NextChallengeButton
              onPress={handleNextChallenge}
              isLast={isLastChallenge}
            />
          </View>
        )}

        {/* Non-leader message */}
        {!isLeader && (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              {isDanish
                ? "Venter på at lederen går videre..."
                : "Waiting for the leader to continue..."}
            </Text>
          </View>
        )}
      </View>
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

  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 15,
    alignItems: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFF",
    fontSize: 20,
  },

  progressContainer: {
    marginBottom: 40,
  },

  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  controlsContainer: {
    marginBottom: 50,
    alignItems: "center",
  },

  waitingContainer: {
    marginBottom: 50,
    padding: 20,
  },

  waitingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    textAlign: "center",
  },

  finishedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  finishedTitle: {
    color: "#E3C134",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
  },

  finishedSubtitle: {
    color: "#FFF",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 40,
  },

  finishedButton: {
    marginTop: 20,
  },
});
