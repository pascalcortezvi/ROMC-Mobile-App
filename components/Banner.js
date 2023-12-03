import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";

export default function Banner() {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    fetch(
      "https://us-central1-romc-mobile-app.cloudfunctions.net/banner-banner"
    )
      .then((response) => response.json())
      .then((data) => {
        const bannerUrl = data.data.metaobject.fields[0].value;
        if (bannerUrl) {
          setImageUrl({ uri: bannerUrl });
        }
        setIsLoading(false); // Set loading to false after fetching data
      })
      .catch((error) => {
        console.error("Error fetching image URL:", error);
        setIsLoading(false); // Also set loading to false in case of error
      });
  }, []);

  return (
    <View style={styles.bannerContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        imageUrl && <Image source={imageUrl} style={styles.banner} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: "blue",
    width: "100%",
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
