import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { auth } from "../../config/firebase.config";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { addNewUser, checkIfUserExists, loadScore } from "../../app/LobbyService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HandleEmailLink() {
  const [status, setStatus] = useState("Checking sign-in link...");

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (!isSignInWithEmailLink(auth, url)) return;

      const email = await SecureStore.getItemAsync("emailForSignIn");
      if (!email) {
        setStatus("No email found. Please re-enter your email.");
        return;
      }

      try {
        // Sign in the user with the email link
        const { user } = await signInWithEmailLink(auth, email, url);

        // Check if the user exists
        const exists = await checkIfUserExists();
        if (exists) {
          // Load existing score
          try {
            const score = await loadScore();
            await AsyncStorage.setItem("playerScore", score.toString());
          } catch (scoreError) {
            console.error("Error loading score:", scoreError);
          }
        } else {
          // Add new user
          const name = await AsyncStorage.getItem("playerName");
          const study = await AsyncStorage.getItem("playerStudy");

          if (!name || !study) {
            console.error("Missing player name or study information.");
            setStatus("Missing name or study info. Cannot sign in.");
            return;
          }

          const added = await addNewUser(name, study);
          if (!added) {
            console.error("Failed to add user:", name);
            setStatus("Failed to sign in. Try again.");
            return;
          }

          console.log("Added user:", name);
        }

        setStatus("Signed in successfully!");
      } catch (err) {
        console.error("Error signing in with email link:", err);
        setStatus("Failed to sign in. Try again.");
      }
    };

    // Cold start
    Linking.getInitialURL().then(url => url && handleUrl(url));

    // Listen for links while the app is running
    const subscription = Linking.addEventListener("url", e => handleUrl(e.url));
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
