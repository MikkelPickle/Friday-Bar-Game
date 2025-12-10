import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import FieldOfStudyDropdown from "../components/buttons/Dropdown";
import SaveStudyButton from "../components/buttons/SaveStudyButton";
import LanguageButton from "../components/buttons/LanguageButton";

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
    await AsyncStorage.setItem("fileExtension", "");

    router.replace("/");
  };

  return (
    <LinearGradient
      colors={["#71006dff", "#1317efff"]}
      style={styles.container}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 20 }}>
      <Text style={styles.title}>✨ Welcome! ✨</Text>

      <View style={{ zIndex: 100, width: "100%", alignContent: "center" }}>
      <TextInput
        style={styles.input}
        placeholder="Enter your name..."
        placeholderTextColor="#ccc"
        value={name}
        //on press closes the keyboard
        onChangeText={setName}
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="words"
      />
      </View>

      {/* Dropdown (renders above button because higher zIndex) */}
      <View style={{ zIndex: 100, width: "100%", alignItems: "center" }}> 
        <FieldOfStudyDropdown onSelect={setStudy} />
      </View>
      <View style={{ zIndex: 10 }}>
      <SaveStudyButton saveName={saveData} />
      </View>
        <LanguageButton />
        </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 35,
    color: "#FFD700", //yellow color for pop
    textShadowColor: '#ec2dc5ff',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 2, 

  },
  input: {
    minWidth: "85%",
    maxWidth: "85%",
    textAlign: "center",
    height: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    fontSize: 20,
    fontWeight: '400',
    borderWidth: 3,
    color: "#fff",
    marginBottom: 25,
    borderColor: "#ec2dc5ff",
  }
});
