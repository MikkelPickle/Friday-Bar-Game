import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { auth } from "../../config/firebase.config";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { addNewUser, checkIfUserExists, loadScore } from "../../services/UserService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HandleEmailLink() {
  const [status, setStatus] = useState("Authenticate with email to make your account persistent.");

  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (isSignInWithEmailLink(auth, url)) {
      let email = await SecureStore.getItemAsync("emailForSignIn");
      if (!email) {
        email = prompt('Please provide your email for confirmation:');
      }
      try {
        // Sign in the user with the email link
        if (email) {
        await signInWithEmailLink(auth, email, url);
        console.log('Successfully signed in with email link!');
        // Navigate to your authenticated part of the app
        } else {
        setStatus("Email not provided for sign-in.");}
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
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#ffffffff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "400",
  },
});
