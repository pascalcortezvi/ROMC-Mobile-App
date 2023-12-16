import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import HTMLView from "react-native-htmlview";

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const url = `https://us-central1-romc-mobile-app.cloudfunctions.net/productDetails-productDetails?productId=${productId}`;

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const product = data.data.product;
        setProductData(product);
        if (product.images.nodes.length > 0) {
          setSelectedImage(product.images.nodes[0].url);
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [productId]);

  return (
    <ScrollView style={styles.container}>
      {productData ? (
        <>
          {/* Display the product image */}
          <View style={styles.imageContainer}>
            <Image
              resizeMode="contain"
              source={{ uri: selectedImage }}
              style={styles.image}
            />
          </View>

          {productData && productData.images.nodes.length > 0 && (
            <FlatList
              data={productData.images.nodes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={({ item }) => (
                <Pressable onPress={() => setSelectedImage(item.url)}>
                  <View style={styles.thumbnailImageContainer}>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.thumbnailImage}
                    />
                  </View>
                </Pressable>
              )}
            />
          )}

          <Text style={styles.price}>
            {`${parseFloat(
              productData.priceRange.minVariantPrice.amount
            ).toFixed(2)} ${
              productData.priceRange.minVariantPrice.currencyCode
            }`}
          </Text>

          <Text style={styles.title}>{productData.title}</Text>

          <View style={styles.addToCartButton}>
            <Pressable>
              <Text style={styles.addToCartText}>Add to cart</Text>
            </Pressable>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text>
            <HTMLView value={productData.descriptionHtml} />
          </Text>
        </>
      ) : (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
    paddingTop: 20,
    padding: 20,
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    height: 500,
  },
  imageContainer: {
    Width: 200,
    height: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  thumbnailImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    marginTop: 20,
    marginRight: 15,
    borderRadius: 10,
    padding: 10,
  },
  thumbnailImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 40,
    textAlign: "center",
  },
  price: {
    fontSize: 24,
    marginBottom: 10,
    marginTop: 40,
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: "#131313",
    padding: 30,
    textAlign: "center",
    borderRadius: 10,
  },
  addToCartText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 10,
  },
});
