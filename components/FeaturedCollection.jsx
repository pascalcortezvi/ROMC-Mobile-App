import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image, FlatList } from "react-native";

export default function FeaturedCollection({ collectionName, collectionId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const collectionUrlId = `gid://shopify/Collection/${collectionId}`;
    const apiUrl = `https://us-central1-romc-mobile-app.cloudfunctions.net/featuredCollection-featuredCollection?collectionId=${collectionUrlId}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // It's good to keep the console log for debugging purposes
        const fetchedProducts = data.data.collection.products.nodes.map(
          (product) => {
            return {
              id: product.id,
              title: product.title,
              imageUrl: product.images.edges[0]?.node.url, // Fetching the URL of the first image
              price: `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`, // Corrected to priceRange
            };
          }
        );
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
            {item.imageUrl && (
              <View style={styles.productImageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.productImage}
                />
              </View>
            )}
            <Text style={styles.productPrice}>{item.price}</Text>
            <Text style={styles.productTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    marginTop: 40,
    marginLeft: 10,
  },
  header: {
    height: 30,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productContainer: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#A5A5A5",
    backgroundColor: "white",
    margin: 10,
    width: 220,
  },
  productImageContainer: {
    display: "flex",
    alignItems: "center",
  },
  productImage: {
    width: 150,
    height: 150,  
  },
  productPrice: {
    marginTop:10,
    marginBottom:10,
    fontSize:18,
  },
  productTitle: {
    fontWeight: "bold",
  },
});
