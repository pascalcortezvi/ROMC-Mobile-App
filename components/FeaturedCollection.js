import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
} from "react-native";

export default function FeaturedCollection({
  collectionName,
  collectionId,
  navigation,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
              compareAtPrice:
                product.compareAtPriceRange.minVariantPrice.amount > 0
                  ? `${parseFloat(
                      product.compareAtPriceRange.minVariantPrice.amount
                    ).toFixed(2)} ${
                      product.compareAtPriceRange.minVariantPrice.currencyCode
                    }`
                  : null,
              tags: product.tags,
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

  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinking = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    blinking.start();
    return () => blinking.stop();
  }, [blinkAnim]);

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
                <View style={styles.availabilityContainer}>
                  <View style={styles.blocksContainer}>
                    {/* In-Store Block */}
                    <View style={styles.inStoreContainer}>
                      {item.tags && item.tags.includes("in-stock") ? (
                        <>
                          <Animated.View
                            style={{
                              ...styles.blinkingDot,
                              opacity: blinkAnim,
                            }}
                          />
                          <Text style={styles.availableText}>In-Store</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.unavailableSymbol}>X</Text>

                          <Text style={styles.notAvailableText}>In-Store</Text>
                        </>
                      )}
                    </View>

                    {/* Online Block */}
                    <View style={styles.onlineContainer}>
                      <Animated.View
                        style={{ ...styles.blinkingDot, opacity: blinkAnim }}
                      />
                      <Text style={styles.availableText}>Online</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>{item.price}</Text>
                  {item.compareAtPrice && (
                    <Text style={styles.productComparePrice}>
                      {item.compareAtPrice}
                    </Text>
                  )}
                </View>
                <Text style={styles.productTitle}>{item.title}</Text>
                {item.compareAtPrice && (
                  <Text style={styles.saleLabel}>SALE</Text>
                )}
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
    width: 250,
    borderWidth: 1,
    borderColor: "#B4B4B4",
  },
  productImageContainer: {
    height: 150,
    padding: 10,
    marginBottom: 15,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: "row", // Align children side by side
    alignItems: "center",
    marginVertical: 10,
  },
  productPrice: {
    fontSize: 16,
    marginRight: 5,
  },
  productComparePrice: {
    textDecorationLine: "line-through",
    color: "grey",
    fontSize: 12,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  saleLabel: {
    position: "absolute",
    top: 10,
    right: 10,
    color: "white",
    backgroundColor: "#131313",
    fontSize: 13,
    fontWeight: "bold",
    padding: 5,
    borderRadius: 5,
  },
  availabilityContainer: {
    borderRadius: 10,
    marginBottom: 10,
  },
  blocksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  inStoreContainer: {
    flex: 1,
    flexDirection: "row", // Align items in a row within the inStoreContainer
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#ECECEC",
    borderWidth: 1,
    borderColor: "#B4B4B4",
  },
  onlineContainer: {
    flex: 1,
    flexDirection: "row", // Align items in a row within the onlineContainer
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#ECECEC",
    borderWidth: 1,
    borderColor: "#B4B4B4",
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "white",
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  availabilityStatus: {
    flexDirection: "row",
    alignItems: "center",
    // Minimize or remove the top margin to reduce space between title and status
    marginTop: 2,
  },
  blinkingDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#131313",
    marginRight: 8,
  },
  availableText: {
    color: "#131313", // Green for available
    fontSize: 12,
    fontWeight: "bold",
  },
  notAvailableText: {
    color: "#C91414", // Red for not available
    fontSize: 12,
    fontWeight: "bold",
  },
  notInStockContainer: {
    color: "white", // Color for emphasis, adjust as needed
    backgroundColor: "#131313",
    borderRadius: 50,
  },
  notInStock: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 10,
  },
  unavailableSymbol: {
    color: "#C91414",
    marginRight: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
});
