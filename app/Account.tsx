import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts, Orbitron_400Regular } from "@expo-google-fonts/orbitron";

// Import your components
import BackButton from "../components/buttons/BackButton";
import LogOutButton from "../components/buttons/LogOutButton";
import EmailSignIn from "../components/auth/EmailSignIn";
import HandleEmailLink from "../components/auth/HandleEmailLink";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Account() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fontsLoaded] = useFonts({
      Orbitron_400Regular
    }); 

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const auth = getAuth();

    // Load AsyncStorage and auth state
    const init = async () => {
      const name = await AsyncStorage.getItem("playerName");
      const study = await AsyncStorage.getItem("playerStudy");
      const score = await AsyncStorage.getItem("playerScore");
      setPlayerName(name);
      setFieldOfStudy(study);
      setScore(score ? parseInt(score) : 0);

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
      <LinearGradient colors={["#b20d04ff", "#022a5eff"]} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: SCREEN_HEIGHT * 0.5 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1b0dbdff", "#1c1027ff"]} style={styles.container}>
      <View style={styles.backButton}>
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
      <View style={styles.imageWrapper}>
        <TouchableOpacity onPress={pickImage}>
          <Image 
            source={image ? { uri: image } : require("../assets/default-profile.jpg")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.field}>
        <Ionicons
                name="person-outline"
                size={30}
                color="yellow"

              />
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.label}>Player Name</Text>
          <TextInput
            style={styles.input}
            value={playerName || ""}
            onChangeText={(text) => setPlayerName(text)}
            onBlur={() => playerName && AsyncStorage.setItem("playerName", playerName)}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
          </View>
        </View>

        <View style={styles.field}>
        <Ionicons
                name="school-outline"
                size={30}
                color="yellow"
              />
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.label}>Field of Study</Text>
          <Text style={styles.input}>
            {fieldOfStudy}
          </Text>
          </View>
        </View>

        <View style={styles.field}>
        <Ionicons
                name="trophy-outline"
                size={30}
                color="yellow"
              />
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.label}>Score</Text>
          <Text style={[styles.input, { fontFamily: 'Orbitron_400Regular', fontSize: 25, color: '#fd27f6ff' }]}>
            {123656}
          </Text>
        </View>
        </View>

      </View>

        {user ? (
          <>
            <View style={{ flex: 1, alignItems: "center", marginTop: 50, width: "80%" }}>
              <LogOutButton />
            </View>
          </>
        ) : (
          <>
            
            <View style={{ flex: 1, alignItems: "center", marginTop: 50, width: "80%" }}>
              <LogOutButton />
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.07,
    alignItems: "center",
    flexGrow: 1, 
    alignSelf: "stretch",
  },
  imageWrapper: {
    marginTop: 20,
    marginBottom: 40,
    position: "relative",
  },

  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#e62bd3ff',
    overflow: 'hidden',
  },

  fieldContainer: {
    width: "85%",
    gap: 30,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 15, 230, 0.3)',
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#d819d2ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },

  label: {
    fontSize: 20,
    paddingHorizontal: 12,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.6)",
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 25,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 1)",
  },
});
