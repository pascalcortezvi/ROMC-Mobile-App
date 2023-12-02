import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import FeaturedCollection from "../components/FeaturedCollection";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <FeaturedCollection
        collectionName="Podcast"
        collectionId="273926979663"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        collectionName="Audio Interfaces"
        collectionId="80775544902"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        collectionName="Electric Guitars"
        collectionId="80842620998"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        collectionName="Recorders"
        collectionId="80777019462"
        navigation={navigation}
        context="Home"
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
