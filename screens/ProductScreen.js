import React, { useState, useEffect, useContext, useRef } from "react";
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
  Animated,
} from "react-native";
import HTMLView from "react-native-htmlview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BringButton from "../components/BringButton";
import { UserContext } from "../contexts/UserContext";

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [productData, setProductData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [compareAtPrice, setCompareAtPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState("");
  const [variantId, setVariantId] = useState(null);


  const { user } = useContext(UserContext);

  const url = `https://us-central1-romc-mobile-app.cloudfunctions.net/productDetails-productDetails?productId=${productId}`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const data = await response.json();
        setProductData(data.data.product);
        setCompareAtPrice(
          data.data.product.compareAtPriceRange?.minVariantCompareAtPrice
            ?.amount
        ); // set compare at price
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
      console.error("Invalid price for the product.");
      return;
    }

    const newCartItem = {
      productId: productData.id,
      title: productData.title,
      price,
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
            <View style={styles.priceContainer}>
              {compareAtPrice && (
                <Text style={styles.compareAtPrice}>
                  ${parseFloat(compareAtPrice).toFixed(2)}
                </Text>
              )}
              <Text style={styles.price}>
                $
                {parseFloat(
                  productData.priceRangeV2.minVariantPrice.amount
                ).toFixed(2)}{" "}
                {productData.priceRangeV2.minVariantPrice.currencyCode}
              </Text>
            </View>

            <View style={styles.availabilityContainer}>
              <View style={styles.blocksContainer}>
                <View style={styles.inStoreContainer}>
                  <Text style={styles.blockTitle}>In-Store</Text>
                  <View style={styles.availabilityStatus}>
                    {productData.tags &&
                    productData.tags.includes("in-stock") ? (
                      <>
                        <Animated.View
                          style={{ ...styles.blinkingDot, opacity: blinkAnim }}
                        />
                        <Text style={styles.availableText}>Available</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.notAvailableText}>
                          Not Available
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.onlineContainer}>
                  <Text style={styles.blockTitle}>Online</Text>
                  <View style={styles.availabilityStatus}>
                    <Animated.View
                      style={{ ...styles.blinkingDot, opacity: blinkAnim }}
                    />
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                </View>
              </View>
            </View>

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
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 15,
    textAlign: "center",
  },
  price: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  availabilityContainer: {
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center", // Center the title
  },
  blocksContainer: {
    flexDirection: "row",
    width: "100%",
  },
  inStoreContainer: {
    flex: 1,
    alignItems: "center",
    // Ensure padding is not too large, especially the vertical padding
    padding: 15,
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#131313",
    marginHorizontal: 5,
  },
  onlineContainer: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#131313",
    marginHorizontal: 5,
    justifyContent: "center",
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    color: "white",
  },
  availabilityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  availabilityStatus: {
    flexDirection: "row",
    alignItems: "center",
    // Minimize or remove the top margin to reduce space between title and status
    marginTop: 2,
  },
  blinkingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6EDC7B",
    marginRight: 8,
  },
  availableText: {
    color: "#6EDC7B",
    fontSize: 15,
    fontWeight: "bold",
  },
  notAvailableText: {
    color: "#EC4343",
    fontSize: 15,
    fontWeight: "bold",
  },
  notInStockContainer: {
    color: "white", // Color for emphasis, adjust as needed
    backgroundColor: "#131313",
    borderRadius: 50,
  },
  notInStock: {
    fontSize: 15,
    fontWeight: "bold",
    marginRight: 10,
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
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 10,
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
    padding: 15,
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
  },
  quantityButton: {
    backgroundColor: "#D8D8D8",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  quantityButtonText: {
    fontSize: 24, // adjust as needed
    fontWeight: "bold",
  },
  quantity: {
    fontSize: 24, // adjust as needed
    fontWeight: "bold",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  compareAtPrice: {
    textDecorationLine: "line-through",
    color: "grey",
    fontSize: 18,
    marginRight: 8,
    marginBottom: 20,
  },
  price: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },
});
