import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";

export default function Banner() {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching image URL:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <View style={styles.bannerContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={imageUrl}
              style={styles.banner}
              resizeMode="contain"
            />
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  banner: {
    width: "100%",
    height: "100%",
  },
});
