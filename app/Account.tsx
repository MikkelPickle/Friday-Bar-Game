import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Directory, Paths, File } from 'expo-file-system';
import ImageViewer from "../components/ImageViewer";

// Import your components
import BackButton from "../components/buttons/BackButton";
import LogOutButton from "../components/buttons/LogOutButton";
import AuthButton from "../components/buttons/AuthButton";
import HandleEmailLink from "../components/auth/HandleEmailLink";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Account() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

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
    });

    if (result.canceled) return;
    // Create a persistent profile picture
    try {
    const uri = result.assets[0].uri;
    const file = new File(uri); 
    const directory = new Directory(Paths.cache, "profile")
    if (!directory.exists)  {
      directory.create() //first time setting profile picture
      console.log("Directory URI after creation:", directory.uri);
    } 
    else {
      directory.delete()
      directory.create() // changing profile picture
      console.log("OVERWRITTEN DIRECTORY URI:", directory.uri);
    }; 
    console.log("File URI after creation:", file.uri);
    const ext = file.extension;
    file.rename("profilePicture" + Date.now().toString() + ext);
    await AsyncStorage.setItem("fileExtension", file.name);
    //if file doesn't exist, create it, else update image
    console.log("File URI after rename:", file.uri);
    file.move(directory); //target directory
    console.log("File URI after move: ", file.uri);
    setImage(file.uri);
    console.log("Successfully picked image URI:", file.uri); 
    } catch (error) {
      console.log("Error while picking image:", error);
    }};

  useEffect(() => {
    const auth = getAuth();

    // Load AsyncStorage and auth state
    const init = async () => {
      const [[, name], [, study], [, score], [, fileExtension]] = await AsyncStorage.multiGet(["playerName", "playerStudy", "playerScore", "fileExtension"]);
      console.log("fileExtension:", fileExtension);
      if (fileExtension !== null && fileExtension !== "") { //load profile picture
        const directory = new Directory(Paths.cache, "profile");
        const file = new File(directory, fileExtension);
        console.log("File URI:", file.uri);
        console.log("File exists:", file.exists)
        setImage(file.uri);
      }
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
    <LinearGradient colors={["#2315beff", "#1c1027ff"]} style={styles.container}>
      <View style={styles.backButton}>
        <BackButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <ImageViewer img={image} changeImage={pickImage} />

      <View style={styles.fieldContainer}>
        <View style={styles.field}>
        <Ionicons
                name="person-outline"
                size={30}
                color="yellow"
              />
        <View style={{ flex: 1, paddingLeft: 5 }}>
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
        <View style={{ flex: 1, paddingLeft: 5 }}>
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
        <View style={{ flex: 1, paddingLeft: 5 }}>
          <Text style={styles.label}>Score</Text>
          <Text style={[styles.input, { fontFamily: 'Orbitron_400Regular' }]}>
            {score}
          </Text>
        </View>
        </View>

      </View>

        {user ? (
          <>
            <View style={{ flex: 1, alignItems: "center", marginTop: 40, width: "85%" }}>
              <LogOutButton />
              <View style={{ marginTop: 30, width: "85%" }}>
              <Text style={styles.statusText}>Successfully signed in!</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            
            <View style={{ flex: 1, alignItems: "center", marginTop: 40, width: "85%" }}>
              <AuthButton />
              <View style={{width: "85%" }}>
              <HandleEmailLink />
              </View>
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
    justifyContent: "center",
  },

  fieldContainer: {
    width: "85%",
    gap: 20,
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
    shadowRadius: 3,
  },

  label: {
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 1)",
  },

  statusText: {
    color: "#ffffffff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "400",
  },
});
