import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../components/buttons/BackButton";
import ToggleButton from "../components/buttons/ToggleButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, Orbitron_600SemiBold, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import Score from "../components/scoreTypes";
import { loadAllScores, seedUsers } from "../app/lobby/LobbyService";

export default function Scoreboard() {
  const [fontsLoaded] = useFonts({
    Orbitron_600SemiBold,
    Orbitron_700Bold
  }); 
  
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null);
  const [mode, setMode] = useState<"global" | "study">("global");
  const [allScores, setAllScores] = useState<Score[] | null>(null);
  const [studyScores, setStudyScores] = useState<Score[] | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loopAnim = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!fontsLoaded || !allScores || !studyScores) {
    setLoading(true);
  } else {
    setLoading(false);
  }
  }, [fontsLoaded, allScores, studyScores]);

  useEffect(() => {
    if (loading) {
      fadeAnim.setValue(1);
      // Start animation
      loopAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      loopAnim.current.start();
    } else {
      // Stop animation when data has loaded
      if (loopAnim.current) {
        loopAnim.current.stop();
      }
    }
  }, [loading]);

  useEffect(() => {
    async function loadScores() {
      try {
        const study = await AsyncStorage.getItem("playerStudy");
        if (study) {
          setFieldOfStudy(study);
        }
        else {
          setFieldOfStudy(null);
          alert("No field of study found in storage!");
        }
        console.log("Field of Study loaded:", study);
        await seedUsers(); // Uncomment this line to seed users for testing
        const { allScores, studyScores } = await loadAllScores(study);
        setTimeout(async () => {
        setAllScores(allScores);
        setStudyScores(studyScores);
      }, 3000); 
      } catch (err) {
        console.error("Failed to load scores for scoreboard:", err);
      }
    }

    loadScores();
  }, []);

  const handleToggle = () => {
  if (!fieldOfStudy) {
    setMode("global");
    return;
  }
  setMode(prev => (prev === "global" ? "study" : "global"));
  };

  const displayedScores =
    mode === "global"
      ? allScores
      : studyScores

if (loading) {
    return (
      <LinearGradient
      colors={["#4e2489ff", "#1b1a1aff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.backButton}>
        <BackButton />
      </View>

      <View style={styles.toggleButton}>
        <ToggleButton activeMode={mode} onToggle={handleToggle} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>
          {mode === "global" ? "All Rankings" : "Study Rankings"}
        </Text>

        {/* Rank, name, score */}
        <View style={styles.headerRow}>
  
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Rank</Text>
          </View>

          <View style={styles.headerDivider}>
            {/* Left border */}
            <View style={styles.dividerLeft} />
            {/* Right border */}
            <View style={styles.dividerRight} />

            <Text style={styles.headerText}>Name</Text>
          </View>

          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Score</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: 100 }}>
          <Animated.Text style={{fontSize: 25, fontWeight: "400", color: "#FF1493", opacity: fadeAnim}}>Loading scores...</Animated.Text>
        </View>
        </ScrollView>
    </LinearGradient>
    );
  } else {

  return (
    <LinearGradient
      colors={["#4e2489ff", "#1b1a1aff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.backButton}>
        <BackButton />
      </View>

      <View style={styles.toggleButton}>
        <ToggleButton activeMode={mode} onToggle={handleToggle} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.title}>
          {mode === "global" ? "All Rankings" : "Study Rankings"}
        </Text>

        {/* Rank, name, score */}
        <View style={styles.headerRow}>
  
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Rank</Text>
          </View>

          <View style={styles.headerDivider}>
            {/* Left border */}
            <View style={styles.dividerLeft} />
            {/* Right border */}
            <View style={styles.dividerRight} />

            <Text style={styles.headerText}>Name</Text>
          </View>

          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Score</Text>
          </View>

        </View>


        {displayedScores.map((score, index) => {

          return (
            <View key={index} style={styles.item}>
            <View style={styles.leftSection}>
                <View style={styles.indexCircle}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
              <Text style={styles.nameText}>{score.name}</Text>
            </View>

            <Text
              style={
                index === 0
                  ? styles.top1Score
                  : index === 1
                  ? styles.top2Score
                  : index === 2
                  ? styles.top3Score
                  : styles.scoreText
              }>{score.score}</Text>

          </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}}

const styles = StyleSheet.create({

    container: { flex: 1 },

    scrollContent: {
      flexGrow: 1,
      alignSelf: "stretch",
      paddingTop: 150,
      paddingHorizontal: 18,
      paddingBottom: 40,
    },

    title: {
    color: "white",
    fontSize: 30,
    fontWeight: "400",
    opacity: 0.9,
    marginBottom: 20,
    textAlign: "center",
    marginRight: 10,
    },

    headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "rgba(69, 213, 238, 0.45)",
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,   // for Android
    },

    headerCell: {
    flex: 1,
    alignItems: "center",
    },

    headerDivider: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  dividerLeft: {
  position: "absolute",
  left: 0,
  top: -10,
  bottom: -10,
  width: 1,
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  dividerRight: {
  position: "absolute",
  right: 0,
  top: -10,
  bottom: -10,
  width: 1,
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    opacity: 0.9,
  },

  item: {
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  padding: 15,
  borderRadius: 10,
  marginBottom: 12,
  flexDirection: "row",        // row layout
  justifyContent: "space-between", // spread left + right
  alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  medalText: {
  fontSize: 24, 
  marginRight: 14,
  },

  indexCircle: {
  width: 32,
  height: 32,
  borderRadius: 18,
  backgroundColor: "rgba(255, 255, 255, 0.1)", //translucent purple
  borderWidth: 1.5,
  borderColor: "rgba(69, 213, 238, 0.45)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
  shadowColor: "#eb3ed7ff",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.9,
  shadowRadius: 10,
  elevation: 4,
  },

  indexText: {
  color: "white",
  fontSize: 15,
  fontWeight: "300",
  letterSpacing: 0.5,
},

  nameText: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 4,
  },

  scoreText: {
    fontFamily: "Orbitron_600SemiBold",
    color: "yellow",
    fontSize: 16,
    marginRight: 10
  },

  top1Score: {
  fontFamily  : "Orbitron_700Bold",
  fontSize: 22,
  color: "red",
  marginRight: 10
  },

  top2Score: {
    fontFamily  : "Orbitron_700Bold",
    fontSize: 20,
    color: "#ff7300ff", //orange
    marginRight: 10
  },

  top3Score: {
    fontFamily  : "Orbitron_700Bold",
    fontSize: 18,
    color: "#ffa600ff", //more yellow
    marginRight: 10
  },

  backButton: {
    zIndex: 10,
  },

  toggleButton: {
    zIndex: 10,
  },
});
