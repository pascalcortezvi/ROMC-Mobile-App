import React from "react";
import { View, StyleSheet, Text } from "react-native";

export default function FeaturedCollection() {
  return (
    <>
      <View style={styles.header}>
        <Text>Salut</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
});
