import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// Import your components
import BackButton from "../components/buttons/BackButton";
import LogOutButton from "../components/buttons/LogOutButton";
import EmailSignIn from "../components/auth/EmailSignIn";
import HandleEmailLink from "../components/auth/HandleEmailLink";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();

    // Load AsyncStorage and auth state
    const init = async () => {
      const name = await AsyncStorage.getItem("playerName");
      const study = await AsyncStorage.getItem("playerStudy");
      setPlayerName(name);
      setFieldOfStudy(study);

      // Listen to Firebase auth state
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return unsubscribe;
    };

    const cleanup = init();
    return () => {
      cleanup.then((unsubscribe) => unsubscribe && unsubscribe());
    };
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#0432b2ff", "#022a5eff"]} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: SCREEN_HEIGHT * 0.5 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0432b2ff", "#022a5eff"]} style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Account</Text>

        {user ? (
          <>
            <Text style={styles.infoText}>Logged in as: {user.email}</Text>
            <Text style={styles.infoText}>Player name: {playerName || "N/A"}</Text>
            <Text style={styles.infoText}>Field of study: {fieldOfStudy || "N/A"}</Text>
            <View style={{ marginTop: 20 }}>
              <LogOutButton />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.infoText}>You are not signed in. Please authenticate:</Text>
            <View style={{ marginTop: 20 }}>
              <EmailSignIn />
              <HandleEmailLink />
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.04,
    left: SCREEN_WIDTH * 0.01,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.18,
    alignItems: "center",
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#fff",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
});
