import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { auth } from "../../config/firebase.config";
import { sendSignInLinkToEmail } from "firebase/auth";
import * as SecureStore from "expo-secure-store";

export default function EmailSignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
      const actionCodeSettings = {
        url: "https://friday-bar-app.firebaseapp.com/finishSignIn.html",
        iOS: {
            bundleId: "com.mikkel.fridaybargame", // Your actual iOS bundle ID
        },
        android: {
            packageName: 'com.mikkel.fridaybargame', // Your actual Android package name
            installApp: false, // Optional: set to true if you want the app to be installed
            minimumVersion: '1' // Optional: minimum version of your app
        },
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
      <View style={styles.container}>
      <Text style={styles.label}>Enter your email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        style={styles.input}
        />
        <Button title={loading ? "Sending..." : "Send Sign-In Link"} onPress={sendLink} disabled={loading} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: "600"
  },

  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  }
});
