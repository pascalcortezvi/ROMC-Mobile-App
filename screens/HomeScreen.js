import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Banner from "../components/Banner";
import FeaturedCollection from "../components/FeaturedCollection";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  // Existing useFocusEffect for fetching data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen is focused");
      // Here you can call a function to fetch or refresh data
      // fetchData();
      return () => {
        // Optional cleanup if needed
      };
    }, [])
  );

  const onRefresh = useCallback(() => {
    // Add your data fetching or refreshing logic here
    console.log("Refreshing data...");
    setRefreshing(true);
    // Simulate a network request
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Banner />
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
