import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import HTMLView from "react-native-htmlview"; // Import the library

export default function ProductScreen({ route, navigation }) {
  // Extract the productId from the route parameters
  const { productId } = route.params;

  // State to hold the product data
  const [productData, setProductData] = useState(null);

  // Define the URL for the cloud function with the productId parameter
  const url = `https://us-central1-romc-mobile-app.cloudfunctions.net/productDetails-productDetails?productId=${productId}`;

  // Fetch data from the cloud function
  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Set the productData state with the fetched data
        setProductData(data.data.product);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [productId]);

  return (
    <View style={styles.container}>
      {productData ? (
        <>
          {/* Display the product image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: productData.images.nodes[0].url }}
              style={styles.image}
            />
          </View>
          {/* Display the product title */}
          <Text style={styles.title}>{productData.title}</Text>
          {/* Display the product price */}
          <Text style={styles.price}>
            {`${productData.priceRange.minVariantPrice.amount} ${productData.priceRange.minVariantPrice.currencyCode}`}
          </Text>
          {/* Display the product description */}
          <HTMLView value={productData.descriptionHtml} /> {/* Render HTML */}
        </>
      ) : (
        // Display loading text while fetching data
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
    alignItems: "center",
    paddingTop: 20,
  },
  imageContainer: {
    maxWidth: 300,
    maxHeight: 300,
    backgroundColor: "white",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  price: {
    fontSize: 18,
    marginTop: 10,
  },
});
