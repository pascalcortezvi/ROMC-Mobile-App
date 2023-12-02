import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ProductScreen({ route }) {
  const { product } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      </View>
      <Text style={styles.title}>{product.price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
  },
  imageContainer: {
    maxWidth: 300,
    maxHeight: 300,
    backgroundColor: "white",
    marginTop: 50,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  title: {
    // styling for the product title
  },
  // ... more styles
});
