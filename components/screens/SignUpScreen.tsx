import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

// ✅ Import Firebase SDK pieces
import { auth, db } from "../firebase/firebaseConfig"; // adjust if needed
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// -------------------------------
// 🔤 Language setup (open for extension)
// -------------------------------
const supportedLanguages = ["en", "da", "fr", "es"] as const;
type Language = typeof supportedLanguages[number];

// -------------------------------
// 👤 Auth functions
// -------------------------------

// Sign up new user
export async function signUp(
  email: string,
  password: string,
  name: string,
  study: string,
  language: Language
): Promise<string> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // Create player doc in Firestore
  await setDoc(doc(db, "players", uid), {
    name,
    study,
    language,
    score: 0,
  });

  return uid;
}

// Log in existing user
export async function logIn(email: string, password: string): Promise<string> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

// -------------------------------
// 📱 Signup Screen Component
// -------------------------------
const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [study, setStudy] = useState<string>("");
  const [language, setLanguage] = useState<Language>("en");

  const handleSignup = async (): Promise<void> => {
    try {
      const uid: string = await signUp(email, password, name, study, language);
      Alert.alert("Success", `Signed up with UID: ${uid}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e);
        Alert.alert("Error", e.message);
      } else {
        console.error(e);
        Alert.alert("Error", "An unknown error occurred");
      }
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Study</Text>
      <TextInput
        value={study}
        onChangeText={setStudy}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Language</Text>
      <Picker
        selectedValue={language}
        onValueChange={(itemValue: Language) => setLanguage(itemValue)}
        style={{ borderWidth: 1, marginBottom: 10 }}
      >
        {supportedLanguages.map((lang) => (
          <Picker.Item key={lang} label={lang.toUpperCase()} value={lang} />
        ))}
      </Picker>

      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
};

export default SignupScreen;
