import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";

export default function FeaturedCollection({
  collectionName,
  collectionId,
  navigation,
}) {
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // VARIABLES DECLARATION
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // FETCH METAOBJECT URL FROM SHOPIFY USING useEffect FOR LOADING STATE

  useEffect(() => {
    const collectionUrlId = `gid://shopify/Collection/${collectionId}`;
    const apiUrl = `https://us-central1-romc-mobile-app.cloudfunctions.net/featuredCollection-featuredCollection?collectionId=${collectionUrlId}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        const fetchedProducts = data.data.collection.products.nodes.map(
          (product) => {
            return {
              id: product.id,
              title: product.title,
              imageUrl: product.images.edges[0]?.node.url,
              price: `${parseFloat(
                product.priceRange.minVariantPrice.amount
              ).toFixed(2)} ${product.priceRange.minVariantPrice.currencyCode}`,
            };
          }
        );
        setProducts(fetchedProducts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setIsLoading(false);
      });
  }, [collectionId]);

  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // SHOW LOADING UNTIL DATA IS READY TO SHOW
  return (
    <View style={styles.component}>
      <View style={styles.header}>
        <Text style={styles.collectionTitle}>{collectionName}</Text>
        <Text style={styles.viewAllButton}>View All</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("Product", {
                  productId: item.id.split("/").pop(),
                })
              }
            >
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
            </TouchableWithoutFeedback>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  component: {
    marginTop: 40,
    marginLeft: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30,
    marginLeft: 10,
    marginRight: 15,
    marginBottom: 5,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    margin: 10,
    width: 220,
  },
  productImageContainer: {
    height: 150,
    padding: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productPrice: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  productTitle: {
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
