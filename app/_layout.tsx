// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router"; // <-- important
import LoadingScreen from "../components/screens/LoadingScreen";
import { initI18n } from "../languages/i18n";

export default function Layout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([initI18n(), new Promise(r => setTimeout(r, 3000))]);
      setAppReady(true);
    };
    initialize();
  }, []);

  if (!appReady) {
    return <LoadingScreen onFinish={() => {}} />;
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          presentation: "modal", // lets pages layer on top
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="about"
          options={{
            presentation: "card", // normal push animation
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
