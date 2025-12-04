import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { auth } from "../../config/firebase.config";
import { sendSignInLinkToEmail } from "firebase/auth";
import * as SecureStore from "expo-secure-store";

export default function EmailSignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const actionCodeSettings = {
    url: "https://auth.expo.io/@mikkelpickle/friday-bar-game",
    handleCodeInApp: true,
  };

  async function sendLink() {
  if (!email || !email.includes("@")) {
    alert("Please enter a valid email.");
    return;
  }
  setLoading(true);
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    await SecureStore.setItemAsync("emailForSignIn", email);
    alert("A login link has been sent to your email!");
  } catch (err) {
    console.error(err);
    alert("Failed to send link. Try again.");
  } finally {
    setLoading(false);
  }
    }

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter your email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 8 }}
        />
        <Button title={loading ? "Sending..." : "Send Sign-In Link"} onPress={sendLink} disabled={loading} />

    </View>
  );
}
