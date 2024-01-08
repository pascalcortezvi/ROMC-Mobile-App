// CreateAccountScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    addresses: [
      {
        /* address fields */
      },
    ],
  });

  const handleCheckUser = async () => {
    try {
      const response = await fetch(
        "https://us-central1-romc-mobile-app.cloudfunctions.net/checkUserExists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        if (data.exists) {
          setIsExistingUser(true);
          setAdditionalInfo({ ...data.userInfo }); // Set existing user info
        } else {
          // Proceed to collect additional information
          setIsExistingUser(false);
        }
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const response = await fetch(
        "https://us-central1-romc-mobile-app.cloudfunctions.net/createAccount-createAccount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Handle successful account creation
        Alert.alert(
          "Account Created",
          "Your account has been successfully created."
        );
        navigation.navigate("LoginScreen"); // Redirect to login after account creation
      } else {
        // Handle errors
        Alert.alert(
          "Account Creation Failed",
          data.customerUserErrors.map((e) => e.message).join(", ")
        );
      }
    } catch (error) {
      console.error("Account Creation Error:", error);
      Alert.alert(
        "Error",
        "An error occurred while creating the account. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {!isExistingUser && (
        <View>
          <Text>YES</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#ECECEC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#AFAFAF",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#D80000",
    borderRadius: 10,
    marginBottom: 20,
  },
  CreateAccountButton: {
    width: "50%",
    padding: 15,
    backgroundColor: "#D80000",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  authStatusText: {
    fontSize: 18,
    color: "green",
    marginTop: 10,
  },
  staffText: {
    fontSize: 16,
    color: "blue",
    marginTop: 5,
  },
  tagStatusText: {
    fontSize: 18,
    color: "black",
    marginTop: 10,
  },
});
