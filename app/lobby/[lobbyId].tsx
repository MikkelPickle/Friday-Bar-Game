import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { subscribeToLobby } from "../LobbyService"; // adjust import path
import { useLocalSearchParams } from "expo-router";

export default function LobbyScreen() {
  const { lobbyId, gamePin, initialPlayers } = useLocalSearchParams();
  const [players, setPlayers] = useState<{ name: string }[]>(() =>
    initialPlayers ? JSON.parse(initialPlayers as string) : []
  );
  const [pin, setPin] = useState<number | null>(
    gamePin ? Number(gamePin) : null
  );

  useEffect(() => {
    if (!lobbyId) return;

    const unsubscribe = subscribeToLobby(lobbyId as string, (lobby) => {
      setPlayers(lobby.players || []);
      setPin(lobby.pin || pin); // fallback if not set yet
    });

    return () => unsubscribe();
  }, [lobbyId]);

  return (
    <View>
      <Text>Lobby PIN: {pin}</Text>
      <Text>Players:</Text>
      {players.map((p, idx) => (
        <Text key={idx}>{p.name}</Text>
      ))}
    </View>
  );
}


