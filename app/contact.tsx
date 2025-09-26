import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BackButton from "../components/buttons/BackButton";
import { useTranslation } from "react-i18next";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Contact() {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={["#0432b2ff", "#022a5eff"]}
      style={styles.container}
    >
      {/* Fixed Back Button */}
      <View style={styles.header}>
        <BackButton />
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gradient Headline */}
        {/* Gradient Headline Box */}
      <LinearGradient
        colors={["#ff9100ff", "#f54020ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headlineBox}
      >
        <Text style={styles.headline}>{t("menu.contact")}</Text>
      </LinearGradient>


        {/* Gradient Box */}
        <LinearGradient
          colors={["#951cb0", "#541735ff"]}
          style={styles.box}
        >
          <Text style={styles.boxText}>
            {t("contactText")}</Text>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.04,
    left: SCREEN_WIDTH * 0.04,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.15,
    alignItems: "center",
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  headline: {
  fontSize: 30,
  fontWeight: "bold",
  color: "#ffc414ff", // gold color for pop
  textShadowColor: "#FF4500", // bright orange shadow
  textShadowOffset: { width: 3, height: 3 },
  textShadowRadius: 6,
  letterSpacing: 2,
  padding: 15,
  textAlign: "center"
},
headlineBox: {
  borderRadius: 20,        // rounded corners
  paddingVertical: 12,     // vertical padding
  paddingHorizontal: 20,   // horizontal padding
  marginBottom: 20,        // spacing below
  shadowColor: "#000",     // shadow for pop
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 5,
  width: SCREEN_WIDTH * 0.9,
},
  box: {
    minHeight: 650,
    width: SCREEN_WIDTH * 0.9,
    marginVertical: 10,
    borderRadius: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  boxText: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#E3C134",
    marginTop: 10,
    flexWrap: "wrap",
    lineHeight: 22,
  },
});
