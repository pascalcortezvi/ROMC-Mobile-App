import React from "react";
import { View, StyleSheet, TextInput, Image } from "react-native";

export default function Header({ onSearch }) {
  return (
    <View style={styles.header}>
      <Image
        source={require("../assets/logo.webp")}
        style={styles.logo}
        resizeMode="contain"
      />
      <TextInput
        placeholderTextColor="white"
        placeholder="Search products..."
        style={styles.searchBar}
        selectionColor="white"
        onChangeText={onSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131313",
    padding: 15,
  },
  logo: {
    width: 100,
    height: 60,
    marginRight: 20,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: "#505050",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "white",
    borderWidth: 1,
  },
});
