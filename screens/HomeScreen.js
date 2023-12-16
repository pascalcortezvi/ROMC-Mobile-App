import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import Banner from "../components/Banner";
import FeaturedCollection from "../components/FeaturedCollection";

export default function HomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Banner refreshTrigger={refreshTrigger} />
      <FeaturedCollection
        refreshTrigger={refreshTrigger}
        collectionName="Podcast"
        collectionId="273926979663"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        refreshTrigger={refreshTrigger}
        collectionName="Audio Interfaces"
        collectionId="80775544902"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        refreshTrigger={refreshTrigger}
        collectionName="Electric Guitars"
        collectionId="80842620998"
        navigation={navigation}
        context="Home"
      />
      <FeaturedCollection
        refreshTrigger={refreshTrigger}
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
    backgroundColor: "#E4E4E4",
    paddingBottom: 20,
  },
});
