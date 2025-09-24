// app/about.tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is a dummy screen.</Text>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: { fontSize: 18, fontWeight: "bold" },
  button: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#4e2489",
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
