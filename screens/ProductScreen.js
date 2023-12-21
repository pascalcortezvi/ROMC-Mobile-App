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
  const { productId, key } = route.params;
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const url = `https://us-central1-romc-mobile-app.cloudfunctions.net/productDetails-productDetails?productId=${productId}`;

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const product = data.data.product;
        console.log(data);
        setProductData(product);
        if (product.images.nodes.length > 0) {
          setSelectedImage(product.images.nodes[0].url);
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, [productId, key]);

  const renderInventoryLocation = (inventoryLevels) => {
    return inventoryLevels.edges.map((edge, index) => {
      const locationName = edge.node.location.name;
      const quantity = edge.node.quantities[0].quantity;

      return (
        <View key={index} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{locationName}:</Text>
          <Text style={styles.detailValue}>{quantity}</Text>
        </View>
      );
    });
  };

  const renderDetail = (label, value) => {
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {productData ? (
        <>
          <View style={styles.imageContainer}>
            <Image
              resizeMode="contain"
              source={{ uri: selectedImage }}
              style={styles.image}
            />
          </View>

          {productData.images.nodes.length > 0 && (
            <FlatList
              data={productData.images.nodes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => String(index)}
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
              productData.priceRangeV2.minVariantPrice.amount
            ).toFixed(2)} ${
              productData.priceRangeV2.minVariantPrice.currencyCode
            }`}
          </Text>

          <Text style={styles.title}>{productData.title}</Text>

          {productData.variants.nodes.length > 0 && (
            <View style={styles.detailBox}>
              {renderDetail(
                "Weight",
                `${productData.variants.nodes[0].weight} ${productData.variants.nodes[0].weightUnit}`
              )}
              {productData.variants.nodes[0].inventoryItem.inventoryLevels &&
                renderInventoryLocation(
                  productData.variants.nodes[0].inventoryItem.inventoryLevels
                )}
            </View>
          )}

          {productData.metafields.nodes.length > 0 && (
            <View style={styles.metafieldBox}>
              {productData.metafields.nodes.map((metafield, index) => (
                <View key={index} style={styles.metafieldRow}>
                  <Text style={styles.metafieldName}>{metafield.key}:</Text>
                  <Text style={styles.metafieldValue}>{metafield.value}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.addToCartButton}>
            <Pressable>
              <Text style={styles.addToCartText}>Add to cart</Text>
            </Pressable>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <HTMLView value={productData.descriptionHtml} />
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
    marginBottom: 30,
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
    marginTop: 20,
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
  detailBox: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginRight: 5,
    fontSize: "18px",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontSize: "18px",
  },
  metafieldBox: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginVertical: 10,
  },
  metafieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  metafieldName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginRight: 5,
    fontSize: "18px",
  },
  metafieldValue: {
    fontSize: 16,
    color: "#333",
    fontSize: "18px",
  },
});
