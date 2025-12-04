import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../components/buttons/BackButton";
import ToggleButton from "../components/buttons/ToggleButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts, Orbitron_600SemiBold, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import Score from "../components/scoreTypes";
import { loadAllScores, seedUsers } from "./LobbyService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const allScoresMock: Score[] = [
  { name: 'Alice', score: 95, study: 'cs' },
  { name: 'Bob', score: 88, study: 'science' },
  { name: 'Charlie', score: 92, study: 'math' },
  { name: 'David', score: 85, study: 'science' },
  { name: 'Eve', score: 90, study: 'math' }, 
  { name: 'Frank', score: 80, study: 'cs' },
  { name: 'Grace', score: 87, study: 'math' },
  { name: 'Heidi', score: 93, study: 'science' },
  { name: 'Ivan', score: 78, study: 'cs' },
  { name: 'Judy', score: 89, study: 'math' },
  { name: 'Karl', score: 91, study: 'science' },
  { name: 'Laura', score: 84, study: 'cs' },
  { name: 'Mallory', score: 86, study: 'math' },
  { name: 'Niaj', score: 94, study: 'science' },
  { name: 'Olivia', score: 79, study: 'cs' },
  { name: 'Peggy', score: 83, study: 'math' },
  { name: 'Quentin', score: 82, study: 'science' },
  { name: 'Rupert', score: 77, study: 'cs' },
  { name: 'Sybil', score: 96, study: 'math' },
  { name: 'Trent', score: 81, study: 'science' },
  { name: 'Ursula', score: 97, study: 'cs' },
  { name: 'Vivian', score: 99, study: 'math' },
  { name: 'Walter', score: 98, study: 'science' },
  { name: 'Xavier', score: 100, study: 'cs' },
  { name: 'Yvonne', score: 95, study: 'math' },
  { name: 'Zachary', score: 88, study: 'science' },
];

export default function Scoreboard() {
  const [fontsLoaded] = useFonts({
    Orbitron_600SemiBold,
    Orbitron_700Bold
  }); 
  
  const [fieldOfStudy, setFieldOfStudy] = useState<string | null>(null);
  const [mode, setMode] = useState<"global" | "study">("global");
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [studyScores, setStudyScores] = useState<Score[]>([]);

  useEffect(() => {
    async function loadScores() {
      try {
        const study = await AsyncStorage.getItem("playerStudy");
        if (study) {
          setFieldOfStudy(study);
        }
        else {
          setFieldOfStudy(null);
          console.log("Field of Study not loaded");
          return;
        }
        console.log("Field of Study loaded:", study);
        await seedUsers(); // Uncomment this line to seed users for testing
        const { allScores, studyScores } = await loadAllScores(study);
        setAllScores(allScores);
        setStudyScores(studyScores);
      } catch (err) {
        console.error("Failed to load scores for scoreboard:", err);
      }
    }

    loadScores();
  }, []);

  if (!fontsLoaded || !allScores || !studyScores) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "purple",
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  const handleToggle = () => {
    setMode(prev => (prev === "global" ? "study" : "global"));
    console.log("Field of Study loaded:", fieldOfStudy);
  };

  const displayedScores =
    mode === "global"
      ? allScores
      : studyScores

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
          // Medal emoji for top 3
          const medal =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            index === 2 ? "🥉" :
            null;

          return (
            <View key={index} style={styles.item}>
            <View style={styles.leftSection}>

              {/* Medal for top 3 */}
              {index < 3 ? (
                <Text style={styles.medalText}>
                  {medal}
                </Text>
              ) : (
                /* Circle for all others */
                <View style={styles.indexCircle}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
              )}

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
}

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
    //make it more to the right
    marginRight: 10,
    },



    headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
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
    position: "absolute",
    top: SCREEN_HEIGHT * 0.04,
    left: SCREEN_WIDTH * 0.01,
    zIndex: 10,
  },

  toggleButton: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.039,
    right: SCREEN_WIDTH * 0.027,
    zIndex: 10,
  },
});
