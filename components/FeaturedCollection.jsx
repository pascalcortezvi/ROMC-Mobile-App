import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, Image } from "react-native";

export default function FeaturedCollection({ collectionName, collectionId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const collectionUrlId = `gid://shopify/Collection/${collectionId}`;
    const apiUrl = `https://us-central1-romc-mobile-app.cloudfunctions.net/featuredCollection-featuredCollection?collectionId=${collectionUrlId}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const fetchedProducts =
          data.data.collection.products.edges.map((edge) => edge.node) || [];
        setProducts(fetchedProducts);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [collectionId]);

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.collectionTitle}>{collectionName}</Text>
      </View>
      {products.map((product, index) => (
        <View key={index} style={styles.productContainer}>
          {product.images.edges.length > 0 && (
            <View style={styles.productImageContainer}>
              <Image
                source={{ uri: product.images.edges[0].node.src }}
                style={styles.productImage}
              />
            </View>
          )}
          <Text>{product.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  collectionTitle: {
    fontSize: 18,
  },
  productContainer: {
    padding: 20,
    borderWidth: 1,
    borderBottomColor: "#ddd",
  },
  productImageContainer: {
    backgroundColor: "#fff",
  },
  productImage: {
    width: 100,
    height: 100,
  },
});
