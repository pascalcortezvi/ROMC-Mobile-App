import React, { useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";

export default function BringButton({ productData }) {
  const [quantity, setQuantity] = useState(1); // Quantity as a number
  const [loading, setLoading] = useState(false); // Loading state

  async function sendEmail() {
    setLoading(true); // Set loading to true when sending email

    const dataToSend = {
      ...productData,
      quantity, // Include the selected quantity
    };

    const functionURL =
      "https://us-central1-romc-mobile-app.cloudfunctions.net/sendEmail-sendEmail";

    try {
      const response = await fetch(functionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productData: dataToSend }),
      });

      if (response.ok) {
        Alert.alert(
          "Success",
          "WAREHOUSE will bring product(s) as soon as possible!"
        );
      } else {
        Alert.alert("Error", "Failed to send the email.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while sending the email.");
      console.error(error);
    } finally {
      setLoading(false); // Set loading back to false after processing
    }
  }

  function handlePress() {
    Alert.alert(
      "Are you sure?",
      `Do you want WAREHOUSE to bring ${quantity} of this product In-Store?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: sendEmail },
      ],
      { cancelable: false }
    );
  }

  function increaseQuantity() {
    setQuantity(quantity + 1);
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      // Ensuring the user doesn't select less than 1
      setQuantity(quantity - 1);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quantity Needed</Text>

      <View style={styles.quantitySelector}>
        <Pressable style={styles.quantityButton} onPress={decreaseQuantity}>
          <Text style={styles.quantityText}>-</Text>
        </Pressable>
        <Text style={styles.quantity}>{quantity}</Text>
        <Pressable style={styles.quantityButton} onPress={increaseQuantity}>
          <Text style={styles.quantityText}>+</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={styles.textButton}>I need this product in-store</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 240,
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  quantitySelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D8D8D8",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
  },
  quantity: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#D80000",
    padding: 20,
    borderRadius: 10,
    justifyContent: "center", // Center button text horizontally
    alignItems: "center", // Center button text vertically
  },
  textButton: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 240,
    padding: 30,
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: "white",
    borderRadius: 10,
  },
});
