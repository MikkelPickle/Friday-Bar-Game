import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import FieldOfStudyDropdown from "../components/buttons/Dropdown";
import SaveStudyButton from "../components/buttons/SaveStudyButton";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const [name, setName] = useState("");
  const [study, setStudy] = useState<string | null>(null);

  const router = useRouter();

  const saveData = async () => {
    if (!name.trim() || !study) {
      alert(`Please enter your ${!name.trim() ? "name" : "field of study"}`);
      return;
    }

    await AsyncStorage.setItem("playerName", name.trim());
    await AsyncStorage.setItem("playerStudy", study);
    await AsyncStorage.setItem("playerScore", "0");

    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#71006dff", "#1317efff"]}
      style={styles.container}
    >
      <Text style={styles.title}>✨ Welcome! ✨</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />

      {/* Dropdown (renders above button because higher zIndex) */}
      <View style={{ zIndex: 10 }}> 
        <FieldOfStudyDropdown onSelect={setStudy} />
      </View>

      <SaveStudyButton saveName={saveData} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.25,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#FFD700", //yellow color for pop 

  },
  input: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.09,
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 3,
    color: "#fff",
    marginBottom: 25,
    borderColor: "#ff88e8",
  },
});
