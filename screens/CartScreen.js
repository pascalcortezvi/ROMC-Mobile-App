import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  useEffect(() => {
    loadCart();
  }, [isFocused]);

  const loadCart = async () => {
    setRefreshing(true); // Start the spinner
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error("Failed to fetch cart from storage.");
    } finally {
      setRefreshing(false);
    }
  };

  const removeItemFromCart = async (productId) => {
    try {
      const cart = cartItems.filter((item) => item.productId !== productId);
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
      setCartItems(cart);
    } catch (error) {
      console.error("Error removing item from cart: ", error);
      Alert.alert("Error", "Could not remove item from cart.");
    }
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cartItems.map((item) => {
      if (item.productId === productId && item.quantity > 1) {
        return {
          ...item,
          quantity: item.quantity - 1,
        };
      }
      return item;
    });
    setCartItems(updatedCart);
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price);

      if (!isNaN(price)) {
        return total + price * item.quantity;
      }

      return total;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const storedCart = await AsyncStorage.getItem("cart");
      const cartItems = storedCart ? JSON.parse(storedCart) : [];

      const lineItems = cartItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const checkoutFunctionUrl =
        "https://us-central1-romc-mobile-app.cloudfunctions.net/createCheckout-createCheckout";

      // Make the request to your Firebase function
      const response = await fetch(checkoutFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems: lineItems }), // Send the lineItems as 'cartItems'
      });

      const jsonResponse = await response.json();
      if (jsonResponse.url) {
        // Redirect user to Shopify checkout using the returned URL
        Linking.openURL(jsonResponse.url);
      } else {
        // Handle cases where no URL is returned
        Alert.alert("Error", "Unable to proceed to checkout.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      Alert.alert("Error", "An error occurred while trying to checkout.");
    }
  };

  // Check if the cart is empty
  const isCartEmpty = cartItems.length === 0;

  return (
    <View style={styles.container}>
      {isCartEmpty ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartMessage}>
            Your cart is currently empty
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
                <View style={styles.quantityAndRemoveContainer}>
                  <View style={styles.quantitySelector}>
                    <Pressable onPress={() => decreaseQuantity(item.productId)}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <Pressable onPress={() => increaseQuantity(item.productId)}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeItemFromCart(item.productId)}>
                    <Text style={styles.removeButtonText}>
                      <Icon name="trash" size={24} color="#131313" />
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={loadCart}
          style={{ marginBottom: 100 }} // Ensure there's room for the checkout section
        />
      )}
      {!isCartEmpty && (
        <View style={styles.checkoutContainer}>
          <Text style={styles.totalTitle}>
            Total: ${calculateTotalPrice().toFixed(2)}
          </Text>
          <Text style={styles.tax}>Taxes will be calculated at checkout</Text>
          <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>CHECKOUT</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECECEC",
    paddingTop: 15,
    paddingBottom: 64,
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 25,
    paddingRight: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  imageContainer: {
    marginRight: 10,
    width: 120,
    height: 120,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
  },
  price: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    marginTop: 10,
  },
  quantityAndRemoveContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D8D8D8",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  quantityButtonText: {
    padding: 10,
    fontWeight: "bold",
  },
  quantity: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontWeight: "bold",
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  checkoutButton: {
    backgroundColor: "#131313",
    padding: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCartMessage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tax: {
    marginBottom: 15,
  },
});
