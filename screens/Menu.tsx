import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const Menu = ({ open }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current; // start off-screen left
  const { t } = useTranslation();

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);

  return (
    <Animated.View
      style={[
        styles.menu,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>💁🏻‍♂️ {t("menu.about")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>🗺️ {t("menu.map")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>🏆 {t("menu.scoreboard")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>👤 {t("menu.account")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>📩 {t("menu.contact")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: 300,
    backgroundColor: "#302283ff",
    padding: 20,
    justifyContent: "center",
    zIndex: 10,
  },
  link: {
    paddingVertical: 20,
  },
  linkText: {
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#E3C134",
  },
});

export default Menu;
