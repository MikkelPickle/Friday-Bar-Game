import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import createNewLobby from "./LobbyService"; // adjust import path

export default function NewLobbyScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const { lobbyId, gamePin } = await createNewLobby(name);
      router.push({
        pathname: `/lobby/${lobbyId}`,
        params: { gamePin },
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Lobby</Text>

      <TextInput
        placeholder="Lobby Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#aaa"
      />

      <View style={styles.buttonContainer}>
        <Button title="Create Lobby" onPress={() => {
        console.log("New Lobby Created!");
        handleCreate();}
        } />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden", // so button corners match
  },
});
