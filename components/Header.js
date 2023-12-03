import React from "react";
import { View, StyleSheet, TextInput } from "react-native";

export default function Header() {
  return (
    <View style={styles.header}>
      <TextInput
        placeholderTextColor="white"
        placeholder="Search musicredone.com"
        style={styles.searchBar}
        selectionColor="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  searchBar: {
    height: 50,
    backgroundColor: "#646464",
    borderRadius: 10,
    width: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "white",
    borderWidth: 1,
  },
});
