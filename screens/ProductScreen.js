import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import HTMLView from "react-native-htmlview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BringButton from "../components/BringButton";

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState("");

  const url = `https://us-central1-romc-mobile-app.cloudfunctions.net/productDetails-productDetails?productId=${productId}`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const data = await response.json();
        setProductData(data.data.product);
        if (data.data.product.images.nodes.length > 0) {
          setSelectedImage(data.data.product.images.nodes[0].url);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const addToCart = async () => {
    const price = parseFloat(productData.priceRangeV2.minVariantPrice.amount);

    if (isNaN(price)) {
      // Handle the case where the price is not a valid number
      console.error("Invalid price for the product.");
      return;
    }

    const newCartItem = {
      productId: productData.id,
      title: productData.title,
      price, // Use the parsed price here
      image: selectedImage,
      quantity,
    };

    try {
      const cartStr = await AsyncStorage.getItem("cart");
      const cart = cartStr ? JSON.parse(cartStr) : [];
      const isItemInCart = cart.some(
        (item) => item.productId === newCartItem.productId
      );

      if (!isItemInCart) {
        cart.push(newCartItem);
        await AsyncStorage.setItem("cart", JSON.stringify(cart));
        setCartStatus("Item added to cart!");
      } else {
        setCartStatus("Item already in cart!");
      }
    } catch (error) {
      console.error("Error adding item to cart: ", error);
      Alert.alert("Error", "Could not add item to cart.");
    }
  };

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
      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#131313" />
        </View>
      ) : (
        productData && (
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

            <Text style={styles.title}>{productData.title}</Text>
            <Text style={styles.price}>
              $
              {parseFloat(
                productData.priceRangeV2.minVariantPrice.amount
              ).toFixed(2)}{" "}
              {productData.priceRangeV2.minVariantPrice.currencyCode}
            </Text>

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

            <BringButton productData={productData} />

            <View style={styles.quantitySelector}>
              <Pressable
                onPress={decreaseQuantity}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>
              <Text style={styles.quantity}>{quantity}</Text>
              <Pressable
                onPress={increaseQuantity}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>

            {!!cartStatus && (
              <Text style={styles.cartStatus}>{cartStatus}</Text>
            )}

            <Pressable style={styles.addToCartButton} onPress={addToCart}>
              <Text style={styles.addToCartText}>Add to cart</Text>
            </Pressable>

            <Text style={styles.descriptionTitle}>Description</Text>
            <HTMLView value={productData.descriptionHtml} />
          </>
        )
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
    marginTop: 50,
    marginBottom: 10,
    textAlign: "center",
  },
  price: {
    fontSize: 24,
    marginBottom: 20,
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
    fontSize: 18,
    color: "#333",
    marginRight: 5,
  },
  detailValue: {
    fontSize: 18,
    color: "#333",
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
    fontSize: 18,
    color: "#333",
    marginRight: 5,
  },
  metafieldValue: {
    fontSize: 18,
    color: "#333",
  },
  cartStatus: {
    marginTop: 10,
    color: "green", // Adjust color based on your design
    fontWeight: "bold",
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 20,
  },
  quantityButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 18, // adjust as needed
  },
  quantity: {
    fontSize: 18, // adjust as needed
  },
});
