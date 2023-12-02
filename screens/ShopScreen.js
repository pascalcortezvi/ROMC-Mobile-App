import React from "react";
import { View, StyleSheet } from "react-native";
import FeaturedCollection from "../components/FeaturedCollection";

export default function ShopScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FeaturedCollection
        collectionName="Digital Cameras"
        collectionId="261280399439"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: "#ECECEC",
  },
});
