import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  Animated,
  TouchableOpacity,
} from "react-native";

const SkeletonLoader = () => {
  const fadeAnim = new Animated.Value(0.5);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ ...styles.skeletonContainer, opacity: fadeAnim }}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </Animated.View>
  );
};

export default function FeaturedCollection({ collectionName, collectionId }) {
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

  return (
    <View style={styles.component}>
      <View style={styles.header}>
        <Text style={styles.collectionTitle}>{collectionName}</Text>
        <TouchableOpacity
          onPress={() => {
            /* handle view all action */
          }}
        >
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <FlatList
          data={Array(5).fill({})}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          renderItem={() => <SkeletonLoader />}
        />
      ) : (
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
    display: "flex",
    alignItems: "center",
  },
  productImage: {
    width: 150,
    height: 150,
  },
  productPrice: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  productTitle: {
    fontWeight: "bold",
  },
  // Skeleton styles
  skeletonContainer: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#E1E1E1",
    margin: 10,
    width: 220,
    alignItems: "center",
  },
  skeletonImage: {
    width: 150,
    height: 150,
    backgroundColor: "#C4C4C4",
    marginBottom: 10,
  },
  skeletonText: {
    height: 20,
    width: "80%",
    backgroundColor: "#C4C4C4",
    marginBottom: 10,
  },
});
