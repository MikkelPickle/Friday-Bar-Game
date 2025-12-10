import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../../config/firebase.config";
import * as SecureStore from "expo-secure-store";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

export default function EmailSignIn({ visible, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const actionCodeSettings = {
    url: "https://friday-bar-app.firebaseapp.com",
    handleCodeInApp: true,
    iOS: { bundleId: "com.mikkel.fridaybargame" },
    android: { packageName: "com.mikkel.fridaybargame", installApp: false },
  };

  async function sendLink() {
    if (!email.includes("@")) return alert("Enter a valid email.");
    setLoading(true);

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      await SecureStore.setItemAsync("emailForSignIn", email);
      alert("A login link has been sent to your email!");
      onClose();
    } catch (err) {
      alert("Failed to send link.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View 
        entering={FadeIn.duration(200)} 
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <BlurView intensity={80} tint="dark" style={styles.glassContainer}>
          <Text style={styles.title}>Sign In</Text>

          <TextInput
            placeholder="Email Address"
            //center the placeholder
            textAlign="center"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            selectionColor="yellow"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TouchableOpacity 
          activeOpacity={0.6}
          hitSlop={12}
          style={styles.button} 
          onPress={sendLink}>
            <Text style={styles.buttonText}>
              {loading ? "Sending..." : "Send Link"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity  
          activeOpacity={0.3}
          hitSlop={12}
          style={styles.cancelButton} 
          onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  glassContainer: {
    width: "90%",
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(43, 23, 224, 0.5)", 
    elevation: 10,
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    textAlign: "center",
    color: "white",
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
    padding: 14,
    color: "white",
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "400",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  button: {
    backgroundColor: "rgba(224, 23, 210, 0.55)",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 6,
  },
  cancelText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    textAlign: "center",
  },
});
