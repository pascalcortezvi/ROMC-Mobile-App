import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Image,
  FlatList,
} from "react-native";

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
    <View style={styles.component}>
      <View style={styles.header}>
        <Text style={styles.collectionTitle}>{collectionName}</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            {item.images.edges.length > 0 && (
              <View style={styles.productImageContainer}>
                <Image
                  source={{ uri: item.images.edges[0].node.src }}
                  style={styles.productImage}
                />
              </View>
            )}
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    marginTop:40,
    marginBottom:40,
  },
  header: {
    height: 50,
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
    width: 200,
  },
  productImageContainer: {
    padding: 20,
    backgroundColor: "red",
    display: "flex",
    alignItems: "center", // Center the image horizontally
  },
  productImage: {
    width: 100,
    height: 100,
  },
});
