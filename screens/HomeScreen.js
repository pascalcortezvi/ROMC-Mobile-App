import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import FeaturedCollection from "../components/FeaturedCollection";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <FeaturedCollection
        collectionName="Digital Cameras"
        collectionId="80792649798"
      />
      <FeaturedCollection
        collectionName="Digital Cameras"
        collectionId="80792649798"
      />
      <FeaturedCollection
        collectionName="Digital Cameras"
        collectionId="80792649798"
      />
      <FeaturedCollection
        collectionName="Digital Cameras"
        collectionId="80792649798"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
  },
});
