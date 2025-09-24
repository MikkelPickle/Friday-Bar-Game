// loadingScreen.tsx
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

type LoadingScreenProps = {
  onFinish: () => void;
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c0939", // 👈 solid dark blue background
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 600,
    height: 600,
  },
});

export default LoadingScreen;
