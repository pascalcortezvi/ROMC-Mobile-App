import React from "react";
import { View, StyleSheet, Image } from "react-native";

export default function Header() {
  return (
    <>
      <View style={styles.header}>
        <Image source={require("../assets/logo.webp")} style={styles.logo} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 140,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
  },
});
